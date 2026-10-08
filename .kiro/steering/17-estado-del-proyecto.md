---
inclusion: always
---
# Estado del proyecto (verificado: 2026-10-07)

| Pieza | En código | Sólo en docs |
|---|---|---|
| B2C `apps/web` | Implementado (52 tests) | - |
| ERP / B2B | Scaffold | Funcionalidad completa |
| Móvil Expo | No existe | APP4, Spec-J |
| `services/1-core` | Parcial, 0 tests | - |
| `services/2..9` | Scaffold | Tours, reservas, pagos, operadores, notificaciones, chat, jobs, ads |
| `packages/contracts`, `domain` | Iniciales, 0 tests | Reglas financieras completas |
| `packages/db` | Cliente + schema inicial | 54 tablas del Core |
| `packages/ui` | 32 archivos, 6 tests | - |
| `infra/` | SAM y CDK presentes | Despliegue core (Lambda, RDS) |
| Integraciones | - | OnePay.la, Siigo, Split Fare, publicidad |
| Borondo Coins | - | En pausa (Spec-E) |

Tests: solo web y ui tienen; servicios, contracts, db y domain tienen 0, aunque las reglas los exigen en finanzas y RBAC.

Pendientes abiertos (`docs/DECISIONES-PENDIENTES.md`): #1 Hono vs NestJS, #2 Astro vs Vite, #11 rotar la API key del plugin Obsidian (acción del usuario), #13 CI, #14 scripts db, #15 SAM vs CDK.

Mantenimiento: actualizar al cerrar cada Spec o feature; si la fecha tiene más de 30 días, re-verificar listando directorios.