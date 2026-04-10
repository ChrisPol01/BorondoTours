---
tags: [spec, requerimientos, {{tags-extra}}]
created: {{fecha}}
updated: {{fecha}}
status: borrador
kiro-spec: .kiro/specs/{{nombre-feature}}.md
---

# 📋 Spec — {{nombre-feature}}

> **⚠️ INSTRUCCIÓN ESTRICTA PARA IA (Kiro, Claude, Gemini):**
> Esta especificación separa el negocio de la implementación técnica. Cuando se te pida escribir código para esta Spec, **SIEMPRE debes preguntar primero en qué capa específica (Frontend, Backend, Base de Datos o Infraestructura) nos vamos a enfocar**. No asumas ni generes código de múltiples capas a la vez a menos que se te ordene explícitamente.

---

## 1. Reglas de Negocio y Dominio (El "Qué" y "Por qué")
> *Contexto puro de BorondoTours, sin mencionar tecnologías.*
{{Explicación general de la regla de negocio. Ej: "Los extranjeros están exentos de IVA si presentan pasaporte."}}

---

## 2. Requerimientos Funcionales (La experiencia del usuario)

### RF-001 — {{nombre-requerimiento}}
- **Como** {{tipo-usuario}}
- **Quiero** {{accion}}
- **Para** {{beneficio}}

**Criterios de aceptación:**
- [ ] {{criterio-1}}
- [ ] {{criterio-2}}

---

## 3. Requerimientos No Funcionales

| ID | Categoría | Descripción | Métrica |
|---|---|---|---|
| RNF-001 | Performance | {{descripcion}} | {{metrica}} |
| RNF-002 | Seguridad | {{descripcion}} | {{metrica}} |

---

## 4. Mapeo Técnico por Capas (El "Cómo")
> *Diseño técnico y decisiones de implementación exclusivas para esta Spec.*

### 4.1. Base de Datos (Modelado)
> *Nota: Validar siempre contra el Modelo de Datos Core.*
- **Tablas existentes afectadas:** {{ej: Bookings, Users}}
- **Nuevas tablas/columnas propuestas:** {{ej: agregar `passport_s3_key` a Bookings}}
- **Consideraciones:** {{ej: índices necesarios, restricciones unique}}

### 4.2. Backend / API
- **Endpoint:** `{{METHOD}} /{{ruta}}`
- **Input esperado:** `{{descripcion o DTO}}`
- **Output esperado:** `{{descripcion o DTO}}`
- **Lógica principal:** {{Breve paso a paso de las validaciones y servicios a llamar}}
- **Autorización:** {{Roles permitidos según RBAC}}

### 4.3. Frontend / UI
- **Ruta/Pantalla:** `/{{ruta-web-o-app}}`
- **Componentes clave a crear/modificar:** {{ej: ModalUploadDocument, IVA_Calculator}}
- **Gestión de estado:** {{ej: Mutación en TanStack Query, actualización en Zustand}}

### 4.4. Infraestructura y Servicios Cloud
- **Servicios implicados:** {{ej: Bucket S3 privado para pasaportes, Presigned URLs}}
- **Variables de entorno requeridas:** `{{NOMBRES_VARIABLES}}`

---

## 5. Flujos alternativos y manejo de errores

| Escenario | Condición | Resultado esperado |
|---|---|---|
| {{escenario}} | {{condicion}} | {{resultado}} |

---

## 6. Dependencias y Riesgos

| Dependencia | Tipo | Impacto |
|---|---|---|
| {{dependencia}} | Externa/Interna | Alto/Medio/Bajo |

---
