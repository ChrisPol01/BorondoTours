# Megafábrica SDLC — decisiones del usuario (vigentes)

Lista única y numerada. Reemplaza versiones anteriores de este archivo. Detalle técnico en `brief-v2.md` (secciones 1-16; donde choquen, manda la sección de número mayor).
Fuentes de investigación: `inputs/gemini-ciclos-de-vida.md` y `inputs/gemini-ciclos-tecnicos-megafabrica.md`.

## Qué es la megafábrica
1. **Objetivo del MVP:** un equipo de agentes que construye lo que se le indique (productos y MVP de tecnología). Cada agente es un constructor especialista. Instalarla como CLI distribuible (paquete) queda para el futuro.
2. **Alcance:** fábrica ejecutable + AgentOps (métricas DORA/SPACE desde el bus) + MCP por rol + gobierno enterprise + todos los ciclos de vida de TI (42 ciclos investigados), sin dejar ningún rol por fuera.
3. **Multi-herramienta:** funciona en Kiro (IDE, CLI y Crew), Claude Code, Codex, Cursor, GitHub Copilot y Antigravity.
4. **Portable:** sirve para cualquier proyecto y cualquier nicho, sin depender de BorondoTours.

## Dónde vive
5. **Repo propio** `C:\Users\Administrador\megafabrica-sdlc`, fuente única. Se publica en GitHub como repo **privado** `ChrisPol01/megafabrica-sdlc`, automáticamente al cerrar (después del commit único y del retiro en BorondoTours), sin volver a preguntar. Confirmado por el gerente.
6. **Todo vive en la fábrica.** Cada proyecto solo tiene su carpeta de contexto (`.megafactory/`: bus, memoria, hallazgos, actividades) y un puente por herramienta. El puente se hace por contexto (archivos de reglas/agentes), y donde convenga por MCP o API.
7. **BorondoTours:** se copia su fábrica actual al repo nuevo, se entiende cómo adaptarla, y BorondoTours queda limpio con solo su configuración propia de Kiro (steering, skills `bt-*`, `figma-sync`, `oss-scout`, `mcp.json`).
8. **Motor:** Node ≥22 sin dependencias de runtime; Windows, macOS y Linux; cualquier shell; comando `doctor`.

## Organización de agentes
9. **Solo agentes.** Los humanos son los gerentes: cualquier persona que use la fábrica (no una persona en particular).
10. **Un agente por rol:** los 80 roles investigados son 80 agentes especialistas, sin agrupar.
11. **Jerarquía:** gerente humano ↔ agente **CTO** (apoyo del gerente en cada MVP y producto) → **líder global** (conductor) → **líder de área** (supervisor dedicado) → **ejecutores** especialistas. Los bloqueos suben por niveles; el CTO reporta al gerente.
12. **Reportes gerenciales:** todo lo que llega al humano va en formato ejecutivo (resultado, avance, riesgos, costos, decisiones pendientes con recomendación).
13. **Aprobaciones:** los agentes aprueban lo de bajo riesgo según el perfil. Lo crítico (producción, publicar/push, borrar datos o recursos, gastos y credenciales, firmas legales) lo prepara y pre-aprueba un agente (el CTO) y lo confirma el gerente humano. Esto aplica igual en cualquier proyecto.

## Kit de cada agente
14. **Skills** detalladas, robustas, profesionales y proactivas, con revisión automática y rúbrica que rechaza lo superficial.
15. **Kit completo:** skill propia, MCP por rol y por área, herramientas open source (incluida markitdown), memoria, documentación, conexiones con pares y líderes, y métodos de trabajo.
16. **MCP sin keys en el repo:** solo nombres de variables (`${MF_…}`); los valores viven fuera del repo.
17. **Métodos:** 5 porqués, Ishikawa, A3, PDCA, FMEA, pre-mortem, Kaizen, postmortem sin culpa y más; se debe investigar y sumar otras metodologías que hagan a los agentes más efectivos.
18. **Licencias:** un repo sin licencia se acepta si es bueno o muy usado; entra marcado `license: none` y visible en `THIRD_PARTY.md`.

## Cómo trabaja (en la fábrica y en esta construcción)
19. **Plan por flujo y por lotes:** el trabajo se planifica por flujo (receta) y se divide en lotes solo cuando su tamaño lo requiere.
20. **Exactitud y pocos ciclos:** se busca acertar a la primera; solo se repite un ciclo para corregir defectos bloqueantes o riesgosos para el negocio.
21. **Se reportan todos los defectos:** los no bloqueantes no frenan el avance, pero quedan registrados y se corrigen.
22. **Observador de pruebas:** registra cada verificación; si un fallo se repite abre 5 porqués y propone una lección; si un paso se rechaza dos veces abre un A3.
23. **Commits:** un solo commit al final de la construcción, con mensaje detallado (qué incluye por área); después se retira el motor viejo de BorondoTours.

## Multi-proyecto
24. **Una fábrica, muchos proyectos aislados:** cada proyecto guarda su propio contexto (bus, memoria, hallazgos) en su repo; nunca se mezcla con otro ni se guarda en la central.
25. **Aprende de todos sin mezclar:** las lecciones se generalizan (sin nombres, clientes, rutas ni datos del proyecto) y solo entonces pasan al conocimiento central, etiquetadas por nicho y stack. Compartir es opcional por proyecto y viene apagado; los proyectos de clientes confidenciales no comparten.
