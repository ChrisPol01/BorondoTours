---
inclusion: always
---

# Estándares de Código — BorondoTours

## Reglas Generales
- Nombres de variables, funciones, clases y archivos en **inglés**
- Comentarios de reglas de negocio en **español** (para que el equipo entienda)
- Un archivo = una responsabilidad
- No más de 3 niveles de anidación
- Funciones de máximo 50 líneas
- No introducir librerías que no estén en el stack aprobado sin discusión previa

## TypeScript / Frontend
- Strict mode habilitado
- No `any` — usar tipos explícitos o genéricos
- Componentes funcionales con hooks (no class components)
- Props con interfaces nombradas (`interface TourCardProps {}`)
- Estilos con Tailwind utility classes (no CSS modules ni styled-components)
- Textos SIEMPRE via `t('namespace:key')` de i18next — cero strings hardcodeados en JSX
- HTML del backend SOLO via componente `SafeHtml` (DOMPurify)
- Access token en memoria (Zustand), NUNCA en localStorage

## NestJS / Backend
- Estructura modular por dominio (un módulo NestJS por feature)
- DTOs con class-validator para validación de inputs
- Guards para RBAC (decorators @Roles)
- Interceptores para transformación de responses
- Exceptions con HttpException tipadas (no throw genérico)
- Logging estructurado (no console.log en producción)

## Base de Datos / Drizzle
- Migraciones versionadas — nunca alterar schema manualmente
- Snake_case para tablas y columnas
- Índices diseñados según queries reales
- No soft delete: usar campo `status` con enum cuando aplique
- Toda tabla financiera con campo `created_by` para auditoría

## API Design
- RESTful con versionado `/api/v1/`
- Responses consistentes: `{ data, error, meta }`
- Paginación cursor-based para listados (no offset)
- Rate limiting por usuario/tenant (API Gateway throttling)
- Errores de negocio separados de errores técnicos
- Nunca exponer stack traces al cliente
- **Métodos HTTP (RFC 10008 adoptado):**
  - `GET` → lecturas simples (params en URL, cacheable por CDN)
  - `QUERY` → búsquedas complejas con body JSON (seguro, idempotente, RFC 10008)
  - `POST` → escrituras (crear, acciones con side-effects)
  - `PATCH` → actualizaciones parciales
  - `DELETE` → eliminaciones
- Endpoints compuestos por vista (`/tours/:slug/page-data`) para minimizar invocaciones Lambda
- `QUERY /x/search` es el estándar para filtros complejos — NO usar `POST /x/search` (semántica incorrecta)

## Testing
- Lógica financiera (pricing, comisiones, IVA): tests unitarios OBLIGATORIOS
- Flujos de reserva end-to-end: tests de integración
- Guards RBAC: tests que verifican acceso y denegación
- Coverage mínimo: 80%
- Mock de servicios externos con MSW (frontend) o providers mockeados (backend)

## Seguridad (siempre aplicar)
- Validar TODOS los inputs en la capa del controller/endpoint
- Sanitizar HTML con DOMPurify antes de renderizar
- Encriptar PII en reposo (AES-256 en columnas sensibles)
- Tokens y secrets en variables de entorno, nunca en código
- RBAC verificado en backend (no confiar solo en frontend)
- Datos de un operador solo visibles con su operator_id (tenant isolation)

## Git
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Branch naming: `feat/spec-a-discovery`, `fix/checkout-iva-calculation`
- PRs con descripción de qué cambió, qué se probó, y qué specs cubre
- No merge sin CI verde (lint + test + build)

## Performance
- TanStack Query con `staleTime: 5min` para catálogo (evitar refetch innecesario)
- Imágenes con srcset (400w, 800w, 1200w) via @unpic/react
- Lazy loading para imágenes below the fold
- Code splitting por ruta (TanStack Router lo hace automático)
- Skeleton loaders en lugar de spinners genéricos
