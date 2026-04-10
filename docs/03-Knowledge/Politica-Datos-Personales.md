---
tags: [knowledge, legal, habeas-data, privacidad, datos-personales, colombia]
created: 2026-04-06
updated: 2026-04-06
status: listo-para-implementar
---

# 🔒 Política de Datos Personales — BorondoTours

> Este documento formaliza la política de tratamiento de datos personales de BorondoTours, en cumplimiento de la **Ley 1581 de 2012** (Habeas Data) y el **Decreto 1377 de 2013** de Colombia.

---

## 1. Responsable del tratamiento

- **Empresa:** BorondoTours S.A.S. (o la razón social que aplique)
- **NIT:** Pendiente de registro
- **Correo de contacto para datos:** proteccion.datos@borondotours.com
- **Dirección de notificaciones:** [Dirección fiscal de la empresa]
- **Oficial de Protección de Datos (DPO):** SUPER_ADMIN designado

---

## 2. Finalidades del tratamiento

### 2.1 Datos de Viajeros (Clientes B2C)

| Dato | Finalidad | Base legal | Retención |
|---|---|---|---|
| Nombre, email, teléfono | Gestión de reservas, comunicación operativa | Ejecución del contrato | Vigente mientras tenga cuenta activa |
| Documento de identidad (CC/CE/Pasaporte) | Manifiesto operativo, cumplimiento Ley de Turismo | Obligación legal | 5 años post-último tour |
| Contacto de emergencia | Seguridad del pasajero en campo | Interés legítimo + consentimiento | Vigente mientras tenga reservas activas |
| Condiciones médicas | Seguridad y adaptación del servicio | Consentimiento explícito (dato sensible) | Se elimina 30 días después del tour |
| Historial de compras (UserStats) | Programa de lealtad, personalización | Ejecución del contrato + consentimiento | Vigente mientras tenga cuenta activa |
| Foto de pasaporte (exención IVA) | Cumplimiento fiscal — exención IVA para extranjeros | Obligación legal (DIAN) | 5 años (plazo fiscal colombiano) |
| IP, User Agent | Seguridad, prevención de fraude | Interés legítimo | 90 días |

### 2.2 Datos de Operadores (B2B)

| Dato | Finalidad | Base legal | Retención |
|---|---|---|---|
| Razón social, NIT, RNT | Verificación del proveedor, cumplimiento tributario | Obligación legal + Ejecución del contrato | Indefinida (obligación tributaria) |
| RUT, Cámara de Comercio | Verificación documental | Obligación legal | S3: Active → Deep Glacier 15 días post-verificación |
| Cédula representante legal | Verificación de identidad | Obligación legal | S3: Active → Deep Glacier 15 días post-verificación |
| Datos bancarios (liquidaciones) | Ejecución de pagos (payouts) | Ejecución del contrato | Vigente mientras el contrato esté activo |

### 2.3 Datos de Empleados/Guías (OPERATOR_GUIDE, OPERATOR_DRIVER)

| Dato | Finalidad | Base legal | Retención |
|---|---|---|---|
| Nombre, teléfono, email | Asignación operativa, comunicación | Ejecución del contrato laboral | Vigente mientras esté activo |
| Ubicación GPS (durante tour) | Tracking en tiempo real para coordinación | Consentimiento explícito | 30 días post-tour |
| Título profesional de guía | Verificación de cualificación | Obligación legal (Ley General de Turismo) | Vigente mientras esté activo |

---

## 3. Mecanismos de consentimiento

### 3.1 Consentimiento en registro (B2C)

- [ ] Al registrarse, el usuario debe marcar un checkbox explícito: _"Autorizo a BorondoTours al tratamiento de mis datos personales conforme a la [Política de Privacidad](link)"_
- [ ] El consentimiento NO puede estar pre-marcado
- [ ] Se registra: `consent_given_at`, `consent_ip`, `consent_version` en tabla `UserConsents`
- [ ] Link visible a la política de privacidad completa (página pública)

### 3.2 Consentimiento especial para datos sensibles

- [ ] Condiciones médicas: checkbox separado con texto: _"Autorizo el tratamiento de mis datos de salud exclusivamente para garantizar mi seguridad durante el tour"_
- [ ] Datos biométricos (foto de pasaporte): checkbox con texto: _"Autorizo la captura de mi pasaporte exclusivamente para la exención de IVA conforme a la ley colombiana"_

### 3.3 Consentimiento de operadores (B2B)

- [ ] Al completar el onboarding, el operador acepta los Términos y Condiciones del Marketplace
- [ ] Incluye cláusula de protección de datos de los pasajeros que gestione
- [ ] El operador actúa como **Encargado del Tratamiento** de los datos de pasajeros que le comparten vía manifiesto

---

## 4. Derechos del titular (ARCO+)

> **ARCO** = Acceso, Rectificación, Cancelación, Oposición + portabilidad

### 4.1 Implementación técnica

| Derecho | Cómo se ejerce | Plazo legal | Implementación |
|---|---|---|---|
| **Acceso** | Perfil del cliente → "Mis datos" | 10 días hábiles | Autoservicio: el usuario puede ver todos sus datos |
| **Rectificación** | Editar perfil | 15 días hábiles | Autoservicio: campos editables en el perfil |
| **Cancelación** | Solicitud vía email o formulario PQRS | 15 días hábiles | SUPER_ADMIN anonimiza datos (no elimina, por trazabilidad fiscal) |
| **Oposición** | Desuscripción de marketing + solicitud formal | 10 días hábiles | Toggle en perfil para marketing; PQRS para datos generales |
| **Portabilidad** | Solicitud vía PQRS | 15 días hábiles | Export JSON con todos los datos del usuario (GDPR-ready) |

### 4.2 Proceso de eliminación/anonimización

- [ ] Al solicitar cancelación, el SUPER_ADMIN ejecuta el proceso:
  1. Verificar que no haya bookings futuros activos
  2. Anonimizar datos PII: `first_name = 'ANON'`, `email = 'deleted_{uuid}@anon.borondotours.com'`
  3. Conservar datos fiscales (bookings, facturas) con PII anonimizada → 5 años
  4. Eliminar de Meilisearch el perfil indexado
  5. Revocar tokens JWT activos
  6. Registrar en `DataDeletionLog`

---

## 5. Seguridad técnica (ADR-006)

### 5.1 Encriptación

- [ ] **En tránsito:** TLS 1.3 obligatorio para todas las conexiones
- [ ] **En reposo (PII):** Campos sensibles encriptados con AES-256 a nivel de columna:
  - `document_number`
  - `phone_primary`, `phone_secondary`
  - `emergency_contact_phone`
  - `medical_conditions`
- [ ] **S3:** Server-Side Encryption (SSE-S3) habilitado en todos los buckets

### 5.2 Control de acceso a datos

- [ ] Los datos de un operador SOLO son visibles por usuarios con su mismo `operator_id` (RLS o middleware)
- [ ] Los datos médicos de pasajeros SOLO son visibles por el guía asignado y el OPERATOR_COORD
- [ ] El SUPER_ADMIN puede ver todo pero sus accesos quedan registrados en `AdminAuditLog`
- [ ] El Ghost Login NO puede acceder a datos de pago ni ejecutar transacciones reales

### 5.3 Gestión de S3 para documentos legales

```
Ciclo de vida de documentos legales en S3:
  Día 0:     Operador sube documento → S3 Standard (bucket privado, no público)
  Día 0-15:  Documento disponible para revisión por SUPER_ADMIN
  Día 15+:   Post-verificación → transición automática a S3 Deep Glacier
             - S3 lifecycle rule: prefix 'verified/' → Glacier Deep Archive después de 15 días
             - Para acceder: solicitar restauración (12-48h)
  
  Retención: Indefinida (obligación tributaria y contractual)
```

---

## 6. Tabla de modelo de datos de privacidad

```
UserConsents
  - id: uuid (PK)
  - user_id: uuid FK
  - consent_type: enum (PRIVACY_POLICY, MARKETING, MEDICAL_DATA, PASSPORT_DATA)
  - consent_version: string              ← versión del documento aceptado
  - given_at: timestamp
  - revoked_at: timestamp | null
  - ip_address: string
  - user_agent: string

DataDeletionLog
  - id: uuid (PK)
  - user_id: uuid FK
  - requested_at: timestamp
  - executed_at: timestamp | null
  - executed_by: uuid FK | null
  - data_categories_deleted: jsonb       ← ['PII', 'MEDICAL', 'MARKETING']
  - retention_items: jsonb               ← items retenidos por obligación legal
  - reason: text
```

---

## 7. Aviso de privacidad (resumen para la UI)

> Este texto debe mostrarse en el formulario de registro y en la página de Política de Privacidad.

**Versión resumida (checkbox del registro):**
_"Autorizo a BorondoTours S.A.S. al tratamiento de mis datos personales conforme a la Ley 1581 de 2012. Mis datos serán utilizados para gestionar reservas de tours, comunicación operativa y el programa de lealtad Borondo Coins. Conozco mis derechos de acceso, rectificación, cancelación y oposición, que puedo ejercer escribiendo a proteccion.datos@borondotours.com."_

---

## Links relacionados
- [[../01-Specs/Spec-F-Auth]] — RF-F02b (Onboarding de operadores)
- [[../01-Specs/Spec-D-Client-Portal]] — Gestión de datos del cliente
- [[../02-ADRs/ADR-006-Seguridad-PII]] — Decisión técnica de encriptación
- [[Modelo-Datos-Core]] — Tablas de referencia
