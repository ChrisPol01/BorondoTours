# Estructura del Proyecto

Este vault de Obsidian sigue una estructura numerada por propósito.

```
vault/
├── 00-Inicio/          # Visión, objetivos y stack tecnológico
├── 01-Specs/           # Specs funcionales y no funcionales
├── 02-ADRs/            # Architecture Decision Records
├── 03-Knowledge/       # Investigación, guías, referencias técnicas
├── 04-Reuniones/       # Notas de reuniones y acuerdos
├── 05-Dev-Log/         # Diario de desarrollo diario
├── BorondoTours/       # Carpeta del proyecto principal
├── Templates/          # Plantillas reutilizables para nuevas notas
└── .kiro/
    └── steering/       # Reglas de contexto para Kiro IDE
```

## Convenciones de archivos

- Nombres de archivo: `PascalCase` con guiones (ej. `ADR-001-Auth-Strategy.md`)
- Todas las notas incluyen frontmatter YAML con `tags`, `created`, `status`
- Las plantillas viven en `Templates/` y usan `{{placeholders}}`
- Los ADRs siguen el formato `ADR-NNN-Titulo.md` y se registran en `ADR-Index.md`

## Flujo de trabajo

1. Diseño/spec → `01-Specs/` (via Claude Desktop o directamente en Obsidian)
2. Decisiones técnicas → `02-ADRs/` con el template `ADR-Nuevo.md`
3. Implementación → Kiro IDE referencia specs con `#File 01-Specs/...`
4. Registro diario → `05-Dev-Log/` con el template `Dev-Log-Diario.md`

## Antes de implementar una feature

1. Leer la spec en `01-Specs/` 
2. Verificar si hay ADRs relevantes en `02-ADRs/`
3. Si hay decisiones pendientes, crear un nuevo ADR antes de codear
4. Actualizar el Dev Log al finalizar
