# Plan: Reestructuración de documentación y steering (estándar Kiro)

Fecha: 2026-10-07. Solo planificación; no se movió nada. Contrato del loop: el revisor escribe `docs/05-Dev-Log/review.json` con `{"verdict":"APPROVED"}` o `CHANGES_REQUESTED`.

## 1. Evidencia real del repo (verificada)

| Elemento | Resultado |
|---|---|
| `apps/` | Existe: `web`, `erp`, `b2b`. Los 3 `package.json` dependen de `astro`, `@astrojs/react`, `react`. **No** usan Vite SPA directo ni TanStack Router (no verificado a fondo, solo deps de estas 3 libs). |
| `services/` | Existe: `1-core` … `9-ads`. `1-core` y `3-bookings` usan `hono`. Ningún paquete revisado depende de `@nestjs/core`. |
| `packages/` | Existe: `contracts`, `db`, `domain`, `ui`. |
| Raíz | `package.json` (pnpm 9.15, turbo), `pnpm-workspace.yaml`, `turbo.json`, `turbo.config.json`, `tsconfig.base.json`, `docker-compose.yml`, `infra/template.yaml` (SAM) + `infra/package.json`. |
| `AGENTS.md` | No existe (raíz). Crear solo si se decide; NO es obligatorio (ver §8). |
| `docs/` raíz | Existe pero **vacío** (0 archivos). |
| Vault real | `.kiro/steering/.obsidian/` = config Obsidian (app.json, appearance.json, community-plugins.json, core-plugins.json, graph.json, templates.json, workspace.json, `plugins/`) + `docs/` (66 archivos, ~700 KB). Git rastrea 77 archivos bajo `.kiro/steering/.obsidian`. |
| Copia paralela | `.obsidian/docs-2/03-Knowledge/` (5 archivos, 85 KB, git rastrea 5 en `.obsidian`): Estructura-Contable, Guia-Tramites-DIAN, Handoff-Contabilidad, Manual-Operacion-Contable, Pipeline-Facturacion-y-Declaracion. **Son contenido NO presente en el vault de steering** (excepto Estructura-Contable que el vault steering ya tiene, y que 05-business-rules referencia). Hay que fusionar, no descartar. |
| Mojibake | **Falso positivo.** Lectura byte a byte como UTF-8 no encuentra `â€`/`Ã©` en ningún `.md` (steering ni docs). Solo se ve al leer con PowerShell 5 sin `-Encoding UTF8`. No reparar. Regla: usar `Get-Content -Encoding UTF8` y `git mv`/`Move-Item` (no reescribir con Out-File por defecto). Verificar final: 0 coincidencias del patrón `â€|Ã[©³±¡]` leyendo bytes UTF-8. |
| Front matter | 01–09 y 13-ui-ux-skill tienen `inclusion`. Sin front matter (= always implícito): `10-AWS-…(Borondo-Tours)` (sin extensión, 3.7 KB), `11-inventario-tecnico-aws` (7 KB), `12-brand-identity` (14.6 KB), `13-figma-bridge-safety` (14.8 KB). |
| Peso always actual | ~ 8.5+3.5+3.8+4.9+2.4+2.9+2.4+2.3+2.1 (01–09 ≈ 33 KB) + 3.7+7.0+14.6+14.8 = **~73 KB** inyectados en cada sesión, más el vault (~700 KB) bajo steering. Meta: always < 12 KB. |
| Referencias a rutas viejas | `.kiro/steering/05-business-rules.md:74` (`.obsidian/docs/03-Knowledge/Estructura-Contable.md`); `apps/web/tests/fixtures/evidence.ts` (3 rutas `.obsidian/docs/...`) y `apps/web/src/lib/redesignManifests.test.ts` líneas 144-145 (código/tests: ver §6); `.obsidian/docs-2/03-Knowledge/Handoff-Contabilidad.md` (líneas 74, 147-149, dice que la fuente de verdad es `.obsidian/docs/`). El grep de `.kiro/specs` falló por parámetro; repetir con `Select-String -Path (Get-ChildItem .kiro\specs -Recurse -File).FullName`. |

## 2. Decisiones pendientes detectadas (a registrar en `docs/DECISIONES-PENDIENTES.md`)

1. **Backend: NestJS vs Hono.** Evidencia del repo: `services/*` usan Hono (1-core, 3-bookings), sin NestJS. `02-tech-stack.md` (Hono+LWA) está respaldado → **vigente = Hono + LWA**. Docs que aún dicen NestJS: Stack-Tecnologico, Estructura-Proyecto, Frontend-Architecture, ADR-011, Arquitectura-Sistema, Spec-F/G, Domain-Financiero, etc. No reescribir silenciosamente: añadir banner `> ⚠️ Desactualizado: ver DECISIONES-PENDIENTES #1` y crear/proponer ADR-012 "Hono sobre Lambda (supera la parte NestJS de ADR-011)" con estado **Propuesto** (el usuario aprueba).
2. **Frontend: Vite SPA vs Astro.** Evidencia: apps/web, erp, b2b usan Astro + React islands → `02-tech-stack` Astro vigente para las 3. Docs ADR-011 SW4 y Frontend-Architecture dicen "React+Vite SPA, NO Next/Astro"; `04-coding-standards` y `Stack-Tecnologico` hablan de TanStack Router. DECISIÓN PENDIENTE: confirmar que ERP/B2B también son Astro (02-tech-stack lo dice en una sección y dice Vite SPA en otra: contradicción interna). Resolver en `02` marcando "ERP/B2B: Astro (código) — confirmar".
3. **Redis/BullMQ/Socket.io residual:** Spec-F (RF-F04, RF-F06, RF-F10, §10 riesgos), ADR-006 (rate limit Redis, blacklist Redis, WAF F1), Spec-D/G/H/I/J (BullMQ, Socket.io), `07-legal-compliance` (BullMQ, Meilisearch), `Trazabilidad` (parcialmente anotado). Estrategia: banner de equivalencia al inicio de cada Spec afectada (ya existe en Trazabilidad); no reescribir cada RF. Registrar en pendientes.
4. **Borondo Coins / Spec-E en pausa** (decisión 2026-09-27): mantener en 05-business-rules como "EN PAUSA, no implementar en B2C"; resumir en always.
5. **WAF/X-Ray:** ADR-006 dice WAF activo; ADR-011 lo difiere a F3. Marcar ADR-006 con nota (ADR-011 gana).
6. **Conteo de tablas:** Modelo-Datos-Core tiene 54; `03-Knowledge/README` dice 41; `Estructura-Proyecto` dice 41; `Arquitectura-Sistema` §5 lista 41 pero nota 54; corregir a 54 (confirmar con `grep -c "^## "` del Core).
7. **Facturación/contable:** `.obsidian/docs-2` (5 docs contables) fuera del vault steering → fusionar a `docs/03-Knowledge/` (ver §3).
8. **Pagos:** "Onepayla" vs "OnePay.la" (normalizar a OnePay.la en 02/05).
9. **Infra "vigente":** README raíz y 02-ADRs/README dicen ADR-008; correcto = ADR-011 (ADR-005/008 superados).
10. **`apps/web` tests** referencian `.obsidian/docs/...` (código fuera de alcance): proponer actualizar solo si el test de evidencia comprueba existencia de archivo; si es solo string literal, dejar y reportar.

## 3. Movimientos de archivos (en orden; usar `git mv`; repo git confirmado)

Pre-chequeo: `git status --short` limpio o anotar cambios previos; no usar `git add -A`.

1. `git mv .kiro/steering/.obsidian/docs/00-Inicio docs/00-Inicio` y lo mismo para `01-Specs`, `02-ADRs`, `03-Knowledge`, `04-Tech-Design` (incluye `Services/`, `Mobile-Specific/`, `API/`, `Shared/` si existen), `05-Dev-Log`, `Templates`, y el `README.md` → `docs/README.md`. **Cuidado:** `docs/05-Dev-Log/` ya contiene `plan.md` (este archivo, no rastreado) y `HANDOFF-2026-09-29-Frontend.md` vendrá desde el vault: mover archivo por archivo en 05-Dev-Log si el destino ya existe (`git mv` de directorio fallaría con destino existente). Si `docs/` vacío, `git mv` de carpeta funciona; para 05-Dev-Log mover contenido (`git mv origen/* destino/`).
2. Config Obsidian: `git mv .kiro/steering/.obsidian/{app.json,appearance.json,community-plugins.json,core-plugins.json,graph.json,templates.json,workspace.json,plugins}` → `docs/.obsidian/`. Revisar `workspace.json`/`graph.json`: si contienen rutas absolutas a `.kiro/steering`, ajustarlas. Luego borrar `.kiro/steering/.obsidian/` vacío (`Remove-Item` solo si está vacío).
3. Verificar conteo: 66 archivos de docs en destino (`(Get-ChildItem docs -Recurse -File).Count` ≥ 66 + config); `.kiro/steering` ya no contiene `.obsidian`.
4. Fusionar `.obsidian/docs-2/03-Knowledge/*` → `docs/03-Knowledge/`: Estructura-Contable ya existe en destino: comparar con `git diff --no-index` y conservar la versión más completa (reportar). Mover los otros 4 con `git mv`. Retirar `.obsidian/docs-2` y `.obsidian/` raíz si queda vacío (el `.obsidian` raíz solo contiene docs-2). Actualizar en `Handoff-Contabilidad.md` las rutas `.obsidian/docs...` → `docs/03-Knowledge/` y eliminar la nota de "copia paralela".
5. Nuevos subdirectorios: `docs/06-Operaciones/` con README.
6. Renombres en steering (`git mv`):
   - `10-AWS-Multi-Account-&-SSO-Profile-Management-(Borondo-Tours)` → `10-aws-multi-account-sso.md`
   - `13-figma-bridge-safety.md` se queda en 13.
   - `13-ui-ux-skill.md` → `14-ui-ux-skill.md` (actualizar su título interno `# 13.` → `# 14.`).
   - 11/12 conservan numeración.

## 4. Mapa de inclusión y contenido de steering (objetivo always ≤ 12 KB)

| Archivo final | Modo | Contenido / acción | Tamaño obj. |
|---|---|---|---|
| `00-documentation-map.md` (NUEVO) | always | Dónde vive cada cosa (`docs/…`), qué archivo es fuente de verdad (Core, ADR-011/12, Stack), qué leer según tarea, regla "no cargar docs completos; leer solo la Spec pedida". Sin wikilinks `#[[file:]]` de docs grandes. | <2 KB |
| `01-project-identity.md` | always | Mantener, recortar a ~1.8 KB; añadir enlace a `docs/00-Inicio/Contexto-Para-IA.md` (ruta en texto). Corregir "Fase 3: ECS+Aurora" → Lambda/Aurora. | ~1.8 KB |
| `02-tech-stack.md` | always | Condensar a stack vigente resumido (~3 KB): Astro+React islands (3 apps, ver pendiente #2), Hono+Bun+LWA, Drizzle, RDS+Proxy, DynamoDB, EventBridge/SQS/StepFn, monorepo (apps/services/packages reales). Quitar detalle largo de buenas prácticas duplicadas; enlazar a ADR-011. Resolver contradicción interna Astro-vs-Vite marcándola. | ~3 KB |
| `03-roles-and-workflow.md` + `08-planning-methodology.md` + `09-continuous-learning.md` | fusionar en `03-workflow.md` (always) | Flujo plan→implementar→verificar, roles resumidos, sizing, anti-patrones, cuándo actualizar docs. Eliminar 08 y 09 (`git rm` tras fusionar). | ~2.2 KB |
| `04-coding-standards.md` | always (recortar) | Quedar ~2.5 KB (quitar secciones NestJS → decir "Hono"; mantener TS strict, i18n, SafeHtml, API REST/QUERY, Git). Acoplar con Hono. | ~2.5 KB |
| `05-business-rules.md` | always (resumir) | Solo reglas críticas ~2.5 KB; mover detalle (NIIF 15, yield, manifiesto, cancelaciones) a `docs/03-Knowledge/Reglas-Negocio-Detalle.md` con ruta en texto. Marcar Coins EN PAUSA. Corregir ruta de `Estructura-Contable` a `docs/03-Knowledge/…`. | ~2.5 KB |
| `06-quality-gates.md` | always | Mantener ~1.8 KB (compactar). | ~1.8 KB |
| `07-legal-compliance.md` | `fileMatch` `["services/**","packages/db/**","packages/domain/**"]` | Quitar Meilisearch/BullMQ residual. Detalle larga → `docs/03-Knowledge/Politica-Datos-Personales.md` (ya existe). | ~2.5 KB |
| (NUEVO) `04b-frontend-ux.md` o integrar en 14 | `fileMatch` `["apps/**/*.tsx","apps/**/*.astro","apps/**/*.css","packages/ui/**"]` | A11y WCAG, i18n, tokens semánticos, SafeHtml, patrón de interrupción; enlazar `docs/04-Tech-Design/DESIGN.md` y `Catalogo-Componentes-UI.md` (por ruta). | ~2 KB |
| `10-aws-multi-account-sso.md` | `auto` (`name: aws-multi-account-sso`, description: "Perfiles SSO, cuentas dev/prod/root y comandos aws/sam; usar al operar AWS") | Dejar resumen ≤1.5 KB (regla: siempre `--profile`, nunca credenciales). IDs de cuenta/perfiles completos → `docs/06-Operaciones/AWS-Multi-Account-SSO.md`. Verificar que NO haya secrets. | ~1.5 KB |
| `11-inventario-tecnico-aws.md` | `fileMatch` `["infra/**","**/template.yaml","**/samconfig.toml"]` | Resumen 1 KB; contenido completo (IDs recursos, SES forwarding, CloudFront) → `docs/06-Operaciones/Inventario-AWS.md`. Regla "actualizar al crear recursos" se mantiene. Corregir duplicado de bloque Lambda env vars. | ~1 KB |
| `12-brand-identity.md` | `auto` (`name: brand-identity`, description: "Paleta, tipografía, tono, tokens y reglas de marca; usar al diseñar UI o copy") | Reducir a ~3 KB (colores, tipografías, accesibilidad on-action, voz); manual completo → `docs/04-Tech-Design/DESIGN.md` y `otros/design/marca/…` (rutas en texto). | ~3 KB |
| `13-figma-bridge-safety.md` | `manual` (front matter `inclusion: manual`) | Reducir a reglas de captura (~3 KB) y mover bitácora histórica (matriz 16, estados, módulos) → `docs/06-Operaciones/Figma-Bridge-Runbook.md`. Invocación explícita `#13-figma-bridge-safety`. | ~3 KB |
| `14-ui-ux-skill.md` | `manual` | Solo renombrar. | 2.7 KB |

Suma always objetivo: 00(2)+01(1.8)+02(3)+03(2.2)+04(2.5)+05(2.5)+06(1.8) ≈ **15.8 KB**; para llegar a <12 KB: 02 → 2.5, 04 → 2, 05 → 2, 03 → 1.8, 06 → 1.5, 01 → 1.5, 00 → 1.5 ≈ 12 KB (aceptable ≤ 13 KB; reportar tamaño real con `Get-ChildItem .kiro\steering -File | measure Length -Sum`).

Todos los archivos nuevos/editados deben guardarse en UTF-8 sin BOM (`[IO.File]::WriteAllText($p,$t,(New-Object Text.UTF8Encoding $false))` o el tool `fs_write`). Front matter válido: `---\ninclusion: always\n---`; `fileMatch` requiere `fileMatchPattern`; `auto` requiere `name` y `description`.

## 5. Archivos nuevos

1. `.kiro/steering/00-documentation-map.md` (always, <2 KB).
2. `docs/00-Inicio/Contexto-Para-IA.md` (≤4 KB): qué es BorondoTours, 4 apps, 10 roles, stack vigente real (con las evidencias), fuentes de verdad, estado de fases, pendientes críticos, qué NO tocar.
3. `docs/DECISIONES-PENDIENTES.md`: tabla con las 10 decisiones de §2 (id, tema, evidencia, opciones, recomendación, dueño, estado).
4. `docs/06-Operaciones/README.md` + `AWS-Multi-Account-SSO.md` + `Inventario-AWS.md` + `Figma-Bridge-Runbook.md` (+ `Reglas-Negocio-Detalle.md` en 03-Knowledge).
5. `docs/02-ADRs/ADR-012-Backend-Hono-Astro.md` (Propuesto; registra la divergencia NestJS→Hono y Astro). Añadir fila en `ADR-Index` marcada "Propuesto — requiere aprobación".
6. `docs/05-Dev-Log/2026-10-07-Reestructuracion-Contexto.md` (reporte final: qué se movió, tamaños antes/después, decisiones pendientes, rutas corregidas, comandos de verificación) + entrada en `Dev-Log-Index.md`.

## 6. Correcciones de índices / READMEs

- `docs/README.md`: "fuente de verdad infra: ADR-011" (no ADR-008); añadir 06-Operaciones y DECISIONES-PENDIENTES; apuntar al vault `docs/.obsidian`.
- `docs/02-ADRs/README.md`: ADR-005 y ADR-008 = **Superado por ADR-011**; ADR-002 refinado (pg_trgm), ADR-003 refinado (API GW WS); añadir ADR-009, 010, 011, 012. Bloque final "Decisión de infra vigente: ADR-011".
- `docs/03-Knowledge/README.md`: 54 tablas; añadir archivos contables fusionados y Reglas-Negocio-Detalle.
- `docs/00-Inicio/README.md`: quitar fila duplicada Vision-y-Objetivos, añadir Contexto-Para-IA, nota ADR-011; `Stack-Tecnologico.md` banner sobre Hono/Astro (pendiente #1/#2).
- `docs/00-Inicio/Stack-Tecnologico.md`, `Estructura-Proyecto.md`, `Frontend-Architecture.md`, `Arquitectura-Sistema.md` ("41 tablas" → 54): añadir banner de desactualización; Estructura-Proyecto: "41" → 54.
- `docs/04-Tech-Design/README.md`: lista real (Services/, Mobile-Specific/, Catalogo-Componentes-UI, Domain-Financiero, etc.), quitar "pendiente de poblar" donde ya hay contenido; fuente de verdad ADR-011.
- `docs/03-Knowledge/MCP-Setup-Guide.md`: rutas "vault" → `docs/`.
- ADR-006: nota "Redis → DynamoDB/API GW throttling; WAF diferido (ADR-011)". Spec-F: banner Redis→DynamoDB.
- Wikilinks relativos (`[[../02-ADRs/…]]`) siguen válidos al conservar estructura; verificar con script que cada `[[…]]` resuelve (excluir wikilinks a `Spec-F-Dashboard` que ya están rotos en Spec-D, `ADR-001-Onepayla-Split-Marketplace` es correcto, `../Services/Maquina-Estados-Booking`: ok). Reportar rotos existentes (p. ej. `[[Spec-Principal]]` en plantilla ADR, `[[Spec-F-Dashboard]]`).

## 7. Grep de rutas rotas a corregir (post-movimiento)

Ejecutar `Select-String`/`grep_search` por `\.obsidian[/\\]+docs` y `steering[/\\]\.obsidian` en todo el repo excepto `node_modules`, `.worktrees`, `.git`, `otros`.
- `.kiro/steering/05-business-rules.md:74` → `docs/03-Knowledge/Estructura-Contable.md`.
- `.kiro/specs/**` (si hay referencias): corregir solo la ruta y reportar.
- `docs/03-Knowledge/Handoff-Contabilidad.md`: rutas (líneas 74, 147-149).
- `apps/web/tests/fixtures/evidence.ts` y `apps/web/src/lib/redesignManifests.test.ts:144-145`: **código de aplicación; no editar** salvo que `pnpm --filter @borondo/web test:run` falle por no encontrar el archivo; en ese caso cambiar solo las 5 cadenas a `docs/…` y reportar (cambio mecánico y mínimo). Decidir tras leer cómo se usa `document`.
- `.claude/` `.worktrees/`: ignorar (copias).

## 8. Lo que NO se toca

Código de aplicación (`apps/`, `services/`, `packages/`, `infra/`) salvo la excepción mínima de §7; `otros/`; `.claude/`; `.kiro/hooks`; `.kiro/specs` (solo ruta rota, reportada); `.worktrees`; `node_modules`; archivos `tmp-*.json`/`__preview.log` en raíz (reportar como basura candidata, no borrar); `docs/05-Dev-Log/HANDOFF-2026-09-29-Frontend.md` (solo rutas, si las hay). No crear `AGENTS.md` (opcional: proponer en DECISIONES-PENDIENTES). No `git commit`, no push.

## 9. Pasos de ejecución (en orden) y verificación

- [ ] 1. Movimientos §3.1–3.3 (docs + config Obsidian). Verificar: `git status --short | measure` renames; 0 archivos bajo `.kiro/steering/.obsidian`; `docs` contiene 00-05 + Templates.
- [ ] 2. Fusión de `.obsidian/docs-2` (§3.4) y arreglar rutas del Handoff. Verificar: 5 archivos contables en `docs/03-Knowledge`; `.obsidian/` raíz eliminada.
- [ ] 3. Reescribir steering según §4 (fusionar 03+08+09, condensar 02/04/05/06, crear 00, renombrar 10 y 14, front matter correcto, mover detalle a `docs/06-Operaciones` y `03-Knowledge`). Verificar: lista de front matter por archivo (script que imprime `inclusion`/patrones), suma always ≤ ~13 KB, 0 archivos sin front matter, nombres sin `&`, `(`, `)`.
- [ ] 4. Crear `Contexto-Para-IA.md`, `DECISIONES-PENDIENTES.md`, ADR-012 propuesto, READMEs §6 (banners, conteo 54, ADR-011). Verificar: tamaño Contexto ≤4 KB; grep `ADR-008.*vigente|fuente de verdad.*ADR-008` = 0 en READMEs.
- [ ] 5. Grep rutas rotas §7 y corregirlas. Verificar: grep = 0 fuera de excepciones listadas.
- [ ] 6. Chequeos finales: mojibake (lectura bytes UTF-8, patrón `â€|Ã[©³±¡]` → 0 en docs y steering); script de wikilinks (listar rotos, corregir los provocados por la mudanza; los preexistentes se reportan); `pnpm --filter @borondo/web test:run` solo si se tocaron esos tests; `git status` sin archivos sueltos en la raíz de `.kiro/steering/.obsidian`.
- [ ] 7. Escribir `docs/05-Dev-Log/2026-10-07-Reestructuracion-Contexto.md` y actualizar `Dev-Log-Index.md`. Verificar que `HANDOFF-2026-09-29-Frontend.md` sigue presente.
- [ ] 8. (Revisor) Escribir `docs/05-Dev-Log/review.json`: `{"verdict":"APPROVED"|"CHANGES_REQUESTED","findings":[…]}` tras comprobar los criterios de §10.

## 10. Criterios de aceptación

1. `docs/` contiene todo el vault (≥66 archivos + 5 contables), con wikilinks relativos intactos; `.kiro/steering/.obsidian` y `.obsidian/` raíz ya no existen.
2. `.kiro/steering` solo contiene steering (sin docs); todos con front matter válido; always ≤ ~13 KB (reportar cifra).
3. Sin mojibake, UTF-8 sin BOM en archivos escritos.
4. Contradicciones registradas (no resueltas en silencio) en `DECISIONES-PENDIENTES.md`; READMEs coherentes con ADR-011 y 54 tablas.
5. Cero referencias a `.obsidian/docs` fuera de las excepciones documentadas; no se tocó lo listado en §8; sin commits.
