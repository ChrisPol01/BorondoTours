---
inclusion: always
---
# Quality gates

Antes de dar una tarea por terminada:
- Compila y lint sin errores; sin `any` ni `console.log` nuevos.
- Tests pasan; obligatorios para finanzas, RBAC, validaciones y máquinas de estado.
- Seguridad: inputs validados, sin PII ni secretos en logs/código, tenant isolation, HTML solo vía SafeHtml.
- Accesibilidad (WCAG 2.1 AA): labels, alt, focus trap en modales, contraste ≥4.5:1, teclado completo.
- Documentación: Swagger/OpenAPI en endpoints, Core/ADR/Spec actualizados si cambian.
- Cumple todos los criterios de aceptación del Spec; si no, documentar por qué.