# Sistema de Impuestos - Arquitectura Técnica

## Resumen

El sistema de impuestos de EVA no realiza cálculos tributarios autónomos. Opera como un orquestador que:

1. Determina qué impuestos aplican según el tipo de servicio facturado
2. Envía los identificadores de impuesto al sistema contable externo (Siigo)
3. Siigo calcula los valores oficiales y retorna la factura con montos definitivos
4. EVA persiste el resultado para trazabilidad

---

## Modelo de Datos

### Tabla `taxes`

Catálogo maestro de impuestos disponibles.

```sql
CREATE TABLE taxes (
    id smallserial PRIMARY KEY,
    country_id smallint NOT NULL,        -- FK → countries
    status_id smallint NOT NULL,         -- FK → statuses
    unit varchar(3) NOT NULL,            -- "per" (porcentaje decimal)
    value numeric(4,4) NOT NULL,         -- ej: 0.0350, 0.1900
    name varchar(50) NOT NULL,           -- ej: "Retefuente 3.5%"
    code varchar(10) NOT NULL,           -- código en sistema contable externo
    description varchar(250) NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    deleted_at timestamptz,
    UNIQUE (country_id, name)
);
```

### Tabla `service_taxes`

Tabla pivote que vincula servicios con impuestos aplicables (relación N:M).

```sql
CREATE TABLE service_taxes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id smallint NOT NULL,          -- FK → partners
    partner_service_id smallint NOT NULL,   -- FK → partner_services
    tax_id smallint NOT NULL,              -- FK → taxes
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    deleted_at timestamptz,
    FOREIGN KEY (partner_id) REFERENCES partners(id),
    FOREIGN KEY (partner_service_id) REFERENCES partner_services(id),
    FOREIGN KEY (tax_id) REFERENCES taxes(id)
);
```

### Tabla `invoices` (campos relevantes)

```sql
CREATE TABLE invoices (
    ...
    subtotal_value numeric(14,4),   -- suma de precios sin impuesto
    tax_value numeric(14,4),        -- total de impuestos calculados
    total_value numeric(14,4),      -- neto final
    ...
);
```

---

## Datos Seed (Configuración Inicial)

### Impuestos registrados

| ID | Nombre | Valor | Código Siigo | Descripción |
|----|--------|-------|--------------|-------------|
| 1 | Retefuente 3.5% | 0.035 | 2043 | Retención en la fuente 3.5% |
| 2 | IVA 19% | 0.19 | 2026 | Impuesto al valor agregado 19% |

### Mapeo servicio → impuestos

| Servicio | Tipo | Código | Impuestos (tax_id) |
|----------|------|--------|-------------------|
| COMPUTACIÓN EN LA NUBE | AWS | 7 | [1] → Solo Retefuente |
| CONSULTORÍA AWS | AWS | 6 | [1, 2] → Retefuente + IVA |
| SOPORTE AWS | AWS | 4 | [1, 2] → Retefuente + IVA |
| CONSULTORIA WEB | WEB | 3 | [1, 2] → Retefuente + IVA |
| PATROCINIO EVENTO | AWS | 10 | [2] → Solo IVA |
| MARKETING DIGITAL | MARKETING | 8 | [2] → Solo IVA |
| SUMINISTRO PAGINAS WEB | WEB | 9 | [1] → Solo Retefuente |

### Lógica de exclusión de IVA

Los servicios de computación en la nube están **excluidos de IVA** según:
- Artículo 476 del Estatuto Tributario colombiano
- Modificado por Ley 2010 de 2019
- Concepto 21: "Suministro de páginas web, servidores (hosting), computación en la nube (cloud computing)"

---

## Flujo de Facturación con Impuestos

### Diagrama de alto nivel

```
┌─────────────┐     ┌───────────────┐     ┌─────────┐     ┌──────────────┐
│ set_invoice │────▶│  SQS Queue    │────▶│  Step   │────▶│ accounting   │
│ (Lambda)    │     │               │     │Function │     │ _system      │
└─────────────┘     └───────────────┘     └─────────┘     │ (Lambda)     │
                                                           └──────┬───────┘
                                                                  │
                                                                  ▼
                                                           ┌──────────────┐
                                                           │  Siigo API   │
                                                           │ (Contable)   │
                                                           └──────────────┘
```

### Step Function (`invoice_generation.asl.json`)

```
Create Invoice → Create OnePay Link → Update Invoice
       │                  │                    │
       ▼                  ▼                    ▼
  Retry on 500/429   Retry on timeout    Retry on error
  (wait 180s)        (wait 60s)          (wait 60s)
```

---

## Input / Output por componente

### 1. `set_invoice.py` — Generador de factura

**Responsabilidad**: Construir el payload de factura con impuestos y enviarlo a la cola SQS.

**Input** (event):
```json
{
  "partner_id": 1,
  "name": "CLIENTE SAS",
  "date": "2025-11-01",
  "trm": 3779.2,
  "trm_id": "uuid-exchange-rate",
  "service": 7,
  "service_id": 1,
  "taxes": [
    { "code": "2043", "value": 0.035, "name": "Retefuente 3.5%" }
  ],
  "consumption": [
    { "id": "539247470494", "price": 2886.31, "cost": 2334.64, "total": 2886.31 },
    { "id": "876669069627", "price": 5399.29, "cost": 4994.80, "total": 5399.29 }
  ]
}
```

**Lógica de cálculo** (función `get_items()`):

```python
def get_items(items, trm, service, taxes, consumption_date):
    for item in items:
        # 1. Convertir USD → COP usando TRM
        item_cop = round(item['total'] * trm, -3)  # redondeo a miles

        # 2. Construir item con IDs de impuesto para Siigo
        items_body.append({
            "code": service,
            "quantity": 1,
            "price": item_cop,
            "taxes": [{"id": int(tax['code'])} for tax in taxes]
        })

        # 3. Calcular neto local (precio - retenciones)
        total_with_tax += item_cop - sum(item_cop * tax['value'] for tax in taxes)
    
    return {
        "items": items_body,
        "sub_total": total_price,     # suma de precios en COP
        "total": total_with_tax,      # neto después de retenciones
        "total_usd": total_usd
    }
```

**Output** (mensaje SQS):
```json
{
  "action": "create_invoice",
  "name": "CLIENTE SAS",
  "state": "invoice-generation",
  "invoice": {
    "document": { "id": 28162 },
    "date": "2025-12-03",
    "customer": { "identification": "900700659" },
    "cost_center": 1011,
    "seller": 98,
    "observations": "TRM ... Excluido de IVA ...",
    "items": [
      {
        "code": "7",
        "quantity": 1,
        "price": 10908000,
        "taxes": [{ "id": 2043 }]
      }
    ],
    "payments": [{ "id": "866", "value": 30217045, "due_date": "2026-01-03" }]
  },
  "metadata": {
    "partner_id": 1,
    "company_id": "uuid",
    "source_currency_id": 1,
    "target_currency_id": 2,
    "exchange_rate_id": "uuid",
    "partner_service_id": 1,
    "period_start": "2025-11-01"
  },
  "consumption": [...]
}
```

---

### 2. `accounting_system/handler.py` — Interfaz con Siigo

**Responsabilidad**: Enviar la factura a Siigo y persistir el resultado en BD.

**Input**: El mensaje SQS anterior (event).

**Interacción con Siigo**:
- Envía items con `taxes: [{"id": 2043}]` → Siigo aplica Retefuente 3.5%
- Siigo retorna la factura con los valores de impuesto calculados

**Output de Siigo** (ejemplo):
```json
{
  "id": "2ea67ebc-...",
  "prefix": "IE",
  "number": 1434,
  "total": 1218795.0,
  "balance": 0.0,
  "items": [
    {
      "price": 1246000.0,
      "taxes": [
        {
          "id": 2043,
          "name": "Retefuente 3.5%",
          "type": "Retefuente",
          "percentage": 3.5,
          "value": 43610.0
        }
      ],
      "total": 1202390.0
    }
  ]
}
```

**Persistencia en BD**:
```python
invoice_database = {
    'subtotal_value': sum(item['price'] for item in event['invoice']['items']),
    'tax_value': sum(
        sum(tax['value'] for tax in item['taxes'])
        for item in invoice.invoice['items']
    ),
    'total_value': invoice.invoice['total'],
    'balance_value': invoice.invoice['balance']
}
```

---

## Herramientas y Servicios Externos

| Componente | Tecnología | Rol |
|-----------|------------|-----|
| Compute | AWS Lambda (Python 3.x) | Lógica de negocio |
| Orquestación | AWS Step Functions | Coordina el flujo de facturación |
| Cola | Amazon SQS | Desacoplamiento entre generación y creación |
| Base de datos | PostgreSQL (RDS) | Persistencia |
| ORM | SQLAlchemy | Mapeo objeto-relacional |
| Sistema contable | Siigo API | Cálculo oficial de impuestos, facturación electrónica |
| Secretos | AWS Secrets Manager | Credenciales Siigo |

---

## Catálogo de impuestos en Siigo (referencia)

El sistema contable tiene un catálogo mucho más amplio disponible:

| Tipo | Tarifas disponibles |
|------|-------------------|
| **IVA** | 0%, 5%, 19% |
| **Retefuente** | 1%, 2%, 2.5%, 3.5%, 4%, 6%, 7%, 10%, 11%, 20% |
| **ReteICA** | 0.8‰, 4.14‰, 6.6‰, 7‰, 7.7‰, 8.66‰, 9.66‰, 10‰, 13.8‰ |
| **ReteIVA** | 15% |
| **Impoconsumo** | 8%, por valor |

### Manejo de ReteICA

El ReteICA **no se calcula en EVA**. Se controla mediante:
1. Flag `"reteica": true/false` en el tipo de documento de Siigo
2. Siigo aplica la tarifa según la actividad económica del tercero
3. EVA no interviene en este cálculo

---

## Estructura de archivos relevantes

```
eva/
├── 0_infrastructure/
│   └── state_machines/
│       └── invoice_generation.asl.json        # Orquestación Step Function
├── 1_data/
│   ├── migrations/
│   │   └── operations/
│   │       └── 1.0-init_data_model.sql        # DDL de tablas (taxes, service_taxes)
│   ├── scripts/
│   │   └── db_mapped_classes.py               # ORM: Taxes, Service_taxes
│   └── examples/
│       ├── invoice.json                        # Ejemplo de factura de Siigo
│       └── siigo/
│           ├── siigo_catalogos/impuestos.json  # Catálogo completo Siigo
│           └── siigo_document_types/factura_venta.json  # Config reteica/reteiva
└── 2_application/
    └── back/src/operations/
        ├── billing/
        │   ├── invoicing_system/
        │   │   └── set_invoice.py             # Generación + cálculo local
        │   └── accounting_system/
        │       └── handler.py                 # Interfaz Siigo + persistencia
        ├── seeding/
        │   └── load_database/
        │       ├── data/config.json           # Seed: taxes, service→taxes mapping
        │       └── loaders/taxes.py           # Loader de impuestos a BD
        └── syncing/
            └── accounting_sync/
                └── src/invoices.py            # Sincronización de facturas
```

---

## Consideraciones para replicar en otro proyecto

1. **Separación de responsabilidades**: El sistema propio solo decide QUÉ impuestos aplican. El CUÁNTO lo calcula el sistema contable.

2. **Configuración por servicio, no por cliente**: Los impuestos se asignan a servicios. Un cliente recibe los impuestos según el servicio que se le factura.

3. **Idempotencia**: Se usa un `idempotency_key` en las llamadas a Siigo para evitar facturas duplicadas en reintentos.

4. **Manejo de moneda**: Los precios base están en USD. La conversión a COP se hace con la TRM del día 8 del mes siguiente al consumo.

5. **Exclusión legal**: Si un servicio está excluido de un impuesto (como IVA en cloud computing), se documenta en el campo `observations` de la factura con la referencia legal.

6. **Retry pattern**: La Step Function maneja reintentos automáticos para errores 500/429 del sistema contable con waits exponenciales.
