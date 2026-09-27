---
tags: [spec, auth, seguridad, rbac, jwt, oauth, otp]
created: 2025-07-14
updated: 2026-04-06
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-f-auth.md
---

# 📋 Spec F — Autenticación, Autorización y RBAC

---

## 1. Objetivos de negocio

- Autenticar usuarios con mínima fricción (Email/Pass + Google OAuth como opción principal)
- Proteger rutas y recursos según el rol (RBAC con **10 roles del sistema**: 5 internos + 5 de operador externo)
- Permitir que un `SUPER_ADMIN` cree roles custom adicionales, aunque los 10 por defecto son inmutables
- Garantizar que el Auth Gate no interrumpa la intención de compra del viajero
- Cumplir con estándares de seguridad: JWT con refresh tokens, OTP para acciones sensibles
- Redirigir automáticamente a cada rol a su app correspondiente post-login (ver RF-F01b)

---

## 2. Roles del sistema (RBAC)

### RF-F01 — Definición de roles
**Criterios de aceptación:**
- [ ] Los **10 roles** están definidos en el sistema y son mutuamente excluyentes (un usuario = 1 rol):

**Roles internos BorondoTours:**

| Rol | Código | Descripción | Accede a |
|---|---|---|---|
| Super Admin | `SUPER_ADMIN` | BorondoTours — acceso total | Todo |
| Gerente | `GERENTE` | Manager interno del equipo de ventas BorondoTours | ERP: Dashboard métricas, Kanban equipo, liquidaciones |
| Agent | `AGENT` | Agente interno BorondoTours | CRM básico, soporte |
| Coordinator | `COORD` | Coordinador de operaciones | ERP completo, asignaciones |
| Client | `CLIENT` | Viajero / comprador | Portal cliente, checkout |

**Roles de operador externo:**

| Rol | Código | Descripción | Accede a |
|---|---|---|---|
| Operator Admin | `OPERATOR_ADMIN` | Admin principal del operador turístico | Portal B2B: dashboard, tours, equipo, finanzas |
| Operator Coord | `OPERATOR_COORD` | Coordinador operativo del operador | Portal B2B: radar, manifiesto, asignaciones |
| Operator Agent | `OPERATOR_AGENT` | Agente de ventas del operador | Portal B2B: manifiesto manual, AgencyLinks |
| Operator Guide | `OPERATOR_GUIDE` | Guía turístico del operador | App móvil: check-in QR, checklist |
| Operator Driver | `OPERATOR_DRIVER` | Conductor del operador | App móvil: GPS pasivo, ruta asignada |

- [ ] Los Guards de NestJS validan el rol en cada endpoint protegido
- [ ] Frontend: TanStack Router `beforeLoad` verifica el rol antes de renderizar rutas internas
- [ ] Intento de acceso no autorizado → 403 + redirigir a `/no-autorizado`
- [ ] Los roles `OPERATOR_*` siempre tienen un `operator_id` asociado obligatorio

---

## 3. Registro de usuarios

### RF-F02 — Registro con email y contraseña
**Criterios de aceptación:**
- [ ] Campos requeridos: nombre completo, email, contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
- [ ] Validación en tiempo real con TanStack Form + Zod
- [ ] Al registrarse: enviar email de verificación vía AWS SES (link con token de 24h)
- [ ] El usuario puede navegar como "no verificado" pero NO puede hacer checkout hasta verificar email
- [ ] Si el email ya existe: error `EMAIL_ALREADY_EXISTS` con sugerencia de usar Google OAuth
- [ ] El rol por defecto es `CLIENT`

### RF-F02b — Registro para Proveedores / Operadores (Empresa y Freelancer)
**Contexto:** Los operadores externos que deseen vender en Borondo se registran desde el portal principal y pasan a una etapa de revisión legal (Onboarding).
**Criterios de aceptación:**
- [ ] Switch "Únete como Empresa Operadora" o "Únete como Freelancer / Guía" en la vista de registro.
- [ ] **Para Empresa:** NIT, Razón Social, PDF/Imagen de Cámara y Comercio, RNT (Registro Nacional de Turismo), RUT, Copia de documento del Representante Legal, Correo Electrónico y Teléfono principal.
- [ ] **Para Freelancer:** RNT, PDF/Imagen de Tarjeta/Título profesional de guianza, RUT, Documento de Identidad (CC/Pasaporte), Nombres completos, Correo Electrónico, Teléfono principal y secundario.
- [ ] Al registrarse, los documentos se cargan en un contenedor de S3 Privado (`/pending-operators/...`). Pasados 15 días posteriores a la auditoría, Borondo migra estos objetos a Deep Glacier por política interna.
- [ ] El usuario recibe un correo de confirmación y su cuenta cambia a rol base `OPERATOR_ADMIN` pasivo, o bajo un estado transitorio `PENDING_OPERATOR_APPROVAL` esperando la revisión humana del `SUPER_ADMIN` antes de poder publicar tours. Ambas modalidades (Freelance/Empresa) ofrecen acceso total al mismo set de features del B2B una vez aprobados.


### RF-F03 — Registro / Login con Google OAuth2
**Criterios de aceptación:**
- [ ] Botón "Continuar con Google" en el modal de auth
- [ ] Flujo: frontend → `GET /api/v1/auth/google` → redirect a Google → callback `/api/v1/auth/google/callback`
- [ ] Si el email de Google ya existe como cuenta email/pass: unificar cuentas (vincular Google ID)
- [ ] Si es usuario nuevo via Google: crear cuenta con rol `CLIENT`, email pre-verificado
- [ ] Estado Zustand (`auth.pending_tour`) preservado durante el redirect OAuth (guardar en sessionStorage)
- [ ] Post-OAuth: redirigir a la URL de origen (checkout, detalle del tour, etc.)

---

## 4. Inicio de sesión

### RF-F04 — Login con email y contraseña
**Criterios de aceptación:**
- [ ] Campos: email, contraseña (con toggle de visibilidad)
- [ ] Bloqueo temporal tras 5 intentos fallidos consecutivos: 15 minutos (registrar en Redis)
- [ ] Mensaje de error genérico: "Credenciales incorrectas" (no revelar si el email existe o no)
- [ ] Recordar sesión: checkbox "Mantener sesión" → access token de 1h, refresh token de 30 días

### RF-F05 — Sesión y JWT
**Criterios de aceptación:**
- [ ] **Access token**: JWT firmado con RS256, expiración 1 hora
- [ ] **Refresh token**: opaque token almacenado en cookie HttpOnly, SameSite=Strict, Secure
- [ ] Payload del JWT: `{ sub: user_id, role: RoleEnum, email, level: 1-5, operator_id: uuid | null }`
- [ ] Frontend: access token en memoria (Zustand), NUNCA en localStorage
- [ ] Interceptor de TanStack Query: si respuesta es 401 → intentar refresh → reintentar la request original
- [ ] Refresh token rotation: al usar un refresh token, se invalida y se emite uno nuevo
- [ ] Logout: invalidar refresh token en BD + limpiar cookie + limpiar Zustand

---

## 5. OTP (One-Time Password)

### RF-F06 — OTP por email para acciones sensibles
**Contexto:** Fase 1 — solo OTP por email. SMS (SNS) llega en Fase 2.

**Criterios de aceptación:**
- [ ] OTP requerido para: cambio de contraseña, cambio de email, cancelación de booking con reembolso
- [ ] OTP de 6 dígitos numéricos, generado con `crypto.randomInt`
- [ ] Expira en 10 minutos
- [ ] Máximo 3 intentos por OTP antes de invalidarse
- [ ] Rate limiting: máximo 5 OTPs solicitados por email en 1 hora
- [ ] El OTP se guarda hasheado (bcrypt) en Redis, no en PostgreSQL
- [ ] Template de email: diseño consistente con el branding de BorondoTours

### RF-F07 — Recuperación de contraseña
**Criterios de aceptación:**
- [ ] Flujo: ingresa email → recibe OTP → ingresa OTP → nueva contraseña
- [ ] Si el email no existe: responder con el mismo mensaje de éxito (evitar enumeración)
- [ ] Token de reset de contraseña válido por 30 minutos (diferente al OTP regular)
- [ ] Después del reset exitoso: invalidar todos los refresh tokens activos del usuario

---

## 6. Redirección post-login por rol

### RF-F01b — Destino automático según rol
**Contexto:** El mismo formulario de login sirve para todos los roles. El frontend evalúa el `role` del JWT y redirige sin que el usuario tenga que elegir. Ver detalles completos en Spec-H RF-H01.

**Criterios de aceptación:**

Roles internos:
- [ ] `CLIENT` → `/mis-reservas` (App 1 — portal B2C)
- [ ] `AGENT` → `/erp/crm` (App 2 — Kanban CRM del agente)
- [ ] `GERENTE` → `/erp/dashboard` (App 2 — dashboard de métricas del equipo)
- [ ] `COORD` → `/erp/radar` (App 2 — radar de operaciones, Spec-G)
- [ ] `SUPER_ADMIN` → `/erp/admin` (App 2 — panel de administración global)

Roles de operador:
- [ ] `OPERATOR_ADMIN` → `/operador/dashboard` (App 3 — dashboard del operador)
- [ ] `OPERATOR_COORD` → `/operador/radar` (App 3 — radar operativo del operador)
- [ ] `OPERATOR_AGENT` → `/operador/manifiestos` (App 3 — gestión de manifiestos)
- [ ] `OPERATOR_GUIDE` → `/field` (App 4 — pantalla de descarga/acceso a app móvil)
- [ ] `OPERATOR_DRIVER` → `/field` (App 4 — pantalla de descarga/acceso a app móvil)

- [ ] Si un rol intenta acceder a una ruta de otro rol: 403 + redirigir a su ruta correspondiente
- [ ] Los roles `OPERATOR_*` solo pueden acceder a recursos de su propio `operator_id`

---

## 7. Auth Gate (integración con Discovery y Checkout)

### RF-F08 — Modal de autenticación no-bloqueante
**Contexto:** Definido en Spec-A RF-A10. Este spec define la implementación técnica.

**Criterios de aceptación:**
- [ ] Modal overlay con tabs: "Iniciar sesión" / "Registrarse"
- [ ] Cierre del modal sin completar auth → el usuario regresa al catálogo sin interrupciones
- [ ] La intención de reserva (tour_id, instance_id, pax) persiste en Zustand hasta que el modal se cierre o la sesión expire
- [ ] Si el usuario cierra el modal: mostrar toast "Inicia sesión para completar tu reserva"
- [ ] El modal es accesible (focus trap, Escape para cerrar, ARIA roles correctos)

---

## 7. Permisos por recurso

### RF-F09 — Matriz de permisos críticos

**Roles internos:**

| Recurso | CLIENT | AGENT | GERENTE | COORD | SUPER_ADMIN |
|---|---|---|---|---|---|
| Ver catálogo B2C | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hacer checkout | ✅ | ✅ | ❌ | ✅ | ✅ |
| Ver sus reservas | ✅ | ✅ | ✅ (equipo) | ✅ | ✅ |
| ERP — CRM Kanban | ❌ | ✅ | ✅ (solo lectura) | ❌ | ✅ |
| ERP — gestión tours | ❌ | ❌ | ❌ | ✅ | ✅ |
| ERP — asignar guías | ❌ | ❌ | ❌ | ✅ | ✅ |
| ERP — dashboard métricas | ❌ | ❌ | ✅ | ❌ | ✅ |
| Gestionar operadores | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ajustar Coins manual | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ghost Login | ❌ | ❌ | ❌ | ❌ | ✅ |

**Roles de operador (App 3 B2B + App 4 Mobile):**

| Recurso | OP_ADMIN | OP_COORD | OP_AGENT | OP_GUIDE | OP_DRIVER |
|---|---|---|---|---|---|
| Dashboard operador | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear/editar tours | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestionar cupos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver manifiesto | ✅ | ✅ | ✅ | ✅ (asignados) | ❌ |
| Editar manifiesto | ✅ | ✅ | ✅ | ❌ | ❌ |
| Radar operativo | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestionar equipo | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver finanzas | ✅ | ❌ | ❌ | ❌ | ❌ |
| App móvil check-in | ❌ | ❌ | ❌ | ✅ | ✅ |
| GPS tracking | ❌ | ❌ | ❌ | ✅ | ✅ |
| AgencyLinks | ✅ | ✅ | ✅ | ❌ | ❌ |

**Criterios de aceptación:**
- [ ] Cada endpoint del backend tiene un `@Roles(...)` decorator de NestJS
- [ ] El `RolesGuard` verifica contra el JWT del request
- [ ] Los roles `OPERATOR_*` solo pueden gestionar recursos de su propio `operator_id` (tenant isolation)
- [ ] `OPERATOR_GUIDE` y `OPERATOR_DRIVER` solo ven instancias a las que están asignados

---

## 8. API Endpoints

```
POST /api/v1/auth/register
  Body: { nombre, email, password }
  Response: { user_id, message: "Verifica tu email" }

POST /api/v1/auth/login
  Body: { email, password }
  Response: { access_token, user: { id, nombre, email, role, level } }
  Set-Cookie: refresh_token (HttpOnly)

POST /api/v1/auth/refresh
  Cookie: refresh_token
  Response: { access_token }

POST /api/v1/auth/logout
  Auth: requerido
  Response: 200 OK
  Clear-Cookie: refresh_token

GET  /api/v1/auth/google                     ← inicia flujo OAuth
GET  /api/v1/auth/google/callback            ← callback de Google

POST /api/v1/auth/verify-email
  Body: { token }

POST /api/v1/auth/forgot-password
  Body: { email }

POST /api/v1/auth/reset-password
  Body: { token, new_password }

POST /api/v1/auth/request-otp
  Auth: requerido
  Body: { action: 'CHANGE_EMAIL' | 'CHANGE_PASSWORD' | 'CANCEL_BOOKING' }

POST /api/v1/auth/verify-otp
  Auth: requerido
  Body: { otp, action }
```

---

## 9. Modelo de datos

```
Users
  - id: uuid
  - nombre: string
  - email: string (unique)
  - password_hash: string | null    ← null si solo tiene Google OAuth
  - google_id: string | null
  - role: enum (SUPER_ADMIN, GERENTE, AGENT, COORD, CLIENT, OPERATOR_ADMIN, OPERATOR_COORD, OPERATOR_AGENT, OPERATOR_GUIDE, OPERATOR_DRIVER)
  - email_verified: boolean
  - operator_id: uuid FK | null     ← obligatorio si role = OPERATOR_*
  - is_active: boolean
  - created_at: timestamp
  - updated_at: timestamp

RefreshTokens
  - id: uuid
  - user_id: uuid FK
  - token_hash: string              ← bcrypt del token opaco
  - expires_at: timestamp
  - created_at: timestamp
  - revoked_at: timestamp | null
  - ip_address: string | null
  - user_agent: string | null
```

*(OTPs en Redis — no en PostgreSQL)*

---

## 10. Plan de Seguridad por Fases (H-22, H-23/24)

### RF-F10 — Fase 1: Protecciones base (MVP)
**Criterios de aceptación:**
- [ ] **Rate limiting** con `@nestjs/throttler`:
  - Endpoints públicos (login, register, forgot-password): **10 req/min por IP**
  - Endpoints autenticados (checkout, wallet, cancelación): **100 req/min por user_id**
  - Webhook OnePay.la: **sin rate limit** (verificar por firma HMAC)
- [ ] **Helmet.js** activado en NestJS: headers de seguridad (CSP, HSTS, X-Frame-Options, etc.)
- [ ] **CORS** configurado explícitamente: solo orígenes de `FRONTEND_URL` y `ADMIN_URL`
- [ ] **Input sanitization** con `class-validator` + `class-transformer` en todos los DTOs
- [ ] **SQL injection**: protegido por Drizzle ORM (queries parametrizadas, no string interpolation)
- [ ] **XSS**: campos de texto que se renderizan en HTML deben pasar por `DOMPurify` en el frontend
- [ ] Login fallido: bloqueo temporal de 15 min tras 5 intentos (registrado en Redis)

### RF-F11 — Fase 2: reCAPTCHA y WAF
**Contexto:** Con usuarios reales y tráfico, se necesita protección contra bots y ataques de fuerza bruta masiva.

**Criterios de aceptación:**
- [ ] **Google reCAPTCHA v3** en los formularios de:
  - Registro de usuario
  - Login (solo si se detectan intentos repetidos)
  - Solicitud de recuperación de contraseña
- [ ] El backend valida el token reCAPTCHA con `POST https://www.google.com/recaptcha/api/siteverify` antes de procesar el formulario. Score mínimo: **0.5**.
- [ ] **AWS WAF** activado en la Fase 2 (cuando se migra a AWS ECS):
  - Regla: bloquear IPs con más de 300 req/min
  - Regla: bloquear requests con patrones SQL injection conocidos (AWS Managed Rules)
  - Regla: bloquear User-Agents de bots conocidos
- [ ] **SMS OTP vía AWS SNS** en Fase 2: disponible como segundo factor para acciones sensibles (cancelación de booking > $500.000 COP)

### RF-F12 — Fase 3: MFA completo y sesión avanzada
**Contexto:** Con inversión confirmada, se implementa autenticación robusta de nivel enterprise.

**Criterios de aceptación:**
- [ ] **MFA (Multi-Factor Authentication)** opcional para todos los usuarios:
  - TOTP con apps como Google Authenticator o Authy
  - SMS backup (AWS SNS)
- [ ] MFA **obligatorio** para: `SUPER_ADMIN`, `GERENTE`, `COORD`
- [ ] **TanStack Router session persistence**: el estado de sesión del usuario (rol, nivel, wallet balance) se persiste en el router para evitar re-fetches innecesarios entre navegaciones. Implementado con `loaderDeps` y `staleTime` configurado por ruta.
- [ ] **Audit log completo**: todas las acciones de roles internos (`SUPER_ADMIN`, `GERENTE`, `COORD`, `AGENT`) se registran en `AuditLogs` con: user_id, action, resource, resource_id, ip_address, user_agent, timestamp.
- [ ] **Device fingerprinting**: si el mismo refresh token se usa desde una IP/user-agent diferente, se invalida y se notifica al usuario por email.

---

## 10. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Google OAuth2 (Passport.js) | Cambios en la API de Google | Usar librería oficial `passport-google-oauth20` |
| JWT RS256 | Requiere par de claves RSA en producción | Generar en Railway/Render como variable de entorno (no en código) |
| sessionStorage para OAuth | Puede perderse si el usuario abre otra pestaña | Aceptado: flujo OAuth es en la misma pestaña |
| Rate limiting de OTP | Redis requerido para Fase 1 | Redis ya está en el stack (BullMQ lo usa) |

---

## Links relacionados
- [[Spec-A-Discovery]]
- [[Spec-C-Checkout]]
- [[Spec-G-ERP-Operativo]]
- [[../00-Inicio/Stack-Tecnologico]]
