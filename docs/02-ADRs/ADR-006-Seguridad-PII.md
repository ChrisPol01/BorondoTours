---
tags: [adr, seguridad, pii, encriptacion, waf, rate-limiting]
created: 2026-04-06
status: aceptada
---

# ADR-006 — Seguridad de Datos PII y Protección de Infraestructura

## Estado: Aceptada

## Contexto

BorondoTours procesa datos personales sensibles de múltiples tipos de usuarios:
- **Viajeros:** documentos de identidad, condiciones médicas, datos de pago
- **Operadores:** NIT, RUT, cédulas, contratos
- **Guías:** ubicación GPS en tiempo real, datos laborales

La Ley 1581 de 2012 (Habeas Data) y el Decreto 1377 de 2013 exigen medidas técnicas y administrativas para proteger estos datos. Además, la plataforma será pública y requiere protección contra ataques comunes (DDoS, inyección, fuerza bruta).

## Decisión

### 1. Encriptación de campos PII en PostgreSQL

**Estrategia:** Encriptación a nivel de columna con AES-256-GCM usando `pgcrypto` de PostgreSQL.

**Campos encriptados:**
- `Users.document_number`
- `Users.phone_primary`
- `Users.phone_secondary`
- `Users.emergency_contact_phone`
- `Users.medical_conditions`
- `BookingPassengers.document_number`
- `BookingPassengers.phone`
- `BookingPassengers.emergency_contact_phone`
- `BookingPassengers.medical_conditions`

**Clave de encriptación:**
- Almacenada en AWS Secrets Manager (nunca en código ni en `.env`)
- Rotación anual con re-encriptación programada
- El NestJS backend es el único que desencripta (nunca el cliente)

**Trade-offs:**
- ✅ Protección en caso de acceso directo a la BD
- ✅ Cumplimiento legal (Ley 1581)
- ❌ No se puede hacer `WHERE` directo sobre campos encriptados (se usa hash separado para búsquedas cuando es necesario)
- ❌ Complejidad adicional en las queries

### 2. Rate Limiting

**Configuración general:**

| Perfil | Límite | Ventana | Aplica a |
|---|---|---|---|
| Autenticado | 100 req/min | Sliding window | Todas las rutas autenticadas |
| Anónimo | 30 req/min | Sliding window | Rutas públicas (catálogo, búsqueda) |
| Login/Register | 5 req/min | Fixed window | Solo `/auth/login`, `/auth/register` |
| Webhook | Sin límite | — | `/webhooks/onepay` (validación HMAC) |
| Ghost Login | 10 req/min | Fixed window | Solo durante sesión fantasma |

**Implementación:** `@nestjs/throttler` con Redis como store distribuido.

### 3. AWS WAF (Web Application Firewall)

**Reglas configuradas:**
- AWS Managed Rules: `AWSManagedRulesCommonRuleSet` (SQLi, XSS, LFI)
- AWS Managed Rules: `AWSManagedRulesSQLiRuleSet`
- IP Rate Limiting: 2000 req/5min por IP
- Geo-blocking: Solo permitir tráfico desde países con operaciones activas (CO, US, ES, MX, PE, EC, PA, BR inicialmente)
- Bot control: Desafío CAPTCHA para scrapers detectados

**Ubicación:** AWS CloudFront → WAF → ALB → ECS/Railway

### 4. Protección de S3

**Buckets y políticas:**

| Bucket | Contenido | Acceso | Encriptación |
|---|---|---|---|
| `borondo-media-public` | Fotos de tours, logos | CloudFront (CDN público) | SSE-S3 |
| `borondo-legal-docs-private` | RUT, Cámara de Comercio, cédulas | Solo backend (presigned URLs, 15 min TTL) | SSE-S3 |
| `borondo-passports-private` | Fotos de pasaporte (exención IVA) | Solo backend (presigned URLs, 15 min TTL) | SSE-KMS |
| `borondo-receipts` | Fotos de recibos (gastos de campo) | Solo backend | SSE-S3 |

**Lifecycle Rules:**
- `borondo-legal-docs-private/verified/` → Deep Glacier después de 15 días
- `borondo-passports-private/` → Deep Glacier después de 15 días, retención 5 años (fiscal)

### 5. JWT y Sesiones

- **Access Token:** RS256, TTL 15 minutos
- **Refresh Token:** Random, TTL 7 días, stored en HttpOnly cookie
- **Rotación:** Al usar refresh token, se invalida el anterior (one-time use)
- **Blacklist:** Tokens revocados se guardan en Redis hasta su expiración natural
- **Ghost Login Token:** TTL 30 minutos, sin capacidad de pago, acciones loggeadas

### 6. Audit Logging

**Acciones que siempre generan log:**
- Login/logout (incluyendo fallidos)
- Ghost Login (inicio, acciones, fin)
- Creación/edición de usuarios
- Cambios de rol o permisos
- Acceso a datos sensibles (PII)
- Operaciones financieras (pagos, reembolsos, liquidaciones)
- Eliminación/anonimización de datos

**Tabla:**
```
AdminAuditLog
  - id: uuid
  - actor_id: uuid FK (quien ejecutó)
  - action: string (ej: 'USER_ROLE_CHANGED', 'PII_ACCESSED', 'GHOST_LOGIN_START')
  - target_type: string (ej: 'User', 'Booking', 'OperatorPayout')
  - target_id: uuid
  - old_value: jsonb | null
  - new_value: jsonb | null
  - ip_address: string
  - user_agent: string
  - created_at: timestamp
```

## Consecuencias

### Positivas
- Cumplimiento legal con Ley 1581 de 2012
- Protección real de datos en caso de breach
- Trazabilidad completa de acciones administrativas
- Defensa en profundidad (WAF + rate limit + encriptación + audit)

### Negativas
- Mayor complejidad en el backend (encriptación/desencriptación)
- Costo adicional de AWS (WAF, KMS, Secrets Manager)
- Latencia adicional (~5-10ms por campo encriptado)
- La búsqueda por campos PII requiere índices hash separados

## Alternativas consideradas

1. **No encriptar (solo confiar en seguridad de la BD):** Rechazada — no cumple Ley 1581
2. **Encriptación a nivel de disco (TDE):** Rechazada — no protege contra acceso lógico
3. **Vault externo (HashiCorp):** Rechazada para MVP — excesiva complejidad. Re-evaluar post-Series A

---

## Links relacionados
- [[../03-Knowledge/Politica-Datos-Personales]]
- [[../01-Specs/Spec-F-Auth]]
- [[ADR-005-Infra-MVP]]
