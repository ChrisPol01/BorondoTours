# 📋 01-Specs — Especificaciones Funcionales

Cada Spec detalla los requerimientos funcionales (códigos RF) de un dominio del sistema.

| Spec | App | Dominio | Roles principales |
|---|---|---|---|
| `Spec-A-Discovery.md` | B2C | Descubrimiento: landing, catálogo, búsqueda, filtros, mapa | CLIENT |
| `Spec-B-Tour-Detail.md` | B2C | Detalle de tour, calendario semáforo, cross-selling | CLIENT |
| `Spec-C-Checkout.md` | B2C | Checkout, pagos OnePay.la, IVA, Split Fare, reembolsos, publicidad en flujo | CLIENT |
| `Spec-D-Client-Portal.md` | B2C | Portal del viajero: reservas, voucher, cancelación, chat, reseñas | CLIENT |
| `Spec-E-Loyalty.md` | B2C | Borondo Coins, niveles, XP, referidos, recompensas | CLIENT |
| `Spec-F-Auth.md` | Transversal | Login, JWT, Google OAuth, OTP, RBAC 10 roles, tenant isolation | Todos |
| `Spec-G-ERP-Operativo.md` | ERP | Tours, instancias, asignaciones, payouts, incidentes, seguros | COORD, GERENTE |
| `Spec-H-ERP-Agencia.md` | ERP | CRM Kanban, cotizaciones, comisiones, gamificación, SUPER_ADMIN | AGENT, GERENTE, SUPER_ADMIN |
| `Spec-I-B2B-Portal-Operadores.md` | B2B | Inventario, manifiesto multicanal, radar, AgencyLinks, finanzas | OPERATOR_ADMIN, OPERATOR_COORD |
| `Spec-J-BorondoTours-App-Movil.md` | Mobile | Check-in QR, offline, GPS, caja menor, estados de campo | OPERATOR_GUIDE, OPERATOR_DRIVER |
| `Spec-K-Planificacion-Operativa.md` | B2B | Calendarios de planificación, proveedores, contingencias, alistamiento, cierre, panel del guía | OPERATOR_COORD, OPERATOR_GUIDE, COORD |

> **Convención de códigos RF:** cada Spec usa el prefijo de su letra (ej. `C-RF07`, `K-RF15`).
> La trazabilidad BR→FR→NFR vive en `../03-Knowledge/Trazabilidad-Requerimientos.md`.
