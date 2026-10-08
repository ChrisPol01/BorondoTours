---
inclusion: always
---
# Flujo de trabajo

0. **Estado**: consulta el steering 17 para saber qué existe en código vs sólo en docs.
1. **Leer** el Spec relevante y sus criterios de aceptación (`docs/01-Specs/`).
2. **Planificar**: tablas del Core, módulos afectados, ADRs; preguntar ante ambigüedad.
3. **Implementar** incrementalmente: schema/DTO → backend → frontend; happy path y luego edge cases.
4. **Verificar** (quality gates) y actualizar docs.

Tamaños: S (1-3 archivos), M (4-8), L (9-15), XL (15+, dividir en PRs).
Bugs: reproducir, causa raíz, fix mínimo, test de regresión.
Refactor: justificar, preservar comportamiento, pasos pequeños.

Docs vivas: tabla nueva → `Modelo-Datos-Core.md`; decisión técnica → ADR; cambio de requerimiento → Spec; patrón repetido 3+ veces → helper.
No sobre-optimizar, no abstraer problemas inexistentes, no cambiar convenciones sin discusión.
Red flags: funciones >50 líneas, >3 niveles de anidación, sin tests financieros, N+1, valores hardcodeados.