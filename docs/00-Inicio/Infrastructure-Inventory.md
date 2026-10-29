# 🗺️ Inventario Maestro de Infraestructura y Desarrollo

## 1. Repositorios y Alojamiento
| Componente | Nombre | Repositorio (GitHub) | Alojamiento (Deploy) |
|---|---|---|---|
| Monorepo Core | `borondo-monorepo` | `github.com/org/repo` | AWS ECS Fargate |
| Base de Datos | `borondo-db` | N/A | Amazon Aurora PG |
| Bucket Privado | `borondo-docs` | N/A | Amazon S3 |

## 2. Mapa de API y Funciones Críticas
| Servicio | Clase/Controlador | Función Principal | Rol Requerido |
|---|---|---|---|
| Auth | `AuthController` | `login()`, `refreshToken()` | Público |
| Wallet | `WalletService` | `creditCoins()`, `debitCoins()` | SYSTEM / ADMIN |

## 3. Modelo de Datos (Esquema Resumido)
| Tabla | Modelo (Drizzle) | Fuente de Verdad |
|---|---|---|
| `users` | `usersSchema` | `src/db/schema/users.ts` |
| `bookings` | `bookingsSchema` | `src/db/schema/bookings.ts` |

## 4. Roles y Acceso (RBAC)
| ID Rol | Nombre | Permisos Clave |
|---|---|---|
| 1 | CLIENT | Ver tours, Reservar, Usar Wallet |
| 6 | OPERATOR_ADMIN | Ver Manifiesto, Liquidar Payouts |