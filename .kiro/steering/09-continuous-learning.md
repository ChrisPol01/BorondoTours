---
inclusion: always
---

# Aprendizaje Continuo y Memoria — BorondoTours

## Principio (de ECC Continuous Learning)
Cada sesión de trabajo genera conocimiento. El equipo mejora con cada iteración. Los patrones exitosos se capturan y reutilizan.

## Qué Capturar como Aprendizaje

### Patrones de Código Repetitivos
Si se implementa un patrón más de 2 veces, proponer:
- Crear un util/helper reutilizable
- Documentar el patrón en el steering correspondiente
- Ejemplo: validación de IVA, cálculo de comisiones, generación de presigned URLs

### Decisiones de Arquitectura
Cuando se toma una decisión técnica no trivial:
- Crear un ADR en `docs/02-ADRs/` siguiendo el template existente
- Registrar: contexto, opciones evaluadas, decisión tomada, consecuencias

### Errores Comunes
Si un tipo de bug se repite:
- Agregar test específico que lo previene
- Documentar en los steering si es un patrón general
- Ejemplo: "Los guards RBAC deben verificar operator_id además del role"

### Mejoras de Performance
Si se descubre un patrón de optimización:
- Documentar el antes/después
- Agregar a los coding standards si aplica globalmente

## Contexto entre Sesiones

### Lo que Kiro debe recordar siempre (está en los steering)
- El stack y sus convenciones
- Las reglas de negocio críticas
- Los quality gates obligatorios
- La estructura de la documentación

### Lo que evoluciona con el proyecto
- Si se agrega una nueva tabla: actualizar `docs/03-Knowledge/Modelo-Datos-Core.md`
- Si se toma una ADR: crear archivo en `docs/02-ADRs/`
- Si un Spec cambia: actualizar en `docs/01-Specs/`
- Si se descubre una regla nueva: proponer actualizar el steering correspondiente

## Cuándo Proponer Actualizar Steering
- Cuando una convención se repite pero no está documentada
- Cuando se descubre que un steering está desactualizado vs el código
- Cuando el usuario establece una preferencia que debería persistir
- Cuando un patrón de ECC se adapta exitosamente al proyecto

## Anti-patrones a Evitar
- NO sobre-optimizar sin datos de performance reales
- NO refactorizar código que funciona "solo porque se puede"
- NO agregar abstracciones para problemas que aún no existen
- NO cambiar convenciones establecidas sin discusión explícita
