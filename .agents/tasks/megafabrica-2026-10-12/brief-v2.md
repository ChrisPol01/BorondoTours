# Megafábrica SDLC v1 — brief de ejecución (v2: repo propio)

ESTA TAREA ES PESADA: requisitos amplios y en parte ambiguos, extracción de un motor existente a un repo nuevo, investigación profunda de muchas fuentes, extensiones del CLI con TDD, instalador con lockfile, decenas de agentes y skills nuevos, recetas, catálogo MCP, packs por nicho y un manual grande. Necesita: extracción verificada primero, investigación, diseño revisado en bucle antes de implementar, plan descompuesto por el planner, implementación por lotes con revisión, y una puerta final de validación con revisión independiente como último paso.

Idioma: todo el texto en ESPAÑOL; identificadores, nombres de archivo y claves JSON en inglés.
Decisiones del usuario (fuente de verdad): `c:\Users\Administrador\BorondoTours\.agents\tasks\megafabrica-2026-10-12\decisiones-usuario.md`.

## 1. Esquema aprobado

- Repo nuevo y fuente única: `C:\Users\Administrador\megafabrica-sdlc` (ya creado, vacío; agregado por el usuario como segunda raíz del workspace de Kiro junto a `c:\Users\Administrador\BorondoTours`). Inicializar git con rama `main`. Sin remoto ni push (GitHub pendiente del usuario).
- Consumo: comandos `install` y `upgrade` (más los que el diseño justifique: `status`/`diff`, `verify`, `uninstall`, `adopt` para copias v0) que copian la fábrica a la `.kiro/` de cada proyecto con un lockfile (versión instalada + hash de cada archivo administrado). El proyecto queda autónomo: funciona sin el repo de la fábrica abierto, en una sola raíz, en otra máquina y en CI.
- `upgrade` nunca pisa lo propio del proyecto (perfil, skills del proyecto, agentes propios como `figma-sync`/`oss-scout`, steering propio, bus de corridas, `mcp.json` del proyecto). Si un archivo administrado fue modificado localmente, no se sobrescribe: se reporta el conflicto y se deja la versión nueva aparte.
- Multi-root solo como modo de trabajo (fábrica + proyecto abiertos juntos para mejorar la fábrica o adaptar un nicho).
- Versionado semántico, `CHANGELOG.md`, versión del motor visible en el lockfile.
- No tocar las copias v0 ya instaladas en `C:\Users\Administrador\Almia\almia-infra` ni `C:\Users\Administrador\GFourmis`. El diseño debe definir cómo se adoptan después.

### Runtime del motor (decisión de diseño explícita)
El usuario pide que el motor funcione en cualquier entorno: Windows, macOS y Linux; PowerShell, cmd, bash y zsh; Kiro IDE, kiro-cli y CI; repos de cualquier stack (Node, Python, Terraform puro). El lenguaje puede ser TypeScript, Python o el que mejor sirva a cada caso de uso. El diseño debe evaluar con evidencia:
1. Mantener el motor v0 en Node ESM sin dependencias de runtime. Ya probado: 156 tests, y `registry check` corrió OK en almia-infra (Terraform) y GFourmis (Python) con Node v24 en esta máquina.
2. Python solo con biblioteca estándar.
3. Binario único compilado sin runtime (Go, Rust, `bun build --compile`, Node SEA).
4. Híbrido (motor en un lenguaje, utilidades de skills en otro).
Criterios: runtime disponible en las máquinas destino, cero dependencias de runtime en el proyecto consumidor, costo de reescribir y re-probar, distribución y actualización, firma/antivirus en Windows, mantenimiento.
Recomendación de partida (el diseño puede refutarla con evidencia): mantener Node ≥22 sin dependencias de runtime (reutiliza lo probado; la mayoría de servidores MCP ya usan npx o uvx), agregar envoltorios por shell (`factory.cmd`, `factory.ps1`, `factory` para sh) y un comando `doctor` que detecte runtime o herramientas faltantes y diga cómo instalarlos por SO. TypeScript solo como herramienta de desarrollo del repo de la fábrica (typecheck), nunca requerido por el proyecto consumidor. Python u otro lenguaje solo donde aporte y el diseño lo justifique, también sin dependencias.
Portabilidad de SO obligatoria en código y tests: rutas (separadores, mayúsculas), finales de línea CRLF/LF, codificación UTF-8, permisos de ejecución, comillas en shells. Preparar (sin ejecutar) un archivo de CI en el repo nuevo con matriz ubuntu/macos/windows; localmente se verifica en Windows.

Hechos verificados sobre multi-root en Kiro (blog oficial https://kiro.dev/blog/multi-root-workspaces/): Kiro carga la `.kiro` de cada raíz; el steering "siempre incluido" de cualquier raíz entra en todas las sesiones y el condicional solo cuando se trabaja sobre archivos de esa raíz; cada hook solo se dispara con cambios en su raíz; si dos raíces declaran un MCP con el mismo nombre gana la última raíz. NO verificado: si los agentes personalizados, skills y recetas de una segunda raíz se descubren.
Consecuencia obligatoria de diseño: la `.kiro/` propia del repo de la fábrica NO debe tener steering con inclusión "always", ni agentes `sdlc-*` activos, ni servidores MCP sin prefijo, ni hooks que afecten a otros repos. Las plantillas viven fuera de `.kiro/` (p. ej. `core/`, `packs/`, `templates/`; el diseño decide), para que anexar el repo como raíz no contamine al proyecto.

## 2. Fase 0 — Extracción del motor actual desde BorondoTours (primer paso, antes de investigar)

Base obligatoria a leer: `c:\Users\Administrador\BorondoTours\.kiro\factory\README.md`, `PROTOCOL.md`, `PORTING.md`, `ADAPT-PROMPT.md`, `THIRD_PARTY.md`, `profile.json`; `c:\Users\Administrador\BorondoTours\.kiro\steering\19-fabrica-agentes.md` y `20-fabrica-sdlc-contexto.md`; `c:\Users\Administrador\BorondoTours\.agents\tasks\sdlc-factory-2026-10-12\design.md`, `research.md`, `final-report.md`.

Inventario actual (fábrica v0, aprobada): Context Bus en carpeta `.kiro/factory/` cuyo ÚNICO escritor de control (manifest, eventos, firmas) es el CLI `.kiro/factory/scripts/factory.mjs` (~35 módulos en lib/, 24 esquemas, 30 archivos de tests, 156 tests, cobertura 96.7%); 22 agentes `.kiro/agents/sdlc-*.json` + fichas `.kiro/factory/roles/*.md` (9 encabezados obligatorios); 10 skills `.kiro/skills/bt-*`; 7 recetas `.kiro/workflows/factory-*.workflow.json` (discovery, contracts, build, quality-gates, release, feature-e2e con 49 pasos, contract-dispute; límite 50 pasos por receta); 2 hooks `.kiro/hooks/factory-*.json` deshabilitados. 5 fases: discovery → contracts → build → quality → release. Scripts en el `package.json` raíz de BT: `factory`, `factory:test` (`node .kiro/factory/scripts/tests/run.mjs`), `factory:typecheck` (`tsc -p .kiro/factory/scripts/tsconfig.json`).

Pasos:
1. Clasificar en BT qué es MOTOR y qué es CONOCIMIENTO DEL PROYECTO, y escribir el inventario (ruta origen → ruta destino → acción) en `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\extraction-inventory.md`.
   - Motor (sale de BT): `.kiro/factory/**` (incluye `profile.json` de BT, que se conserva en el snapshot como ejemplo y se regenerará en la instalación limpia), `.kiro/agents/sdlc-*.json` (22), `.kiro/workflows/factory-*.workflow.json` (7), `.kiro/hooks/factory-*.json` (2), `.kiro/steering/19-fabrica-agentes.md`, y los 3 scripts `factory*` del `package.json` raíz.
   - Conocimiento del proyecto (se queda en BT, intacto): `.kiro/skills/bt-*` (10; describen el stack real; se copian también al snapshot como referencia), `.kiro/agents/figma-sync.json`, `.kiro/agents/oss-scout.json`, steering 00-18, `.kiro/settings/mcp.json` (sigue `{"mcpServers": {}}` hasta la instalación limpia), `docs/`, `.agents/tasks/**`.
2. Copiar el motor a un snapshot INERTE en el repo nuevo, p. ej. `C:\Users\Administrador\megafabrica-sdlc\snapshots\v0-borondotours-2026-10-12\` reproduciendo las rutas relativas (`.kiro/factory/...`, `.kiro/agents/sdlc-*.json`, `.kiro/workflows/...`, `.kiro/hooks/...`, `.kiro/steering/19-...`, `.kiro/skills/bt-*`). Una `.kiro/` anidada en una subcarpeta no la carga Kiro. Copiar también `c:\Users\Administrador\BorondoTours\.agents\tasks\sdlc-factory-2026-10-12\` como historia de diseño de v0.
3. Inicializar git en el repo nuevo (`git init -b main`, SIN commit). Crear `package.json` mínimo (privado, `packageManager` pnpm 9.15.0, Node >=22), `.gitignore` (node_modules, coverage, temporales) y devDependencies con versión EXACTA (para verificar el snapshot: `typescript` con la misma versión que usa la raíz de BT; leerla de `c:\Users\Administrador\BorondoTours\package.json`). Instalar dependencias SOLO en el repo nuevo.
4. Verificar el snapshot ejecutando con cwd en el snapshot: tests (156 deben pasar), typecheck y `node .kiro/factory/scripts/factory.mjs registry check` (exit 0). Comparar conteo de archivos y hashes entre BT y el snapshot (deben coincidir). Si algo falla, detenerse y reportar.
5. En esta fase NO se borra nada de BT ni se hace commit. BT conserva su fábrica v0 intacta durante toda la construcción. El commit único y el retiro del motor de BT ocurren al FINAL (sección 9), cuando la megafábrica esté terminada y aprobada.

Retiro del motor de BT (se ejecuta solo en la sección 9, después del commit único):
   - Borrar las rutas de motor listadas en el paso 1 (están preservadas en el commit del repo nuevo).
   - En `c:\Users\Administrador\BorondoTours\package.json` quitar SOLO los 3 scripts `factory*`; nada más.
   - Reescribir `c:\Users\Administrador\BorondoTours\.kiro\steering\20-fabrica-sdlc-contexto.md` como puntero siempre activo y corto: la fábrica se extrajo a `C:\Users\Administrador\megafabrica-sdlc`; BT está sin fábrica instalada hasta la instalación limpia; no buscar `.kiro/factory` ni agentes `sdlc-*`; las skills `bt-*` siguen siendo el conocimiento del stack y algunas mencionan comandos de la fábrica que quedan inactivos hasta la instalación.
   - En `docs/` actualizar las referencias a la fábrica (buscar `.kiro/factory`, `factory.mjs`, `sdlc-`, `fábrica`) para que apunten al repo nuevo; en `docs/DECISIONES-PENDIENTES.md` marcar las filas propias de la fábrica (#16-#32) como "trasladada a megafabrica-sdlc" y copiarlas a un archivo de decisiones del repo nuevo. No cambiar otro contenido del vault.
   - Verificar con `git -C c:\Users\Administrador\BorondoTours status --porcelain` que solo cambiaron esas rutas y que no se tocó `apps/`, `services/`, `packages/`, `infra/` (BT tiene ~230 cambios previos del usuario sin commitear en apps/: no tocarlos). No hacer commits en BT.

## 3. Fase 1 — Investigación N4

Insumos (leerlos desde aquí; no copiarlos al repo):
- `c:\Users\Administrador\BorondoTours\.agents\tasks\megafabrica-2026-10-12\inputs\gemini-ciclos-de-vida.md` (626 KB, 21+ ciclos de vida SDLC e infraestructura). Es grande: leer por bloques con offset/limit (máx. 2000 líneas / 250 KB por llamada) hasta cubrirlo completo.
- `c:\Users\Administrador\BorondoTours\.agents\tasks\megafabrica-2026-10-12\inputs\gemini-ciclos-tecnicos-megafabrica.md` (56 KB, megafábrica enterprise: método de bmad-code-org, Team Topologies, DORA/SPACE, SAFe, COBIT/TOGAF, FinOps/GreenOps, MLOps/AgentOps, nearshoring en Cali).
- Contenido generado por Gemini = no verificado: contrastar con búsqueda web lo que se vuelva regla. Nearshoring/Cali es referencia externa: marcarlo "verificar".

Cubrir TODOS los ciclos de vida del área de TI, no solo SDLC: ITSM/ITIL, infraestructura y redes, cloud/plataforma/platform engineering/IDP, operación día-2 (SRE/SLOs/runbooks, observabilidad/AIOps, incidentes y problemas, resiliencia/caos/DR-BCP, cambios de infraestructura), datos/DataOps/BI, MLOps, LLMOps/AgentOps, DevSecOps/SecOps/IAM, GRC/auditoría/privacidad, gestión de activos TI y licencias, proveedores, arquitectura empresarial, producto/portafolio/PMO, QA de rendimiento/accesibilidad/localización, soporte L1-L3, endpoint/workplace, DBA, móvil, IoT/edge, integración/APIs, migración/modernización, retiro/decommissioning, gestión del conocimiento, FinOps/GreenOps, etc. El investigador completa y justifica la lista.

Salida: `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\research.md` con catálogo de ciclos y MATRIZ DE COBERTURA: ciclo → fases → roles → clasificación (cubierto por agente v0 / extender agente v0 / agente nuevo ejecutable / rol humano de gobierno solo documentado / propuesta MCP o herramienta), con justificación. Además, verificar en la documentación oficial de Kiro (kiro.dev): (a) si los agentes personalizados `.kiro/agents/*.json` admiten declarar MCP por agente (campos tipo `mcpServers`, `tools`, `allowedTools`, `includeMcpJson`), usando `c:\Users\Administrador\BorondoTours\.kiro\agents\figma-sync.json` y un `sdlc-*.json` del snapshot como referencia del formato real; (b) la sintaxis de variables de entorno en `mcp.json`; (c) si agentes, skills y recetas de una segunda raíz de multi-root se descubren; (d) el formato oficial de skills (`SKILL.md`, frontmatter, carpetas de referencias).

## 4. Fase 2 — Diseño revisado en bucle

`design.md` + revisiones en `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\`. Criterio de aprobación: 0 hallazgos HIGH y ≤3 MEDIUM (una corrida anterior se agotó exigiendo 0 MEDIUM). Dar ≥4 iteraciones al bucle y, si se agota, pausar (no fallar).

Debe resolver como mínimo:
- Layout del repo fuente (motor, plantillas de agentes, skills genéricas, recetas, packs, catálogo MCP, manual, tests) y qué genera `install` en el proyecto. Reutilizar el motor v0 del snapshot, sin reescribir lo que funciona; compatibilidad hacia atrás con las 5 fases, las 7 recetas y los 22 agentes.
- Instalador: `install`/`upgrade`/`status`/`verify`/`uninstall`/`adopt`, lockfile, reglas de propiedad (administrado vs local del proyecto), conflictos, `--dry-run`, idempotencia, rutas Windows y POSIX.
- Crecer sin explosión de agentes: solo se vuelve agente ejecutable un rol que produce un artefacto verificable en el bus; los roles humanos quedan como fichas + RACI. Packs/familias activables por nicho en el perfil (p. ej. web-app, infra-iac, data-ml, mobile, enterprise-governance) y cómo `registry check` valida roles activos/inactivos.
- Nuevas fases o carriles (p. ej. "Operación y Gobernanza" / carril día-2) y puntos de entrada que no nacen de un PRD (change request, incidente, deuda técnica, migración, hallazgo de auditoría), sin romper lo existente.
- Nuevos tipos de artefacto y extensiones del CLI (AgentOps: métricas DORA/SPACE y desempeño de agentes calculadas desde los eventos del bus), manteniendo al CLI como único escritor de control.
- Arquitectura MCP por rol según lo verificado en (a)-(b): catálogo portable (propósito, roles, licencia, comando de arranque, NOMBRES de variables de entorno, nunca valores) + mapa rol→MCP + plantilla `mcp.json` con todos los servidores `"disabled": true`. El `mcp.json` de cada proyecto se genera en `install`, con secretos referenciados por variable de entorno; las keys nunca se escriben en texto plano en `.kiro/settings/mcp.json` (vive en el repo): su valor vive en variables de entorno del usuario, en `~/.kiro/settings/mcp.json`, en AWS Secrets Manager o en perfiles SSO. Documentar dónde va cada key. Nombres con prefijo para evitar choques en multi-root. NO redeclarar servidores que el usuario ya tiene a nivel usuario o vía powers (el workspace los anularía); referenciarlos como "provisto por usuario/power": figma-bridge, mcp-obsidian, obsidiandos; powers aws-agentcore (agentcore-mcp-server), aws-cost-optimization (awslabs.billing-cost-management-mcp-server, awslabs.aws-pricing-mcp-server, awslabs.cloudwatch-mcp-server), aws-infrastructure-as-code (awslabs.aws-iac-mcp-server), aws-sam (awslabs.aws-serverless-mcp-server, fetch), cloud-architect (awspricing, awsknowledge, awsapi, context7, fetch), ecs-express-power (aws-api), figma (figma), postman (postman), saas-builder (fetch, stripe, aws-knowledge-mcp-server, awslabs.dynamodb-mcp-server, awslabs.aws-serverless-mcp, playwright), amazon-devices-buildertools (amazon-devices-buildertools-mcp). NO leer `~/.kiro/settings/mcp.json` (contiene keys). Plan B si (a) no está soportado: mapa rol→MCP + instrucciones en el prompt/ficha de cada agente.
- Nombres neutros para agentes y skills genéricos nuevos; cómo conviven con `sdlc-*` y con las skills específicas de cada proyecto (como `bt-*`).
- Runtime del motor y portabilidad de SO/shell/CLI según la subsección "Runtime del motor" (sección 1), con la evaluación de alternativas documentada.
- Estándar de calidad de la sección 5 y su verificación mecánica.
- Procedimiento de instalación limpia en BorondoTours y de adopción de almia-infra/GFourmis (se documenta y se prueba en seco; no se ejecuta en esta corrida).

## 5. Estándar de calidad de skills, agentes y fichas (requisito explícito del usuario)

El usuario pidió que las skills genéricas por rol sean detalladas, robustas y profesionales, que cumplan su objetivo y que actúen de forma proactiva. No se aceptan plantillas mínimas. Cada `SKILL.md` genérica debe incluir, con contenido sustantivo:
- Frontmatter con `name` y una `description` que diga cuándo activarla (disparadores concretos).
- Objetivo y definición de terminado.
- Cuándo usarla y cuándo NO.
- Entradas requeridas (artefactos del bus, archivos, contexto del perfil).
- Procedimiento paso a paso con herramientas y comandos concretos, incluidos los MCP del rol.
- Árboles de decisión o criterios para elegir entre opciones.
- Checklists de calidad.
- Comportamiento proactivo: disparadores "si detectas X → haz o propón Y" (riesgos de seguridad, costo, deuda técnica, accesibilidad, cumplimiento, oportunidades de mejora), qué revisar aunque no se lo pidan y cuándo escalar a un humano o a otro rol.
- Anti-patrones y errores comunes.
- Plantillas del artefacto de salida y ejemplos breves (bueno y malo).
- Autoverificación (cómo comprueba su propio trabajo).
- Estándares y marcos de referencia citados por nombre, con palabras propias.
- Puntos de adaptación al proyecto (qué sobreescribe el perfil o una skill del proyecto).
- Contenido largo en archivos de referencia aparte (divulgación progresiva), según el formato oficial verificado.

El mismo nivel aplica a los prompts de los agentes (sección explícita de comportamiento proactivo y de escalamiento) y a las fichas de rol (9 encabezados). Verificación mecánica obligatoria: un comando del CLI (p. ej. `skills lint`, o extender `registry check`) que valide secciones obligatorias, contenido mínimo por sección, un número mínimo de disparadores proactivos y la presencia de autoverificación, con tests. Además, el revisor de cada lote puntúa con una rúbrica de profundidad y rechaza lo superficial.

## 6. Fases 3-5 — Plan, implementación y documentación

- El planner descompone en lotes. Cada lote se implementa y se revisa. Escribir progreso en `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\progress.json` tras cada lote; lotes reanudables e idempotentes (una corrida anterior falló a mitad por "No valid token found").
- CLI con TDD: tests nuevos, cobertura ≥80%, TypeScript estricto vía typecheck, sin `any`, sin `console.log` nuevos fuera de la salida del CLI.
- Recetas nuevas en el mismo formato que las v0, ≤50 pasos cada una.
- Documentación portable: "Manual de la Megafábrica SDLC" en el repo nuevo (no acoplado a BT), que incluya el gobierno enterprise N3 (SAFe, COBIT, TOGAF, Team Topologies, ITIL 4, ISO 27001, GreenOps, nearshoring marcado "verificar") como documento; `README.md`, `PORTING.md`/`ADAPT-PROMPT.md` actualizados a packs, instalador, MCP por rol y keys por proyecto; `THIRD_PARTY.md`; `CHANGELOG.md`; steering propio del repo con inclusión auto o fileMatch (nunca always).
- Informe final: `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\final-report.md` (qué se hizo, qué quedó como documento, comandos exactos y checklist de la instalación limpia en BT y de la adopción de almia-infra/GFourmis, acciones humanas: habilitar MCP, cargar keys, recargar Kiro, decidir remoto GitHub).

## 7. Restricciones

- Escritura permitida: `C:\Users\Administrador\megafabrica-sdlc\**`. En BT solo lo listado en "Retiro del motor de BT" (y solo en la sección 9) y `c:\Users\Administrador\BorondoTours\.agents\tasks\megafabrica-2026-10-12\`. No tocar `apps/`, `services/`, `packages/`, `infra/` de BT, ni `figma-sync.json`, ni `oss-scout.json`, ni las skills `bt-*`, ni el `mcp.json` de BT, ni steering 00-18. No tocar almia-infra ni GFourmis.
- Dependencias: solo devDependencies con versión exacta en el repo nuevo. Nada en BT. No ejecutar ni arrancar servidores MCP (nada de npx/uvx para MCP).
- Commits: UN SOLO commit en todo el trabajo, en el repo nuevo, al final (sección 9), después de que la puerta de verificación pase y la revisión final apruebe. Ningún commit intermedio, ningún push, ningún commit en BT.
- No resolver las decisiones pendientes de BT #1 Hono/NestJS, #2 Astro/Vite, #15 SAM/CDK.
- Sin PII ni secretos en ningún archivo. No leer archivos de credenciales.
- Licencias: reutilizar contenido solo de fuentes MIT/Apache y atribuir en `THIRD_PARTY.md`. COBIT, TOGAF, SAFe, ITIL, ISO, DORA/SPACE se citan por nombre y se describen con palabras propias. Nunca más de 30 palabras textuales de una fuente web. No usar la marca "BMad" (método de bmad-code-org, MIT).

## 8. Verificación final obligatoria (puerta)

Ejecutar y reportar salida real:
- En el repo nuevo: tests (todos pasan, cobertura ≥80%), typecheck, lint de skills/agentes/fichas (sin errores), todo `.json` parsea, pasos por receta ≤50, escaneo de secretos sobre todo el repo, plantillas MCP sin valores literales de keys ni nombres que dupliquen los de usuario/powers.
- Test e2e del instalador sobre directorios temporales, uno por pack: `install` → `verify` → `registry check` exit 0 → `upgrade` idempotente → archivo administrado modificado localmente no se sobrescribe → `uninstall` limpio.
- `install --target c:\Users\Administrador\BorondoTours --dry-run`: con la v0 aún presente en BT debe detectarla y mostrar el plan de adopción o instalación limpia sin escribir (confirmar con `git status` de BT antes y después que el dry-run no cambió nada).
- En BT: `git status --porcelain` no muestra cambios de la corrida fuera de `.agents/tasks/megafabrica-2026-10-12/`.
- Revisión final independiente que emite el veredicto; el bucle de corrección termina solo con APROBADO.

## 9. Cierre (solo después de la revisión final APROBADA)

1. Commit único en `C:\Users\Administrador\megafabrica-sdlc` con todo el trabajo (snapshot v0 + megafábrica), Conventional Commits, p. ej. `feat: megafábrica SDLC v1 (motor, packs, instalador, MCP por rol)`. Confirmar con `git -C C:\Users\Administrador\megafabrica-sdlc status --porcelain` que no queda nada sin commitear y con `git log --oneline` que hay exactamente un commit.
2. Retirar el motor de BT según "Retiro del motor de BT" (sección 2). Si cualquier paso falla, detenerse y reportar; lo borrado queda preservado en el commit del repo nuevo.
3. Verificar BT: `git status --porcelain` solo muestra los cambios esperados del retiro; ninguna ruta de `apps/`, `services/`, `packages/`, `infra/` cambiada por la corrida; los scripts del `package.json` ya no apuntan a archivos inexistentes.
4. Repetir `install --target c:\Users\Administrador\BorondoTours --dry-run` y adjuntar el plan de instalación limpia en el informe final, sin escribir.
5. Escribir `final-report.md` con la salida real de cada verificación.

## 10. Requisito agregado por el usuario (ronda 4) — kit completo por agente

Cada agente ejecutable debe tener un "kit" declarado, verificable por el CLI (lint/registry check) y descrito en su ficha de rol:
1. **Skills propias por rol** (además de las genéricas compartidas): al menos una skill específica del rol con el estándar de la sección 5.
2. **MCP por equipo o mini-área**: además del MCP por rol, agrupar servidores por equipo/mini-área (p. ej. plataforma, datos, seguridad, producto) que comparten varios roles; mapa área→MCP→roles. Mismas reglas de keys (solo nombres de variables) y de no redeclarar servidores de usuario/powers.
3. **Tools open source**: catálogo de herramientas de GitHub que cada rol puede usar (CLI/bibliotecas), con propósito, roles, licencia (preferir MIT/Apache; marcar las demás), comando de instalación por SO y si requiere runtime. Ejemplo obligatorio a incluir: microsoft/markitdown (convierte PDF, DOCX, XLSX, PPTX, HTML, etc. a Markdown; MIT) para roles que ingieren documentos. Nunca instalar en esta corrida: solo catálogo + `doctor` que detecta si están presentes.
4. **Memoria**: memoria por agente y por área sobre el bus (lecciones, decisiones, errores recurrentes), escrita solo vía CLI, sin PII, con reglas de retención y de cómo se consulta al iniciar una tarea.
5. **Documentación**: referencias por rol (docs del proyecto, estándares, enlaces) declaradas en el kit, con divulgación progresiva.
6. **Conexiones entre agentes**: grafo de colaboración explícito: pares del mismo nivel (consulta, revisión cruzada, respaldo) y escalamiento a agentes de alto nivel (conductor, revisor/árbitro, líder de área). Definir el protocolo por el bus (quién puede pedir qué a quién, artefacto de la solicitud, respuesta esperada) y validarlo en registry check (sin aristas a roles inexistentes o inactivos).
7. **Métodos de excelencia por área**: cada área aplica métodos de conocimiento y mejora como procedimiento y plantilla de artefacto: 5 porqués, Ishikawa/espina de pescado, A3, PDCA, postmortem sin culpa, retrospectiva, AAR (revisión después de la acción), FMEA, ADR, pre-mortem, Kaizen, y los que el diseño justifique. Mapa área→métodos, disparadores (p. ej. todo incidente, rechazo repetido o defecto escapado activa 5 porqués + postmortem), y que las lecciones resultantes alimenten la memoria (punto 4) y las métricas AgentOps.
El diseño debe incorporar esto sin explotar el número de agentes (los kits se componen de piezas compartidas por área) y mantener compatibilidad v0.

## 11. Cambio de arquitectura (ronda 5): fábrica central + proyecto liviano, multi-herramienta

Reemplaza el modelo "install por copia" del diseño aprobado. Objetivo del usuario: que cualquier persona use la megafábrica de inmediato en cualquier proyecto solo leyendo el contexto y el steering del proyecto, con costo eficiente, y desde cualquier app de IA: Kiro IDE, Kiro Crew, kiro-cli, Claude Code y Codex (y otras que lean AGENTS.md).

1. **Central (repo megafabrica-sdlc):** todo lo pesado vive solo aquí y no se copia: prompts de agentes, skills, plantillas, esquemas, scripts/motor, recetas, packs, catálogos MCP y tools, métodos, manual. Se localiza con la variable `MF_HOME` (con fallback documentado, p. ej. ruta en el perfil o clon hermano) y el proyecto fija la versión con un tag/commit de git en un lockfile pequeño.
2. **Proyecto:** una sola carpeta de contexto (nombre neutro, p. ej. `.factory/`; el diseño decide) con perfil, bus, memoria, registry renderizado, estado, hallazgos y actividades. Todo resultado de trabajo queda en el repo del proyecto.
3. **Adaptadores delgados por herramienta**, generados y actualizados por `mf link` (idempotente, con `--dry-run`, `unlink`, `status`, `doctor`): `AGENTS.md` (fuente portable común), steering corto de Kiro, archivos mínimos de agente en `.kiro/agents/` y `.claude/agents/` que referencian el prompt central, y lo equivalente para Codex/kiro-cli/Crew. Verificar en la documentación oficial de CADA herramienta cómo descubre agentes, skills, comandos/recetas, steering/reglas y MCP, y si admite referencias a archivos fuera del repo; marcar VERIFICADO/NO VERIFICADO y diseñar el fallback (stub con contenido mínimo + instrucción de leer `MF_HOME`) donde no se pueda referenciar.
4. **Steering/AGENTS.md rigen todo:** dicen a cada agente qué leer en la fábrica central, dónde escribir en la carpeta de contexto del proyecto y las reglas (CLI único escritor de control, sin PII, producción humana). El contexto siempre cargado debe ser mínimo (presupuesto de tokens explícito y medido por un lint); el resto con divulgación progresiva.
5. **Arranque inmediato:** documentar y probar "cero instalación pesada": clonar la fábrica, definir `MF_HOME`, ejecutar `mf link` en el proyecto (o, sin Node, que el agente siga AGENTS.md manualmente) y trabajar. Funciona para otra persona, otra máquina y CI.
6. **Se mantiene** todo lo demás del diseño aprobado: 32 agentes, packs, carriles, entradas no-PRD, AgentOps, MCP por rol/área y reglas de keys, kit de la sección 10, memoria, grafo, métodos, compatibilidad v0, runtime Node ≥22 sin dependencias, portabilidad de SO. Los comandos install/upgrade/adopt se sustituyen o reducen según el nuevo modelo; la adopción de copias v0 (BT, almia-infra, GFourmis) pasa a "migrar a link".
7. Verificación final adaptada: e2e de `mf link` por pack y por herramienta sobre directorios temporales, medición del contexto siempre cargado, `mf link --dry-run` contra BorondoTours sin escribir.

## 12. Ronda 7: velocidad, puerta funcional y observador de pruebas

1. Construcción: el código (L03-L25) sigue en serie, agrupado en vueltas; el contenido (L26-L37) va en ramas paralelas con archivos disjuntos y una sola revisión conjunta en esfuerzo medio; L38 integra.
2. La puerta deja de repetir la batería técnica (ya corrió y se revisó en cada lote). Queda una puerta FUNCIONAL corta:
   - Una sola corrida de la verificación base (smoke: tests + typecheck + lint de contenido) para confirmar que todo junto sigue en verde.
   - Escenarios funcionales de punta a punta sobre un proyecto temporal: `mf link` con `core,web-app`; una feature de ejemplo recorre `discovery` hasta `release` con el CLI; un incidente recorre `incident` → `postmortem` y dispara los 5 porqués; la memoria y AgentOps reflejan lo ocurrido; los adaptadores de Kiro, Claude Code y Codex se generan y `registry check` pasa.
   - Lo que protege acciones irreversibles se conserva: escaneo de secretos, `mf link --dry-run` contra BorondoTours sin escribir, y la revisión independiente antes del único commit y del retiro del motor de BT.
3. Observador de pruebas (nuevo, se construye junto al motor del kit, L17): cada vez que un agente ejecuta una verificación (tests, lint, `registry check`, `verify`), su resultado se registra vía CLI en `activities/` y, si es un fallo, en `findings/`. Reglas de automejora: un mismo fallo repetido 2+ veces en una corrida o en 3 corridas abre un `method-record` de 5 porqués y propone una lección en memoria; un lote o paso rechazado 2 veces abre un A3; las lecciones aprobadas se inyectan en el paso 3b (consulta de memoria) de la siguiente tarea del rol. En Kiro se implementa como hook (`PostToolUse` sobre la ejecución de comandos, deshabilitado por defecto y activable en el perfil); en herramientas sin hooks equivalentes, el mismo registro lo hace el lanzador `.megafactory/bin/factory.mjs` y el comando `factory verify`, para que funcione en cualquier herramienta. Sin PII, solo resumen del resultado (comando, exit code, conteos, ids de tests fallidos).

## 13. Ronda 8: menos bucles, más exactitud (aplica desde la próxima iteración)

Objetivo: que cada vuelta se apruebe a la primera. Un rechazo cuesta una iteración completa.

Para quien construye (build, content-*, integrate), antes de dar la vuelta por terminada:
1. Completar TODOS los lotes de la vuelta en una sola iteración (no entregar la vuelta a medias).
2. Leer todos los `lot-reviews/V*.md` y `lot-reviews/L*.md` existentes y confirmar que ninguno de sus hallazgos se repite en lo nuevo. Hallazgos ya vistos: `any` nuevos, umbrales o valores fijos en el código en vez de leerlos de configuración o del registro, reglas `R*` o lints sin test propio (positivo y negativo).
3. Autorrevisión con la misma lista del revisor: cada criterio "Terminado" del lote en `plan.md` cumplido y citado con su evidencia en `lot-verification/`; cada regla nueva con test; sin `any`; sin valores fijos; sin `console.log` fuera de la salida del CLI; funciones ≤50 líneas.
4. Si un hallazgo del revisor se puede detectar con una máquina, convertirlo en chequeo automático dentro de `pnpm verify:repo` o `lint:content` (con test), para que no vuelva a depender de una revisión.

Para quien revisa (review, review-content, final-review):
1. Bloquear solo por defectos reales: comportamiento incorrecto, seguridad o permisos, criterio "Terminado" incumplido, test faltante de una regla nueva o regresión.
2. Lo demás (estilo, nombres, mejoras, documentación menor) va como no bloqueante y lo corrige la vuelta siguiente sin rechazar la actual.
3. Entregar en una sola pasada todos los hallazgos de la vuelta, no por partes.

## 14. Ronda 9: los roles humanos pasan a ser agentes (prevalece sobre design.md donde choque)

Decisión del usuario: la megafábrica es de agentes; el único humano es el usuario. Los 48 roles que el diseño dejó como fichas humanas (`h:<rol>`) se convierten en agentes de gobierno.

1. Sin explosión: agrupar los 48 roles en ~11 agentes de gobierno por modos (criterio I6 por artefacto de decisión verificable: `decision-record`/aprobación en el bus). Agrupación sugerida (el constructor la ajusta y documenta la tabla rol-antiguo → agente → modo, con un lint que exija que todo `h:<rol>` antiguo quede cubierto): `product-owner` (product owner, portafolio, PMO, stakeholders), `engineering-manager` (gestión de ingeniería, capacidad), `change-authority` (CAB, cambio normal/emergencia, PIR), `incident-commander` (mando de incidentes, comunicaciones, guardia), `privacy-officer` (DPO, privacidad, legal), `risk-audit` (dueño de riesgo, auditoría interna, GRC), `ai-governance` (gobierno de IA, riesgo de modelos), `data-governance` (dueño y custodio de datos), `service-desk` (soporte L1-L3, clientes), `vendor-asset` (proveedores, activos TI, licencias, compras), `enterprise-architect` (arquitectura empresarial). Prefijo `sdlc-` como los demás; pertenecen a `core` o `enterprise-governance` según corresponda.
2. Autoridad delegada: cada agente de gobierno puede DECIDIR y registrar aprobaciones con actor `agent:<rol>` solo para clases de decisión delegables declaradas en el perfil (`profile.governance.delegated`, con valores por defecto conservadores: priorización, aprobación de postmortem, cambio normal en dev/staging, aceptación de riesgo bajo umbral, PIR). Todo queda auditado en el bus.
3. Reservado al usuario (no delegable, fijo en código, con test): ejecución o despliegue en producción, `git push`/publicar, borrar datos o recursos, gastos y credenciales, y firmas con efecto legal externo. Para esto el agente de gobierno prepara el paquete de decisión (resumen, riesgos, opciones, recomendación) y la fábrica pausa con el comando `approve --what ... --by human:` para el usuario.
4. El grafo de escalamiento termina en estos agentes; `human-escalation` apunta solo al usuario y solo para la lista del punto 3. Las RACI se rehacen con agentes; el usuario figura como `A` únicamente en lo reservado.
5. Dónde se construye, sin vueltas extra: motor (actor `agent:` en `approve`, clases delegables, lista reservada, lint de cobertura) en las vueltas pendientes de build-core (L13 gobierno y L15-L17 kit/grafo); contenido (prompts, skills propias, fichas con 9 encabezados, kits) en la rama E (L34-L35) en lugar de las 48 fichas humanas. Los revisores verifican contra esta sección.

## 15. Ronda 10: organización jerárquica de agentes 1:1 (REEMPLAZA la agrupación de la sección 14)

Decisión del usuario: cada rol es un agente especialista propio; no se agrupan roles en un agente. El único humano es el usuario.

1. Los 48 roles antes humanos pasan a ser 48 agentes `sdlc-<rol>`, uno por rol, cada uno con su kit completo (sección 10: skill propia, MCP, tools, memoria, docs, conexiones, métodos) y el estándar de calidad de la sección 5. Se elimina la agrupación en ~11 agentes de la sección 14. Siguen vigentes de la sección 14: autoridad delegada por perfil (punto 2), lista reservada al usuario fija en código con test (punto 3) y RACI con agentes (punto 4).
2. Estructura por niveles:
   - Líder global: `sdlc-conductor`. Recibe la tarea, la clasifica, la delega al área dueña, sigue el avance, integra resultados entre áreas y REPORTA al usuario (resumen, resultados, decisiones pendientes).
   - Líder de área: un agente supervisor dedicado por área (`sdlc-<area>-lead`), que no ejecuta trabajo de rol. Recibe la tarea del líder global, la reparte entre los roles de su área, revisa la coherencia del resultado del área, desbloquea (entra a apoyar con la ejecución o decide dentro de su autoridad) y devuelve el resultado al líder global. Si el área actual tiene un rol que ya hace de líder, ese rol sigue como ejecutor y se crea el supervisor.
   - Ejecutores: los agentes de rol (32 existentes + 48 nuevos). Hacen el trabajo y devuelven artefactos al líder de su área.
3. Flujo y eficiencia (para no gastar de más):
   - Tarea de un solo rol: el líder global delega directo al ejecutor y el líder de área solo interviene si hay bloqueo o revisión de área. Tarea de varios roles de un área: pasa por el líder de área. Tarea de varias áreas: el líder global ordena por dependencias y corre en paralelo lo independiente.
   - Bloqueo: ejecutor → par del área → líder de área → líder global → usuario (solo para lo reservado o si nadie con autoridad puede resolverlo).
   - Separación de funciones: quien ejecuta no aprueba; la revisión la hace otro agente (revisor o líder de área), nunca el mismo rol.
   - Todo viaja por el bus (solicitudes, resultados, escalamientos), nunca por el chat.
4. Dónde se construye, sin vueltas extra de diseño: motor (rol de líder de área, delegación global→área→rol, escalamiento por niveles, actor `agent:`, clases delegables, lista reservada, lint de que cada rol pertenece a un área con líder y de que todo antiguo `h:<rol>` es agente) en las vueltas pendientes de build-core (L13 y L15-L17); contenido de los 48 agentes nuevos y de los supervisores en la rama E (L34-L35) en lugar de las fichas humanas. Los packs siguen activando solo los agentes que cada proyecto necesita.

## 16. Correcciones del usuario sobre las decisiones (prevalece sobre todo lo anterior)

La lista vigente y numerada está en `decisiones-usuario.md` (misma carpeta). Cambios respecto de las secciones previas:

1. **Herramientas:** además de Kiro (IDE, CLI, Crew), Claude Code y Codex, se agregan adaptadores para **Cursor, GitHub Copilot y Antigravity**. Verificar en su documentación oficial cómo descubren reglas, agentes, prompts/comandos y MCP (VERIFICADO/NO VERIFICADO con URL), y generar el puente por contexto con `mf link --tools cursor,copilot,antigravity`. Se construye en los lotes de adaptadores (L24-L25), sin bucle de diseño extra.
2. **Puente:** por contexto como base para todas las herramientas. Un servidor MCP propio de la fábrica (que exponga los comandos del CLI) queda documentado como opción para v2, no se construye en el MVP. CLI instalable como paquete: futuro.
3. **Agente CTO** (`sdlc-cto`): por encima del conductor. Acompaña al gerente humano en cada MVP y producto: traduce objetivos de negocio en trabajo, prioriza, recibe los reportes del conductor y los convierte en reportes gerenciales (resultado, avance, riesgos, costo, decisiones con recomendación). Para lo reservado (§14 punto 3) prepara el paquete y emite la pre-aprobación; el gerente humano confirma. La confirmación humana de lo reservado sigue siendo obligatoria y fija en código.
4. **Formato gerencial:** todo mensaje o informe hacia el humano usa el formato ejecutivo del punto anterior. El humano es "el gerente" (cualquier persona que use la fábrica), nunca un nombre propio.
5. **Planificación de la fábrica:** el conductor planifica por flujo (receta) y divide en lotes solo cuando el tamaño del trabajo lo requiere.
6. **Ciclos:** solo se repite un ciclo por defectos bloqueantes o riesgosos para el negocio. Todos los defectos se reportan (los no bloqueantes quedan en `findings/` y se corrigen después).
7. **Métodos:** además de los 13 actuales, investigar y agregar los que hagan más efectivos a los agentes (por ejemplo DMAIC, Lean y los 8 desperdicios, Teoría de Restricciones, OODA, Cynefin, Event Storming, Impact Mapping, Design Thinking, priorización RICE/WSJF, Definition of Ready/Done), con plantilla y disparadores. Contenido en los lotes de métodos.
8. **Commit:** el único commit final lleva mensaje detallado (resumen + qué se agregó por área/módulo + verificaciones + pendientes). Después del commit y del retiro del motor viejo de BorondoTours, publicar en GitHub con la cuenta `ChrisPol01`: crear `ChrisPol01/megafabrica-sdlc` **privado** (salvo que el gerente diga otra cosa) con `gh` ya autenticado y hacer push de `main`. Si `gh` no está instalado o no está autenticado como `ChrisPol01`, no hacer push y dejar los comandos exactos en `final-report.md`.
9. **BorondoTours tras el retiro:** queda solo con su configuración propia de Kiro (steering 00-18 y 20 reescrito, skills `bt-*`, `figma-sync`, `oss-scout`, `mcp.json`, `docs/`, `.agents/tasks/`).

Confirmación del gerente sobre §16 punto 8: repo PRIVADO y publicación automática al cerrar, sin pedir otra confirmación. Comandos esperados (con `gh` autenticado como ChrisPol01): `gh auth status` (verificar cuenta), `gh repo create ChrisPol01/megafabrica-sdlc --private --source C:\Users\Administrador\megafabrica-sdlc --remote origin --push`. Si el repo ya existe, `git remote add origin` + `git push -u origin main`. Nunca `--public`, nunca `--force`.

## 17. Mitigación de riesgos de las secciones 14-16 (obligatorio, sin pasos nuevos)

**R1. Cambios sin bucle de diseño (jerarquía, aprobaciones por agente, CTO, 48 agentes, 3 herramientas).**
- Antes de escribir código de la siguiente vuelta de build-core, el constructor escribe `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\design-delta-s14-16.md` (máx. ~300 líneas): por cada punto de §14-§16, qué módulos del motor y del registro cambian, qué invariantes, reglas `R*` y deltas de compatibilidad se agregan, qué tests los fijan, y en qué lote cae. Debe declarar explícitamente los choques con lo ya construido (L01-L08) y cómo se resuelven sin romper compatibilidad v0.
- El revisor de esa vuelta revisa el delta junto con el código; un choque sin resolver es bloqueante. Si el delta exige reabrir algo ya aprobado de forma grande (más de un lote de retrabajo), el revisor lo marca y el paso pausa con `warning` para el gerente en vez de iterar.

**R2. Costo del contenido de ~59 agentes nuevos (48 roles + supervisores + CTO).**
- Mantener 1:1 y el estándar de calidad, pero no repetir texto: lo común vive una sola vez (protocolo, kit de área, skill compartida del área, plantilla de supervisor) y cada agente referencia esas piezas. La skill propia y el prompt de cada rol contienen solo lo específico del rol (sus modos, artefactos, decisiones, disparadores proactivos, anti-patrones).
- Primero generar con script el esqueleto mecánico (role.json, encabezados de ficha, kit desde las tablas de área, entradas del registro) a partir de `research.md` §4 y de los catálogos; el modelo escribe solo el contenido sustantivo.
- Los 10 supervisores comparten una plantilla `area-lead`; cada uno agrega solo su área: roles, criterios de reparto, revisión de coherencia y escalamiento.

**R3. Herramientas nuevas, puntos de partida ya encontrados (verificar y marcar VERIFICADO/NO VERIFICADO con URL):**
- Cursor: reglas en `.cursor/rules/*.mdc` con frontmatter `description`, `globs`, `alwaysApply` (sin frontmatter se ignoran); también lee `AGENTS.md`. Docs: https://cursor.com/docs/rules . Skills y subagentes en versiones recientes: verificar en docs oficiales.
- GitHub Copilot: agentes personalizados como archivos `*.agent.md` (nombres con `.`, `-`, `_`, letras y dígitos); también instrucciones de repositorio y `AGENTS.md`. Docs: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents y https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents .
- Antigravity: lee `agents.md`, skills y `workflows/` como comandos slash según el codelab oficial https://codelabs.developers.google.com/autonomous-ai-developer-pipelines-antigravity ; agentes personalizados en Antigravity CLI: https://antigravity.google/docs/cli/commands/agents . La carpeta exacta del proyecto (fuentes de terceros mencionan `.agent/`) es NO VERIFICADO hasta confirmarla en la doc oficial.
- Si un punto no se confirma en documentación oficial: puente por `AGENTS.md` (siempre presente) y el archivo específico se genera solo detrás de `--tools <herramienta> --experimental`, documentado como tal. Nunca bloquear la construcción por esto.

**R4. Presupuesto de iteraciones.** Aplicar §13 (terminar la vuelta completa, autorrevisión, bloquear solo por defectos reales). Si build-core agota iteraciones, se pausa y el orquestador extiende; no es fallo.

**R5. Seguridad trazable (respuesta del gerente: sí).** El contenido de seguridad (rama A, L27) y el manual (rama F) incluyen una tabla "protección → estándar" (CWE-78, CWE-22, OWASP Top 10, OWASP ASVS, OWASP Top 10 para aplicaciones LLM, NIST SP 800-53 AC-5/AC-6, prácticas SRE/ITIL) para cada regla del motor y del perfil, y revisan que no falte ningún control de OWASP LLM Top 10 ni de ASVS aplicable a agentes; lo que falte se registra en `findings/` y, si es de motor, se agrega con test en integrate.

## 18. Ajuste a §13 (prevalece): lotes que no caben en una iteración

Si una vuelta no cabe en una iteración, el constructor entrega los lotes que terminó COMPLETOS (con evidencia) y deja el resto en `pending`. Un lote pendiente NO es un defecto: el revisor aprueba los lotes terminados, no rechaza por los que faltan, y escribe `complete=false` para que el bucle continúe con los siguientes. Rechazar solo por defectos reales dentro de lo entregado. Nunca entregar un lote a medias. Próxima iteración: escribir primero `design-delta-s14-16.md` (§17 R1) y luego seguir con L15-L18.

## 19. Multi-proyecto: aislamiento total y aprendizaje entre proyectos sin mezclar contextos

Decisión del gerente: una fábrica, muchos proyectos aislados (cada repo es un "tenant"). La fábrica aprende de todos, pero ningún contexto de un proyecto se mezcla con otro.

1. **Aislamiento (se mantiene y se prueba):** bus, memoria, hallazgos, actividades y perfil de un proyecto viven solo en su `.megafactory/`. La central nunca guarda datos de proyecto; el motor no puede escribir en la central (I27). Ningún agente carga contexto de otro proyecto. Test e2e: dos proyectos enlazados a la misma central, una corrida en cada uno, y ningún archivo, id, término o lección de uno aparece en el otro ni en la central.
2. **Dos niveles de memoria:**
   - **Memoria del proyecto** (privada, en su repo): todo lo específico. Nunca sale del proyecto salvo por el punto 3.
   - **Conocimiento de la fábrica** (central, `library/knowledge/`): lecciones y patrones generalizados, etiquetados por nicho, stack, pack y rol, nunca por proyecto.
3. **Promoción (cómo aprende la fábrica):**
   - En el proyecto: `factory memory promote <id>` genera una versión generalizada de la lección en `.megafactory/learning/outbox/`. El CLI quita nombres del proyecto, clientes, rutas, dominios, ids y términos del perfil (lint `leakage` + `scan --strict` sobre la lista de términos del propio proyecto) y rechaza si queda algo. Procedencia: solo un hash opaco, nunca el nombre del proyecto.
   - En la central: `mf learn import --from <proyecto>` lee el outbox, vuelve a pasar `leakage`, `scan --strict` y deduplicación, y escribe la propuesta en `library/knowledge/`. La aprueba el agente de gestión del conocimiento (uno de los 48 roles) con el revisor como segunda firma; queda en el reporte del CTO y es reversible por git. No requiere al gerente salvo que el perfil lo pida.
   - Opt-in por proyecto: `profile.learning.shareToFactory` (por defecto `false`; para proyectos de clientes con confidencialidad debe quedar en `false`). Sin opt-in, el proyecto aprende solo para sí mismo.
4. **Consulta:** al iniciar una tarea el agente consulta primero la memoria del proyecto y después el conocimiento de la fábrica filtrado por los packs y el stack del perfil. El conocimiento central nunca sobrescribe una decisión del proyecto.
5. **Dónde se construye:** memoria y promoción en L16 (pendiente), comando `mf learn import` y test de aislamiento de dos proyectos en L21 o en integrate; contenido de la skill de gestión del conocimiento en la rama de los 48 roles. Sin vuelta de diseño extra; registrar en `design-delta-s14-16.md` (renombrar a `design-delta.md` si conviene).

## 20. BorondoTours sigue en uso durante la construcción (prevalece sobre las comprobaciones "BT sin cambios")

El gerente va a seguir trabajando en BorondoTours con la fábrica v0 mientras se construye la megafábrica (otros workflows o sesiones pueden cambiar `apps/`, `services/`, `packages/`, `infra/`, `docs/` y el bus v0 `.kiro/factory/bus/`).
1. Las verificaciones de "BT sin cambios" dejan de comparar todo BT contra la línea base. Solo deben comprobar que ESTA corrida no escribió en BT fuera de `.agents/tasks/megafabrica-2026-10-12/`. Si BT cambió por otra causa, se registra como aviso, no como fallo.
2. Las pruebas y la simulación de migración usan siempre la copia del snapshot o copias temporales, nunca el BT vivo, salvo el `mf link --dry-run` / `mf migrate --dry-run` de la puerta (solo lectura).
3. Cierre: antes de retirar el motor v0 de BT, comprobar que no haya corridas v0 abiertas en `.kiro/factory/bus/` (manifest sin cerrar o eventos en las últimas 2 horas). Si las hay, NO retirar: hacer el commit y el push de la megafábrica, dejar el retiro pendiente en `final-report.md` y avisar con `warning`. Los artefactos del bus v0 de BT se preservan (se migran con `mf migrate`, no se borran).

## 21. El repo ya está publicado (prevalece sobre §9, §16 punto 8 y la confirmación de publicación)

Por un incidente de seguridad en el equipo, el gerente pidió un respaldo inmediato. Estado actual:
- `C:\Users\Administrador\megafabrica-sdlc` tiene el commit `f7a14ad` ("chore: respaldo de la megafábrica SDLC v1 en construcción (L01-L14)") y el remoto `origin` = https://github.com/ChrisPol01/megafabrica-sdlc (PRIVADO), rama `main` ya subida y con seguimiento.
- Durante la construcción NO hacer commits ni push (salvo que el gerente pida otro respaldo).
- Cierre: ya no es "un único commit" ni se crea el repo. Se hace UN commit final con el mensaje detallado de §16 punto 8 encima de `f7a14ad`, y `git push origin main`. Nunca `--force`, nunca reescribir historia, nunca `gh repo create`. Antes del push: `gh api user --jq .login` debe devolver `ChrisPol01`; si no, `gh auth switch --hostname github.com --user ChrisPol01`. Comprobar `git log --oneline` = 2 commits (respaldo + final) y `git status` limpio.

## 22. Desbloqueo de V3 (prevalece; lo decide el gerente)

El choque de V3 con §14/§15 (líderes de área ejecutores, escalamiento a fichas `h:`) NO es un defecto de V3: §14-§15 se agregaron después de que V3 empezó. Es trabajo planificado.
1. Siguiente iteración de build (antes de L19): escribir `design-delta-s14-16.md` (§17 R1) y aplicar en el código ya construido de L15-L18 los cambios de §14/§15/§19: supervisores dedicados `<area>-lead` como líderes, escalamiento ejecutor → par → líder de área → conductor → CTO → gerente (solo lista reservada), sin aristas a `h:`; los antiguos `h:<rol>` pasan a roles-agente (el contenido de esos agentes lo escriben las ramas de contenido; aquí solo el registro, el grafo y los lints). Después, si queda capacidad, seguir con L19-L21.
2. Revisor: V3 se considera aprobada salvo por esa adaptación; no rechazar por lo planificado en el punto 1. Rechazar solo si la adaptación entregada es defectuosa o incompleta respecto del delta.
3. Una iteración = entregar todo lo que quepa, completo y verificado; lo pendiente no es defecto (§18).

## 23. Skills de terceros como base del contenido (aplica a las ramas de contenido L26-L37)

Antes de escribir cada skill, prompt o ficha, la rama lee `C:\Users\Administrador\megafabrica-sdlc\.agents\tasks\megafabrica-v1\research-skills-external.md` (catálogo de skills de GitHub priorizado por estrellas y calidad, con licencia y riesgo) y usa las 1-3 mejores fuentes de su skill o rol:
- Licencia MIT/Apache/BSD/CC-BY: se puede adaptar contenido, con atribución en `THIRD_PARTY.md` (repo, licencia, archivos usados).
- Sin licencia o restrictiva: solo referencia o inspiración; reescribir con palabras propias; nunca más de 30 palabras textuales.
- Nunca copiar scripts ejecutables de terceros ni instrucciones que desactiven protecciones, exfiltren datos o contengan prompt injection.
- La skill resultante debe cumplir el estándar de la sección 5 y adaptarse a la fábrica (bus, CLI, kit, MCP por rol); no es una copia.
Si el informe no existe todavía cuando empiece la rama, escribir con conocimiento propio y dejar anotado en `findings/` qué skills conviene enriquecer después.

## 24. Segundo respaldo (prevalece sobre §21 en el conteo de commits)
Hay un segundo commit de respaldo `834b694` ya subido a origin/main. El cierre agrega el commit final encima; quedan 3 commits (respaldo 1, respaldo 2, final). Mismas reglas: sin --force, sin reescribir historia.

## 25. Puerta: hallazgos de G5 no ejecutados (para gate-verify y reverify)
Los 3 BLOCKER de `gate/findings-G5.json` no son defectos: G5 no pudo ejecutar ningún comando (el shell devolvió exit -1, fallo del sandbox). La terminal ya funciona (verificado: `node --version` responde). gate-verify debe reclasificarlos como "no ejecutado" y asignar la re-ejecución de las verificaciones de G5 (dry-run de `mf link` y `mf migrate` contra BorondoTours en solo lectura, con git status antes y después, y compat v0) a un grupo `fix-*`, que solo las corre y registra la evidencia. No reportarlos como defectos del producto. BorondoTours tiene ~400 cambios propios del gerente (§20): comparar solo antes/después de la ejecución, no contra una línea base antigua.
