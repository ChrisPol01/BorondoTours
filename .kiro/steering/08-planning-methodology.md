---
inclusion: always
---

# Metodología de Planificación — BorondoTours

## Proceso de Implementación de Features (de ECC Planner)

Cuando se solicite implementar un feature nuevo, seguir SIEMPRE este proceso:

### 1. Análisis de Requerimientos
- Leer el Spec relevante COMPLETO (docs/01-Specs/Spec-X-*.md)
- Identificar los criterios de aceptación exactos
- Verificar dependencias con otros módulos
- Listar assumptions y preguntar si hay ambigüedades

### 2. Revisión de Arquitectura
- Verificar qué tablas del Modelo-Datos-Core se necesitan
- Identificar módulos NestJS afectados
- Revisar si existe código similar reutilizable
- Verificar ADRs relevantes

### 3. Plan de Implementación
Crear un plan con este formato:

```
# Plan: [Nombre del Feature]

## Spec de referencia: Spec-X §Y

## Archivos a crear/modificar:
- src/modules/xxx/xxx.controller.ts (nuevo/modificar)
- src/modules/xxx/xxx.service.ts
- src/db/schema/xxx.ts (migración)
- frontend/src/features/xxx/...

## Fases:
### Fase 1: Base de datos y DTOs
### Fase 2: Backend (service + controller + guards)
### Fase 3: Frontend (componentes + integración API)
### Fase 4: Tests

## Criterios de aceptación verificables:
- [ ] Criterio 1 del Spec
- [ ] Criterio 2 del Spec
```

### 4. Implementación Incremental
- Cada paso debe ser verificable independientemente
- Primero el happy path, luego edge cases
- Backend antes que frontend (la API es el contrato)
- Migrations antes que código (el schema es el fundamento)

### 5. Verificación (ver steering 06-quality-gates)

## Sizing de Features

| Tamaño | Criterio | Ejemplo |
|---|---|---|
| S | 1-3 archivos, sin migration | Fix de validación, ajuste UI |
| M | 4-8 archivos, 1 migration posible | Endpoint nuevo con CRUD básico |
| L | 9-15 archivos, migrations, frontend + backend | Feature completo como Split Fare |
| XL | 15+ archivos, múltiples módulos | Sistema completo como CRM Kanban |

Para features L y XL: dividir en PRs incrementales que sean mergeables independientemente.

## Red Flags a Detectar
- Funciones de más de 50 líneas
- Más de 3 niveles de anidación
- Código duplicado entre módulos
- Falta de error handling para servicios externos
- Hardcoded values que deberían ser configurables
- Tests ausentes para cálculos financieros
- Queries N+1 en listados paginados
