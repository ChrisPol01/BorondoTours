---
inclusion: always
---

# Quality Gates y Verificación — BorondoTours

## Principio (de ECC)
Ningún código sale sin verificación. Cada implementación pasa por gates de calidad antes de considerarse terminada.

## Gate 1: Compilación y Lint
- El código compila sin errores (`npm run build`)
- Lint pasa sin warnings (`npm run lint`)
- No hay `any` en TypeScript nuevo
- No hay console.log (usar logger estructurado en backend)

## Gate 2: Tests
- Tests unitarios para toda lógica de negocio nueva
- Tests OBLIGATORIOS para:
  - Cálculos financieros (pricing, comisiones, IVA, Coins)
  - Guards RBAC (acceso permitido Y denegado)
  - Validaciones de input (datos válidos E inválidos)
  - Máquinas de estado (transiciones de booking, tour instance)
- Coverage ≥ 80% en archivos modificados

## Gate 3: Seguridad
- Inputs validados con class-validator (backend) o Zod (frontend)
- No hay datos PII en logs ni error messages
- Tokens y secrets NO hardcodeados
- HTML renderizado SOLO via SafeHtml (DOMPurify)
- Tenant isolation verificado (operator_id en queries)

## Gate 4: Accesibilidad (Frontend)
- Todos los inputs tienen labels o aria-label
- Imágenes con alt text (decorativas: alt="")
- Modales con focus trap + Escape para cerrar
- Contraste mínimo 4.5:1 (verificar con Axe DevTools)
- Navegación completa con teclado (Tab + Enter + Escape)

## Gate 5: Documentación
- Endpoints nuevos documentados (decorators Swagger en NestJS)
- Reglas de negocio complejas con comentario en español explicando el porqué
- Si se crea una tabla nueva: actualizar Modelo-Datos-Core.md
- Si se toma una decisión de arquitectura nueva: crear ADR

## Gate 6: Coherencia con Specs
- La implementación cubre TODOS los criterios de aceptación del Spec
- Si un criterio no se puede cumplir: documentar por qué y proponer alternativa
- Las transiciones de estado del booking siguen exactamente el flujo documentado
- Los roles acceden SOLO a las rutas definidas en Stack-Tecnologico RBAC

## Verificación Post-Implementación
Antes de dar por terminada cualquier tarea, verificar:
- [ ] ¿Compila sin errores?
- [ ] ¿Los tests pasan?
- [ ] ¿Se validaron los inputs?
- [ ] ¿Los datos sensibles están protegidos?
- [ ] ¿El RBAC es correcto?
- [ ] ¿La UI es accesible?
- [ ] ¿Se actualizó la documentación si fue necesario?
