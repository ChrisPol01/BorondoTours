---
inclusion: always
---
# Estándares de código

- Identificadores en inglés; comentarios de reglas de negocio en español. Un archivo, una responsabilidad; funciones ≤50 líneas.
- TypeScript strict, sin `any`. Sin librerías fuera del stack sin discusión.
- Frontend: componentes funcionales, Tailwind con tokens semánticos (sin hex), textos vía `t('ns:key')`, HTML del backend solo con `SafeHtml`, access token en memoria (nunca localStorage).
- Backend (Hono): sub-routers por dominio, validación con Zod (`packages/contracts`), RBAC por middleware, errores vía `onError` con formato `{data,error,meta}`, logging estructurado.
- BD (Drizzle): migraciones versionadas, snake_case, UUID v4, sin soft delete (usar `status`), tablas financieras con `created_by`.
- API: REST `/api/v1/`, cursor pagination; GET lecturas, QUERY (RFC 10008) búsquedas complejas, POST escrituras.
- Seguridad: validar entradas, PII cifrada, secretos fuera del código, tenant isolation por `operator_id`.
- Tests obligatorios: cálculos financieros, guards RBAC, máquinas de estado; cobertura ≥80%.
- Git: Conventional Commits, ramas `feat/...`, CI verde antes de merge.
- Routing frontend: según DECISIONES-PENDIENTES #2. Comandos de verificación: steering 16.
