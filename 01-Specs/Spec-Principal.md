---
tags: [spec, requerimientos]
created: {{fecha}}
updated: {{fecha}}
status: borrador
kiro-spec: .kiro/specs/{{nombre-feature}}.md
---

# 📋 Spec Principal — {{nombre-proyecto}}

> Esta spec es la fuente de verdad para Kiro IDE.  
> Archivo Kiro vinculado: `.kiro/specs/{{nombre-feature}}.md`

---

## 1. Descripción general

{{descripcion-general}}

---

## 2. Requerimientos funcionales

### RF-001 — {{nombre-requerimiento}}
- **Como** {{tipo-usuario}}
- **Quiero** {{accion}}
- **Para** {{beneficio}}

**Criterios de aceptación:**
- [ ] {{criterio-1}}
- [ ] {{criterio-2}}

### RF-002 — {{nombre-requerimiento}}
- **Como** {{tipo-usuario}}
- **Quiero** {{accion}}
- **Para** {{beneficio}}

**Criterios de aceptación:**
- [ ] {{criterio-1}}
- [ ] {{criterio-2}}

---

## 3. Requerimientos no funcionales

| ID | Categoría | Descripción | Métrica |
|---|---|---|---|
| RNF-001 | Performance | {{descripcion}} | {{metrica}} |
| RNF-002 | Seguridad | {{descripcion}} | {{metrica}} |
| RNF-003 | Escalabilidad | {{descripcion}} | {{metrica}} |

---

## 4. Flujo principal (happy path)

1. {{paso-1}}
2. {{paso-2}}
3. {{paso-3}}

---

## 5. Flujos alternativos y errores

| Escenario | Condición | Resultado esperado |
|---|---|---|
| {{escenario}} | {{condicion}} | {{resultado}} |

---

## 6. Modelo de datos (borrador)

```
{{entidad-1}}
  - id: uuid
  - {{campo}}: {{tipo}}

{{entidad-2}}
  - id: uuid
  - {{campo}}: {{tipo}}
```

---

## 7. APIs / Interfaces

### Endpoint: `{{METHOD}} /{{ruta}}`
- **Input:** `{{descripcion}}`
- **Output:** `{{descripcion}}`
- **Errores:** `{{codigos}}`

---

## 8. Dependencias y riesgos

| Dependencia | Tipo | Impacto |
|---|---|---|
| {{dependencia}} | Externa/Interna | Alto/Medio/Bajo |

---

## Links relacionados
- [[../00-Inicio/Vision-y-Objetivos]]
- [[../02-ADRs/ADR-Index]]
- [[../03-Knowledge/]]
