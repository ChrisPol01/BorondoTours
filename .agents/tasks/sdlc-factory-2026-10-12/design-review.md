# Revisión de diseño — Fábrica SDLC multi-agente (iteración 4)

Fecha: 2026-10-12. Revisor: subagente de revisión de diseño (lectura en frío).
Documentos revisados: `design.md` (iteración 4), contrastado con `protocolo-usuario.md`, `research.md` y los hallazgos previos `design-review.json` (F-01…F-21 de la tercera revisión).
Método: revisión del diseño como documento (sin re-ejecutar suites). Verificación de hechos del repo con lectura directa de `apps/web/package.json`, además de los hechos ya listados en el encabezado de `design.md`. No se tomó la palabra del diseño en los puntos verificables; donde se pudo contrastar, se contrastó.

## Veredicto

APPROVED. No quedan hallazgos HIGH y no hay más de 3 MEDIUM nuevos. Los 21 hallazgos de la tercera revisión (1 HIGH, 8 MEDIUM, 12 LOW) están atendidos en el cuerpo del documento con mecanismos concretos y ubicados, no diferidos a backlog. La revisión en frío de esta iteración no encontró hallazgos HIGH ni MEDIUM nuevos.

## Verificación de hechos del repo (no se tomó la palabra del diseño)

- `apps/web/package.json`: confirmado que `test` es `vitest` (modo watch) y existe `test:run` (`vitest run`). Esto valida la premisa de F-13 (el deny exacto de `pnpm --filter @borondo/web run test` evita colgar el paso) y el uso de `test:run` en los modos build/fix.
- `apps/web/package.json`: `test:e2e` es `playwright test` y `@playwright/test` está presente como devDependency; coherente con el diseño del subcomando `run-e2e` y con F-14.
- `@vitest/coverage-v8` presente en web; coherente con la lógica `COVERAGE=yes|no` de `toolcheck`.
- §16.1 del diseño fue efectivamente corregida (F-02): el texto ya dice que la identidad del agente es verificable frente a otros agentes por permisos por agente, y que solo el nombre humano es procedimental. Antes afirmaba lo contrario.
- Hechos ya declarados y verificados por el autor en iteraciones previas (`.astro/` versionado, `@playwright/test` 1.61.1 exporta `./cli`, `packages/db` sin `drizzle.config.*`, scripts `infra:*` con `--template-file infra/template.yaml`): son consistentes entre sí y con los steering 16/17; no se re-verificaron todos por lectura, pero los que sí se contrastaron coinciden.

## Revisión hallazgo por hallazgo (F-01…F-21 de la tercera revisión)

### F-01 (era HIGH) — Idempotencia del paso 6 por modo — RESUELTO
El diseño mueve la decisión de "saltar" del agente al CLI: `registry/agents.json` define `modes: {<mode>: {artifacts, doneWhen}}` (§4.6) y `status --role --mode --json` devuelve `{applicable, skippable, reasons[]}`. `applicable:false` cuando todos los `artifacts` del modo están `waived` o no planificados → `RESULT=skipped` sin publicar, lo que evita el `E_TRANSITION` de `waived → draft`. `skippable:true` exige no stale, inbox del modo vacío, huella igual y `doneWhen`; con eso `telemetry-dev` con `decision: pending` no se salta, un `BuildReport.status: partial|blocked` nunca se salta y `prod-approval` exige `HUMAN_APPROVAL release-prod`. `PHASE_GATE_FAILED` deja acción `rehacer` en el inbox de cada productor citado (§4.4). Tablas `doneWhen` completas en §4.6 y test `skip.test.mjs` definido en §14. Cierra el HIGH; ya no es un hallazgo. Severidad residual: ninguna.

### F-02 (era MEDIUM) — Identidad del agente autodeclarada — RESUELTO
`renderPermissions(agentName, profile, extras)` (§4.6, "Identidad del agente") niega por agente `*--agent=*` y `*--agent Y`/`*--agent Y *` para cada otro agente `Y`, de modo que cada agente solo puede pasar su propio nombre. `reassign` queda negado salvo al conductor. En el CLI, `sign` da `E_SIGNER` si el agente ya firmó ese hash con otro rol (además de la exclusión del productor, §6.2). `registry check` compara el bloque de permisos con el render por agente. §16.1 corregida. Tests `permissions.test.mjs` y `sign.test.mjs`. Resuelto.

### F-03 (era MEDIUM) — Lecturas sin lock ven estado intermedio — RESUELTO
`status`, `gate --check`, `verify`, la comprobación de `run start` y `advise` toman el lock de la feature con espera corta (≤2 s) y lo liberan (§6.3, "Lecturas con lock corto"). Sin lock, `status` responde `consistent:false` y `gate --check` sale con 3 (`E_LOCK`), nunca `E_INTEGRITY` falso. Documentado en §6.1 para cada comando. Test en `events.test.mjs` (un `--check` entre el append y el rename no da integridad). Resuelto.

### F-04 (era MEDIUM) — C1 no acotado a las fases evaluadas — RESUELTO
C1 evalúa siempre integridad del manifest y de la cadena, pero reporta `modified:<id>` solo para artefactos de fases ≤ la pedida (§7.1), igual que C4/C6. Así el `--check` de contracts del paso 2b no falla mientras otro paso reescribe su BuildReport/QualityReport. Test en `gates.test.mjs` (BuildReport.frontend modificado → `--check` contracts 0, `gate build` 2 con `modified`). Resuelto.

### F-05 (era MEDIUM) — Señal por RESULT no definida — RESUELTO
§8.3 añade una tabla de señal por `RESULT`: `ok|skipped|rejected|dispute_opened|blocked` → success; acción humana en paso interactivo → warning; `E_INTEGRITY` real → warning; `error` solo del conductor. §8.2 clasifica `E_TRANSITION`, `E_SIGNER`, `E_STALE` y `E_NOT_FOUND` como `RESULT=blocked` sin reintentar. Esto garantiza que `checkpoint-build` se alcance aunque un paso termine `blocked` o `dispute_opened`, habilitando la pausa por disputa. Añadido a la corrida de humo de V6. Resuelto.

### F-06 (era MEDIUM) — Negociación sin salida "otra ronda" — RESUELTO
La primera posición pasa la disputa a `in_negotiation`; la ronda actual es `rounds.length`; `dispute resolve --verdict continue` (rondas < 3) cierra la ronda con `no_agreement` y abre la siguiente con `loopStatus: continue`; `escalated` solo con 3 rondas; `loop verdict` del bucle `dispute.negotiation` escribe `stop` con `approved|agreed|rejected` y `continue` con `continue|escalated`; una posición sobre una disputa resuelta da `E_TRANSITION` (§4.5, §6.1, §9.2 árbitro). El árbitro tiene cuatro salidas explícitas. Tests en `disputes.test.mjs`. Resuelto.

### F-07 (era MEDIUM) — CONTRACT_UPDATED cerrable en modo firma — RESUELTO
Los ítems del inbox llevan `forModes`; `inbox --ack`/`--ack-all` exigen `--mode` y rechazan ítems de otro modo (`E_RULE`), así el modo firma no cierra un `CONTRACT_UPDATED` dirigido a `[build,fix]` (§4.5, §6.1). Un `publish` de `build-report:<role>` con hash nuevo marca ese `CONTRACT_UPDATED`; republicar sin cambios con uno pendiente da `E_RULE contract-update-unaddressed` (§6.1 `publish`). Test en `cli.integration`. Resuelto.

### F-08 (era MEDIUM) — CR-* / M-* a cargo de rol sin artefacto — RESUELTO
Regla `cr-owner-applicable` al publicar `compliance-requirements` (ownerRole activo para `scope.layers`) y `mitigation-owner-applicable` en el ThreatModel (`verification: test` exige dueño con build report requerido; devops-sre solo `config|review`, revisadas en `release.review`), ambas en §5.1. La regla de trazabilidad de build (§5.2) aplica solo a los `CR-*` cuyo dueño tiene build report requerido. Tests en `rules.test.mjs` y `trace.test.mjs`. Resuelto.

### F-09 (era MEDIUM) — Disputa en quality sin salida — RESUELTO
El conductor en modo *gate* aplica la lógica de checkpoint ante disputas sin cerrar (§9.2); el `NEXT` de *close* cubre `quality-gates` (reanudar → relanzar build → relanzar quality), con el `checkpoint-build` reevaluando `gate --phase build` en el caso b (`advanced:false`). Caso en §16.3 y test en `cli.integration`. Resuelto.

### F-10 (era LOW) — Lista de modos del paso 2b difería — RESUELTO
La lista única de modos del paso 2b queda en §8.1 (9 modos, con `prod-approval`); §1 remite a ella. Resuelto.

### F-11 (era LOW) — design-qa y tech-writer saltan sobre código ajeno — RESUELTO
`BuildReport.inputFingerprint` sobre la unión de los `filesChanged` revisados (uiux-a11y: frontend; tech-writer: todos); la idempotencia del paso 6 exige que coincida para saltar (§4.6 `skippable`, §5.1 BuildReport). Resuelto.

### F-12 (era LOW) — ops podía escribir infra/lib/** (CDK) — RESUELTO
El perfil `ops` niega `fs_write` sobre `infra/lib/**`; el cambio es manual tras `HUMAN_APPROVAL decision:#15` (§4.6, tabla de perfiles). Resuelto.

### F-13 (era LOW) — test en modo watch cuelga el paso — RESUELTO y VERIFICADO
Deny exacto de `pnpm --filter @borondo/web run test` en `developer` y `auditor` (§4.6). Verificado por lectura de `apps/web/package.json`: `test` es `vitest` (watch) y existe `test:run`. Resuelto.

### F-14 (era LOW) — run-e2e podía exceder timeout / construir sin EC e2e — RESUELTO
La ficha de qa-e2e fija el timeout en 1 800 000 ms y, sin EC `testLevel: e2e`, no lanza Playwright (`tools[].available:false`, "sin EC e2e") (§6.1 `run-e2e`, §9.2 qa-e2e). Resuelto.

### F-15 (era LOW) — Claim del conductor compartido entre corrida y disputa — RESUELTO
El claim del conductor usa la clave `conductor:<runId>`, así el `handoff` de la receta de disputa no libera el claim de la corrida principal pausada (§4.5, ranuras de corrida). Test en `runs-loops.test.mjs`. Resuelto.

### F-16 (era LOW) — guard-bus no detecta ediciones humanas — RESUELTO
Se reasigna el alcance: `guard-bus` queda para `scan` y para avisar de artefactos firmados editados por agentes; las ediciones humanas de control las detectan `verify` y C1 (los triggers de archivo solo ven cambios del agente). Añadido a V3 (§15) para confirmación empírica, con fallback documentado. Resuelto.

### F-17 (era LOW) — Plan B de V2 (retirar permissions) no aclaraba la pérdida — RESUELTO
§15 V2 y el README aclaran que retirar `permissions` tira también los deny de comandos humanos y de identidad (la puerta de Fase 3 deja de ser verificable frente a los agentes). Segunda barrera opcional sin dependencias: los comandos humanos exigen TTY y reescribir el id de la feature. Resuelto.

### F-18 (era LOW) — Título con metacaracteres cae en los deny de encadenado — RESUELTO
El conductor sanea el título (`;`, `|`, `&&`, `||`, `$(`, comilla invertida → espacio) antes de invocar `init --title` (§9.2 conductor *init*). Resuelto.

### F-19 (era LOW) — V1 no comprobaba fileCheck sobre archivos ignorados — RESUELTO
V1 (§15) comprueba que `stopCondition.fileCheck` lea los `state/<loop>.json` ignorados por git; si no, se sacan del `.gitignore` o se usa `containsText`. Resuelto.

### F-20 (era LOW) — Cobertura ≥80% del CLI no se hacía cumplir — RESUELTO
`run.mjs --coverage` agrega `--test-coverage-lines=80` (Node ≥22.8), así el PR 1 falla por debajo del umbral (§2 tabla, §14, §19 PR 1). Resuelto.

### F-21 (era LOW) — Herencia de permisos de subagentes sin verificar — RESUELTO
V2 (§15) verifica la herencia; según el resultado, `figma-sync` recibe un `permissions` acotado o chat-run se limita a discovery y contracts. El riesgo está acotado con fallback documentado tanto en §8.4 (figma-sync) como en §9.2 (chat-run). Resuelto.

## Observaciones no bloqueantes (NIT)

- NIT-A: El bloqueo real de la Fase 3 frente a agentes depende de supuestos sobre permisos del IDE que solo se confirman en V2 (precedencia deny/ask/allow, sintaxis de `permissions.rules`, herencia de subagentes). El diseño ya no hace que la *corrección* dependa de V2 (el paso 2b de `PROTOCOL.md` y `E_PHASE` del CLI bloquean sin permisos), y la pérdida de verificabilidad si `permissions` no existe está documentada con mitigaciones (TTS/TTY). Es un riesgo de entorno conocido, no un defecto del diseño; se arrastra como nota de implementación.
- NIT-B: Varios hechos del repo los declara el autor como "verificado por lectura" en iteraciones previas (p. ej. `.astro/` con 6 archivos versionados, exports de `@playwright/test` 1.61.1). En esta revisión solo se re-verificó una muestra (`apps/web/package.json`), que coincidió. No es bloqueante, pero conviene reconfirmar los exports de `@playwright/test` en V8 contra la versión instalada real (el `package.json` declara `^1.49.1`, el diseño cita 1.61.1 como resuelta: el rango lo admite, pero la versión exacta la fija el lockfile).

Ninguna de las dos observaciones es HIGH ni MEDIUM; no afectan el veredicto.

## Conclusión

El diseño es internamente consistente, trazable y adaptado al stack real. Todos los hallazgos de la tercera revisión están resueltos con mecanismos verificables (reglas del CLI, tests nombrados en §14, puntos de validación de entorno en §15 con fallback). La revisión en frío no introduce hallazgos HIGH ni MEDIUM nuevos. Veredicto: APPROVED.
