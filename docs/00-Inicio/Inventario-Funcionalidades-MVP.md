---
tags: [inicio, inventario, mvp, prioridades, roadmap]
created: 2026-06-07
updated: 2026-06-07
status: en-revision
---

# 📦 Inventario Priorizado de Funcionalidades — BorondoTours MVP

> Este documento lista TODAS las funcionalidades apificables del sistema, priorizadas por fase,
> con complejidad estimada y dependencias. Sirve como roadmap de implementación.

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| **S** | Small (1-2 archivos, menos de 4h) |
| **M** | Medium (3-6 archivos, 4-12h) |
| **L** | Large (7-15 archivos, 1-3 días) |
| **XL** | Extra Large (15+ archivos, 3-5 días) |
| ⚡ | Crítico para demo/inversión |
| 🔒 | Bloquea otros features |
| 💰 | Genera ingreso |

---

## FASE 1 — MVP Demo para Inversionista (8 semanas)

### Semana 1-2: Fundación (Auth + DB + Infraestructura)

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 1 | Setup proyecto: Hono (Lambda LWA) + Drizzle + RDS PostgreSQL + RDS Proxy + SAM (IaC) | — | M | ⚡🔒 | — |
| 2 | Schema BD: Users, Tours, TourInstances, Bookings (migraciones) | Modelo-Datos | L | ⚡🔒 | #1 |
| 3 | Auth: registro email/password + verificación email | F-RF02 | M | ⚡🔒 | #1 |
| 4 | Auth: login + JWT (access + refresh token HttpOnly) | F-RF04/05 | M | ⚡🔒 | #3 |
| 5 | Auth: Google OAuth2 (Passport.js) | F-RF03 | M | ⚡ | #4 |
| 6 | RBAC: Guards + Decorators (10 roles) | F-RF01/09 | M | ⚡🔒 | #4 |
| 7 | Rate limiting + Helmet.js + CORS | F-RF10 | S | 🔒 | #1 |
| 8 | Redirección post-login por rol | F-RF01b | S | — | #6 |
| 9 | Auth: OTP por email (cambio password, cancelación) | F-RF06/07 | M | — | #4 |

### Semana 2-3: Discovery + Catálogo (Portal B2C Público)

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 10 | API: GET /tours (catálogo con paginación cursor-based) | A-RF04 | M | ⚡🔒 | #2 |
| 11 | API: búsqueda pg_trgm (typo-tolerance: q, destino, tags) | A-RF05 | S | ⚡ | #10 |
| 12 | API: filtros (región, duración, precio, dificultad) | A-RF06 | M | ⚡ | #10 |
| 13 | API: ordenamiento (popular, precio, reciente, yield_score) | A-RF07/H-RF23 | S | — | #10 |
| 14 | API: GET /tours/:slug (detalle completo) | B-RF01/02/03 | M | ⚡ | #10 |
| 15 | API: GET /tours/:id/instances (calendario semáforo) | B-RF05/06 | M | ⚡ | #2 |
| 16 | API: GET /tours/:id/nearby (PostGIS 50km) | A-RF08/B-RF09 | S | — | #10 |
| 17 | Frontend: Landing + Hero + Scrollytelling GSAP | A-RF01/02/03 | L | ⚡ | — |
| 18 | Frontend: Grid catálogo + filtros + búsqueda | A-RF04/05/06 | L | ⚡ | #10 |
| 19 | Frontend: Detalle tour + galería + calendario | B-RF01-07 | L | ⚡ | #14, #15 |
| 20 | Frontend: Auth Gate modal (no-bloqueante) | A-RF10/F-RF08 | M | ⚡ | #4 |
| 21 | Frontend: Mapa Mapbox con marcadores | A-RF09 | M | — | #10 |

### Semana 3-4: Checkout + Pagos (Core Revenue)

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 22 | API: POST /bookings/checkout (crear booking + link OnePay) | C-RF01/02 | L | ⚡🔒 | #6, #15 |
| 23 | Selector de pax por regla (edad/estatura) | C-RF02 | M | ⚡ | #22 |
| 24 | Lógica IVA (19% residentes / 0% extranjeros + pasaporte S3) | C-RF04 | M | ⚡ | #22 |
| 25 | Upload pasaporte: presigned URL S3 | C-RF04 | S | ⚡ | #22 |
| 26 | Webhook OnePay.la handler (PAYMENT_CONFIRMED + DECLINED + EXPIRED) | C-RF07 | L | ⚡🔒 | #22 |
| 27 | Datos del pasajero en checkout (manifiesto) | C-RF08 | M | ⚡ | #22 |
| 28 | Add-ons upselling en checkout | C-RF03 | S | — | #22 |
| 29 | Frontend: Wizard checkout (auth → datos → pago) | C-RF01-08 | XL | ⚡ | #22-28 |
| 30 | Email confirmación de reserva (AWS SES template) | — | M | ⚡ | #26 |

### Semana 4-5: Portal Cliente + Publicidad (Primera Fuente de Ingreso)

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 31 | API: GET /bookings/me (reservas del usuario) | D | S | ⚡ | #26 |
| 32 | API: POST /bookings/:id/cancel (cancelación escalonada) | C-RF11 | M | ⚡ | #26 |
| 33 | API: GET /bookings/:id/voucher (PDF con QR) | D-RF06 | M | ⚡ | #26 |
| 34 | Frontend: Portal cliente (lista reservas + voucher + cancelar) | D-RF01-07 | L | ⚡ | #31-33 |
| 35 | API: Ads CRUD + rotación por posición y prioridad | C-ADS01/02 | M | 💰 | #2 |
| 36 | API: POST /ads/impression + /ads/click (tracking) | C-ADS01 | S | 💰 | #35 |
| 37 | Frontend: Banners en checkout + confirmación | C-ADS01/02 | M | 💰 | #35, #29 |
| 38 | Borondo Coins: acreditación al confirmar pago (% por nivel) | E-RF03 | M | — | #26 |
| 39 | API: GET /wallet/balance + /wallet/transactions | E-RF06 | M | — | #38 |
| 40 | API: Aplicar Coins en checkout (descuento antes de IVA) | C-RF05/E-RF08 | M | — | #38 |

### Semana 5-6: ERP Básico (Gestión de Tours para Demo)

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 41 | API: CRUD Tours (crear/editar/publicar) | G-RF01 | L | ⚡ | #6 |
| 42 | API: CRUD TourInstances (fechas, cupos, bulk create) | G-RF02 | M | ⚡ | #41 |
| 43 | API: Asignar guía/vehículo a instancia | G-RF03/04 | M | — | #42 |
| 44 | Frontend: ERP panel tours + instancias + calendario | G-RF01/02 | L | ⚡ | #41, #42 |
| 45 | API: OperatorContracts (comisión por operador, inmutable) | G-RF06 | M | 🔒 | #2 |
| 46 | API: Crear operador (SUPER_ADMIN) | H-RF19 | M | — | #6 |

### Semana 6-7: SEO + Performance + Polish

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 47 | SEO: meta tags Open Graph, sitemap.xml, robots.txt | A-RF11 | S | ⚡ | #14 |
| 48 | Performance: imágenes WebP + srcset + lazy load | A-RF12 | M | ⚡ | #18, #19 |
| 49 | Skeleton loaders en catálogo y detalle | A-RF04 | S | — | #18 |
| 50 | TanStack Query: staleTime configurado por ruta | A-RF12 | S | — | #18 |
| 51 | Conciliación diaria OnePay.la (EventBridge Scheduler cron 2AM → Lambda) | C-RF10 | M | — | #26 |
| 52 | Health checks (@nestjs/terminus) | — | S | — | #1 |

### Semana 7-8: QA + Edge Cases + Demo Prep

| # | Funcionalidad | Spec | Complejidad | Prioridad | Dependencias |
|---|---|---|---|---|---|
| 53 | Cupos atómicos: SELECT FOR UPDATE al crear booking | G-RF02/B-RF05 | S | 🔒 | #22 |
| 54 | Penalidad por cancelación: cálculo por franja + PenaltyIncome | C-RF11 | M | — | #32 |
| 55 | Registro operador con docs (Empresa/Freelancer) | F-RF02b | M | — | #6 |
| 56 | Tests: lógica financiera (IVA, comisiones, penalidades, Coins) | — | L | 🔒 | #24, #38, #54 |
| 57 | Tests: RBAC guards (acceso + denegación por rol) | — | M | 🔒 | #6 |
| 58 | Deploy: AWS SAM (Lambda + API Gateway + RDS + DynamoDB) + S3/CloudFront frontend | — | M | ⚡ | Todo |
| 59 | Cargar 1 tour real con fotos, precio y calendario | — | S | ⚡ | #41, #42 |
| 60 | Pago sandbox OnePay.la end-to-end | — | S | ⚡ | #26, #58 |

**Total Fase 1: ~60 funcionalidades | Estimación: 8 semanas (1 CTO full-time)**

---

## FASE 2 — Plataforma Operativa (Semanas 9-16)

### CRM y Cotizaciones (ERP Agencia)

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 61 | Kanban pipeline del agente (6 columnas + drag and drop) | H-RF02/03 | XL | F1 completa |
| 62 | Cotizaciones: crear + preview precio + comisión estimada | H-RF06 | L | #61 |
| 63 | Link Mágico OnePay.la (generar + enviar email/WhatsApp) | H-RF07/08 | M | #62 |
| 64 | Webhook: distinguir QUOTE vs BOOK por reference prefix | H-RF09 | M | #26, #63 |
| 65 | Propiedad del lead (90 días + expiración + BullMQ job) | H-RF04 | M | #62 |
| 66 | Venta colaborativa (comisión split) | H-RF05 | M | #65 |
| 67 | Aprobación de descuento >10% (GERENTE) | H-RF06b | M | #62 |
| 68 | Venta Rápida (pago manual sin link) | H-RF24 | M | #61 |

### Comisiones de Agentes

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 69 | Cálculo automático de comisión al pago confirmado | H-RF10 | M | #64 |
| 70 | Panel de comisiones del agente (PENDING/PAID/historial) | H-RF11 | M | #69 |
| 71 | Liquidación de comisiones por período (GERENTE) | H-RF17 | M | #69 |
| 72 | Ka-ching sonoro + toast (API Gateway WebSocket + Web Audio) | H-RF12 | S | #64 |
| 73 | Leaderboard del equipo (API Gateway WebSocket real-time) | H-RF13 | M | #69 |
| 74 | Metas mensuales del agente | H-RF14 | S | #69 |

### Wallet Completo + Programa de Lealtad

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 75 | Sistema de puntos multifactorial (compras + reviews + ads) | E-RF01 | L | #38 |
| 76 | Niveles automáticos (recálculo post-booking) | D-LVL01 | M | #75 |
| 77 | Coins por ver anuncios (máx 3/día, mín 5 seg) | E nuevo | M | #36, #75 |
| 78 | Coins por reseña (tour + guía separados) | D-RF09 | M | #75 |
| 79 | Coins por referidos (código único 6 chars) | E-RF10 | M | #75 |
| 80 | Wallet: historial + exportar CSV | E-RF06/07 | M | #75 |
| 81 | Nivel visual en perfil (badge + barra progreso) | E-RF02/D-RF05 | M | #76 |

### Split Fare

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 82 | Split Fare: generar N links OnePay individuales | C-RF06 | L | #26 |
| 83 | Split Fare: estado HOLD_GROUP → CONFIRMED | C-RF06 | M | #82 |
| 84 | Split Fare: segundo cobro saldo 5 días antes (EventBridge + Step Functions) | C-RF06b | L | #82 |
| 85 | Split Fare: cancelación individual cupo (no reembolsable) | C-RF06b | M | #84 |

### Dashboard Gerente + SUPER_ADMIN

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 86 | Dashboard KPIs gerente (revenue, conversión, leads) | H-RF15 | L | #69 |
| 87 | Vista consolidada Kanban equipo | H-RF16 | M | #61 |
| 88 | Ghost Login (impersonación + audit log) | H-RF18 | L | #6 |
| 89 | Gestión operadores (crear, suspender, contratos) | H-RF19 | L | #46 |
| 90 | Ads Manager (CRUD + métricas CTR + rentabilidad) | H-RF20 | L | #35 |
| 91 | Config Loyalty (niveles editables, ajuste manual Coins) | H-RF21 | M | #75 |
| 92 | Reportes financieros consolidados (PDF/CSV) | H-RF22 | L | #69, #45 |

### Portal B2B Operador (básico)

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 93 | Dashboard operador (KPIs, ocupación, proyección) | I-RF02/03 | L | #45 |
| 94 | Crear tour (wizard 4 pasos + revisión blindada) | I-RF04 | XL | #41 |
| 95 | Edición post-publicación (TourEditRequest + diff) | I-RF05 | L | #94 |
| 96 | Manifiesto consolidado auto-fill | I-RF08 | XL | #27, #94 |
| 97 | Exportar manifiesto (PDF campo + CSV + por agencia) | I-RF09 | M | #96 |
| 98 | AgencyLinks (generar link público sin login) | I-RF10/11 | L | #96 |
| 99 | Confirmar pago agencia externa (manual) | I-RF12 | M | #98 |
| 100 | Liquidaciones del operador (vista + historial + PDF) | I-RF22 | L | #45 |

### Búsqueda Avanzada + Chat

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 101 | Búsqueda avanzada: refinar pg_trgm + sinónimos Colombia (OpenSearch solo si el volumen lo exige, F3+) | ADR-002 | M | #10 |
| 102 | Chat cliente: viajero + guía + agente (API Gateway WebSocket + DynamoDB) | D-RF08 | L | — |
| 103 | Reprogramar reserva (calendario + diferencia de precio) | D-RF08b | M | #32 |
| 104 | Lista de espera (notificarme si se abren cupos) | B-RF05b | M | #15 |
| 105 | Recordatorio pre-tour 24h (EventBridge Scheduler + email + push) | D-RF10 | M | #26 |
| 106 | Reseñas: trigger 24h post-tour + formulario dual | D-RF09/B-RF08 | L | #26 |

### Facturación + Integraciones

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 107 | Siigo API: factura electrónica por venta | ADR-004 | L | #26 |
| 108 | Siigo API: nota crédito por reembolso | ADR-004 | M | #107 |
| 109 | OperatorPayouts: liquidación por ciclo (quincenal/mensual) | G-RF07 | L | #45, #26 |
| 110 | Reembolso bancario (RefundRequests + aprobación + expiración 30d) | C-RF09 | L | #26 |

**Total Fase 2: ~50 funcionalidades | Estimación: 8 semanas (1-2 devs)**

---

## FASE 3 — Campo y Escala (Semanas 17-24)

### App Móvil (React Native + Expo)

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 111 | Setup: Expo + navegación condicional por rol | J-RF01 | L | F1+F2 |
| 112 | Cliente: Home (promos) + Mis Tours + Wallet + Perfil | J-RF01 | L | #111 |
| 113 | Guía: manifiesto + check-in QR + swipe | J-RF02/03 | XL | #111, #96 |
| 114 | Guía: modo offline (WatermelonDB pre-download + sync engine) | J-RF02/09 | XL | #113 |
| 115 | Guía: caja menor (gastos + foto recibo + anticipo) | J-RF04 | L | #113 |
| 116 | Guía: máquina de estados (Ejecución→Terminado) | J-RF06 | L | #113 |
| 117 | Conductor: GPS background tracking (30s ping) | J-RF01 | L | #111 |
| 118 | Chat coordinación (5 días antes, TTL 2 días) | J-RF06/10 | L | #102 |
| 119 | Push notifications por rol (Expo Push) | J-RF11 | L | #111 |
| 120 | Permisos nativos progresivos | J-RF08 | M | #111 |
| 121 | Resolución conflictos offline (Last-Write-Wins) | J-RF09 | L | #114 |
| 122 | Performance guía (reseñas del guía) | J-RF07 | M | #106 |
| 123 | Convenios + notificar arribo (WhatsApp deeplink) | J-RF05 | M | #116 |

### Radar de Operaciones

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 124 | Radar: grid tours del día + semáforo estados (API Gateway WebSocket) | I-RF13 | L | #116 |
| 125 | Radar: manifiesto en vivo (check-in real-time) | I-RF14 | M | #124, #113 |
| 126 | Radar: mapa GPS vehículos (Mapbox + API Gateway WebSocket) | I-RF15 | L | #117, #124 |
| 127 | Radar: timeline estados + alertas sonoras | I-RF16 | M | #124 |
| 128 | Cancelación fuerza mayor (OPERATOR_COORD) | I-RF17 | L | #124 |

### Operador Avanzado

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 129 | Pool híbrido cupos (premium por agencia + release 3d) | I-RF07 | L | #42, #98 |
| 130 | Onboarding checklist operador (5 pasos) | I-RF18a | M | #94 |
| 131 | Equipo operador CRUD (5 roles internos) | I-RF18/19 | M | #46 |
| 132 | Vehículos CRUD + alertas SOAT (30 días BullMQ) | I-RF19 | M | #43 |
| 133 | Asignación equipo a instancias (guía+conductor+vehículo) | I-RF19b | L | #131, #132 |
| 134 | Privacidad GPS (toggles por operador) | I-RF20 | S | #126 |
| 135 | Revenue por canal (gráfico dona + tabla) | I-RF23 | M | #100 |
| 136 | Reseñas del operador (solo lectura + reportar) | I-RF24b | M | #106 |

### Infraestructura Escala

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 137 | Upgrade BD: RDS t4g → Aurora Serverless v2 + Aurora Global DB (DR multi-región) | ADR-011 | L | Todo |
| 138 | Seguridad: reCAPTCHA v3 + AWS WAF + AWS X-Ray (diferidos de F1 por costo) | F-RF11 | L | #137 |
| 139 | MFA obligatorio para roles internos (TOTP) | F-RF12 | L | #138 |
| 140 | Audit log completo (roles internos) | F-RF12 | M | #137 |

### Gamificación + Extras

| # | Funcionalidad | Spec | Complejidad | Dependencias |
|---|---|---|---|---|
| 141 | Mapa de conquistas (GeoJSON departamentos + Mapbox) | D-RF04 | L | #76 |
| 142 | Onboarding viajero con tooltips (Shepherd.js) | D-RF11 | M | #34 |
| 143 | Estacionalidad operador (heatmap 12 meses) | I-RF02 | M | #93 |
| 144 | Cancelación por baja demanda (105% Coins + PQRS) | I-RF06 | L | #128 |
| 145 | Incidentes operativos (log inmutable + alertas) | G-RF08/09 | M | #124 |
| 146 | Seguros médicos por instancia (PDF S3 + voucher) | G-RF05 | S | #43 |
| 147 | Calidad del servicio widget (rating + no-show + quejas) | I-RF02 | M | #106 |
| 148 | Notificaciones automáticas al operador (email + push) | I-RF25 | M | #119 |

**Total Fase 3: ~38 funcionalidades | Estimación: 8 semanas (2-3 devs)**

---

## Resumen Ejecutivo

| Fase | Funcionalidades | Semanas | Devs | Entregable |
|------|----------------|---------|------|------------|
| **Fase 1** | 60 | 8 | 1 CTO | Demo funcional para inversionista |
| **Fase 2** | 50 | 8 | 1-2 | Plataforma operativa completa |
| **Fase 3** | 38 | 8 | 2-3 | App móvil + escala AWS |
| **TOTAL** | **148** | **24** | — | Sistema completo |

---

## Funcionalidades que FALTAN para un sistema 100% funcional (Fase 4+)

Estas NO están en los 148 pero serían necesarias post-inversión:

| # | Funcionalidad | Justificación |
|---|---|---|
| 149 | Chatbot IA de soporte (Spec-A H-47) | Requiere volumen de tickets |
| 150 | SSR para SEO (Vite SSR o Next.js parcial) | SEO avanzado, post-indexación |
| 151 | JSON-LD structured data (GEO/AEO) | Motores generativos |
| 152 | SMS OTP (AWS SNS) | Segundo factor para montos mayores a 500K COP |
| 153 | Device fingerprinting | Seguridad enterprise |
| 154 | Tours propios BorondoTours (commission_rate = 0%) | Revenue 100% |
| 155 | Plausible Analytics (privacy-first) | Reemplaza GA4 |
| 156 | Multi-idioma completo (i18next + traducción ES/EN/PT) | Turistas extranjeros |

---

## Criterios de "Funcional" por App

### B2C funcional (Fase 1 completa):
- [ ] Buscar tours con filtros
- [ ] Ver detalle con calendario semáforo
- [ ] Checkout con pago real (OnePay.la sandbox)
- [ ] Ver reservas + cancelar + voucher PDF
- [ ] Anuncios visibles en checkout
- [ ] Wallet con Coins básico

### ERP funcional (Fase 1 + inicio Fase 2):
- [ ] CRUD tours + instancias
- [ ] Asignar guías/vehículos
- [ ] Ver bookings + liquidaciones
- [ ] RBAC con 10 roles
- [ ] Kanban CRM del agente (Fase 2)
- [ ] Comisiones agentes (Fase 2)
- [ ] Dashboard gerente (Fase 2)

### B2B Operador funcional (Fase 2):
- [ ] Dashboard con KPIs
- [ ] Crear/editar tours (con revisión)
- [ ] Manifiesto consolidado
- [ ] AgencyLinks (link público)
- [ ] Liquidaciones visibles
- [ ] Equipo + vehículos

### App Móvil funcional (Fase 3):
- [ ] Login + navegación por rol
- [ ] Check-in QR + offline
- [ ] GPS tracking
- [ ] Caja menor
- [ ] Push notifications
