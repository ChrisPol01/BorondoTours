# Brief — Unificación ERP + B2B en una sola app de gestión (Agencia + Operador)

Fecha: 2026-10. Origen: decisión de negocio y de esfuerzo del dueño del producto. Plazo muy cerrado.

## Decisión de negocio (dada, no se discute)
- `apps/erp` (App 2, ERP agencia BorondoTours) y `apps/b2b` (App 3, portal de operadores) se UNIFICAN en
  una sola aplicación de gestión.
- Motivo: varios proveedores (operadores turísticos) también tienen ventas internas (actúan como agencia).
  Una sola app les da más control: gestión como OPERADOR (inventario de tours, cupos, manifiesto, radar,
  equipo, flota, liquidaciones) y como AGENCIA (CRM, cotizaciones, ventas, comisiones, clientes).
- Algunos proveedores ya tienen sus propias apps; otros no. La app debe servir a ambos (módulos activables).
- Las funciones de los tours de cada operador que ya están conectadas a requerimientos (Spec-G, Spec-I,
  Spec-K, Spec-J) SE MANTIENEN.
- BorondoTours misma es agencia (y en Fase 2 también operador con tours propios).

## Navegación imaginada por el dueño
Sidebar con etiquetas colapsables en paralelo: "Agencia" y "Operador". Click en Agencia despliega todas las
opciones de agencia; click en Operador, las del operador. Cada tenant ve solo los grupos/módulos que tiene.

## Inspiración de módulos (imagen de Odoo que adjuntó el usuario; NO todos, solo los necesarios)
Discuss, CRM, Sales, Accounting, Inventory, Manufacturing, Purchase, Project, Timesheets, Website,
Point of Sale, Helpdesk, Events, Sign, Recruitment, Time Off, Expenses, Attendances, Field Service,
Planning, Email Marketing, Rental, Subscriptions, Barcode, Shop Floor, Quality, Maintenance, Repairs, PLM,
Employees, Appraisals, eLearning, Live Chat, Calendar, Appointments, Documents.

## CRM de código abierto propuesto por el usuario
https://github.com/kevinrivm/vocero-crm — CRM de WhatsApp self-hosted, MIT, Next.js 15 (App Router) +
React 19 + TypeScript estricto + PostgreSQL + Drizzle + Better Auth + Tailwind + SSE + Docker.
Una instancia = un negocio (single-tenant). Bandeja WhatsApp, pipeline kanban, contactos (import CSV),
agente IA con "Laboratorio" de auto-evaluación, pantalla de resultados.
La idea: tomar su ESTRUCTURA para adelantar trabajo, adaptándolo a nuestro stack y a nuestro diseño.
Si existe un CRM open source más robusto y con más estrellas, compararlo.

## Contexto del proyecto (leer bajo demanda, no todo)
- Visión/stack/roles: `docs/00-Inicio/Stack-Tecnologico.md` (RBAC 10 roles), `APP2-ERP-Agencia.md`, `APP3-B2B-Operadores.md`.
- Specs: `docs/01-Specs/Spec-F-Auth.md`, `Spec-G-ERP-Operativo.md`, `Spec-H-ERP-Agencia.md`, `Spec-I-B2B-Portal-Operadores.md`, `Spec-K-Planificacion-Operativa.md`, `Spec-J-BorondoTours-App-Movil.md`.
- Datos: `docs/03-Knowledge/Modelo-Datos-Core.md` (fuente de verdad, 54 tablas), `Modelo-Comisiones.md`, `Politica-Datos-Personales.md`.
- Arquitectura: `docs/02-ADRs/ADR-011-Arquitectura-Consolidada.md`, `docs/04-Tech-Design/Arquitectura-Sistema.md`, `docs/DECISIONES-PENDIENTES.md`.
- Estado real del código: steering `.kiro/steering/17-estado-del-proyecto.md` (ERP y B2B son scaffold Astro).
- Stack frontend vigente: steering `.kiro/steering/02-tech-stack.md` (Astro + React islands, Tailwind 4, Shadcn/UI, TanStack Query, Nanostores) y kit de componentes `.kiro/steering/18-kit-componentes.md`.
- Marca: `.kiro/steering/12-brand-identity.md`, `docs/04-Tech-Design/DESIGN.md`.

## Restricciones
- No resolver dentro de esta investigación las decisiones pendientes #1 (Hono vs NestJS), #2 (Astro vs Vite),
  #15 (SAM vs CDK): señalarlas si afectan.
- Sin PII ni secretos en los informes. Respetar Ley 1581 (Habeas Data) y Ley 1480.
- Cada informe en español, en `.agents/tasks/erp-b2b-unificacion-2026-10/`, solo lectura sobre el código.
