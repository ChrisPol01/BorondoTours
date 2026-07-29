# 11. Inventario Técnico AWS — BorondoTours

## Propósito
Registro vivo de todos los recursos AWS creados por funcionalidad. Actualizar cada vez que se cree, modifique o elimine un recurso en cualquier cuenta.

---

## Cuenta Dev (232025404765)

| Recurso | Tipo | Identificador | Notas |
|---------|------|---------------|-------|
| — | (vacía) | — | Entorno de desarrollo y pruebas — limpio |

---

## Cuenta Prod (787565887675)

### Email Corporativo (Forwarding @borondotours.com → Gmail)

| Recurso | Tipo | Identificador / ARN | Notas |
|---------|------|---------------------|-------|
| Hosted Zone | Route 53 | `Z01437721IPT4RXSYUUUM` | borondotours.com (pública) |
| MX Record | Route 53 | `10 inbound-smtp.us-east-1.amazonaws.com` | Recepción SES |
| TXT _amazonses | Route 53 | Token verificación SES | Verificación dominio |
| DKIM CNAMEs (x3) | Route 53 | `rtb456sdrh7wsch2vtic7knnh624hkia`, `ngwn4f2htutordqbssyla7cswuyr7wdm`, `pvrwelk555xfhdf4x2xyazi6if6ehr3d` | Firma emails |
| Dominio SES | SES | `borondotours.com` | Verificación: pendiente propagación NS |
| Email verificado | SES | `borondo.tours01@gmail.com` | Para envío/recepción |
| Receipt Rule Set | SES | `borondo-rules` (activo) | — |
| Receipt Rule | SES | `forward-to-gmail` | Recipients: christopher.epe@, nathalia.salcedo@ |
| S3 Bucket | S3 | `borondotours-email-prod` | Lifecycle: 2 días, prefix `incoming/` |
| Lambda | Lambda | `arn:aws:lambda:us-east-1:787565887675:function:Resend-Email-SES` | nodejs22.x |
| IAM Role (Lambda) | IAM | `arn:aws:iam::787565887675:role/Resend-Email-SES-role` | S3 read + SES send + CloudWatch logs |
| IAM User SMTP | IAM | `ses-smtp-nathalia` | Credenciales SMTP para Gmail alias |
| IAM User SMTP | IAM | `ses-smtp-christopher` | Credenciales SMTP para Gmail alias |

**Configuración Lambda (env vars):**
- `BUCKET_NAME`: `borondotours-email-prod`
- `FORWARD_FROM`: `noreply@borondotours.com`
- `FORWARD_MAP`: `nathalia.salcedo@borondotours.com:borondo.tours01@gmail.com;christopher.epe@borondotours.com:borondo.tours01@gmail.com`

**Configuración SMTP (para Google Workspace / Gmail alias):**
- Server: `email-smtp.us-east-1.amazonaws.com`
- Port: `587` (STARTTLS) o `465` (TLS)
- Auth: Login
- Usuarios: ver IAM Users SMTP arriba

**Cómo agregar un nuevo buzón:**
1. Agregar `nuevo@borondotours.com:destino@gmail.com` al env var `FORWARD_MAP` en la Lambda
2. Agregar el email a la lista de Recipients en la SES Receipt Rule `forward-to-gmail`
3. (Opcional) Crear nuevo IAM User SMTP si necesita enviar desde ese buzón via Gmail

**Configuración Lambda (env vars):**
- `BUCKET_NAME`: `borondotours-ses-incoming-prod`
- `FORWARD_FROM`: `noreply@borondotours.com`
- `FORWARD_MAP`: `nathalia.salcedo@borondotours.com:borondo.tours01@gmail.com;christopher.epe@borondotours.com:borondo.tours01@gmail.com`

**Configuración SMTP (para Google Workspace / Gmail alias):**
- Server: `email-smtp.us-east-1.amazonaws.com`
- Port: `587` (STARTTLS) o `465` (TLS)
- Auth: Login
- Usuarios: ver IAM Users SMTP arriba

**Cómo agregar un nuevo buzón:**
1. Agregar `nuevo@borondotours.com:destino@gmail.com` al env var `FORWARD_MAP` en la Lambda
2. Agregar el email a la lista de Recipients en la SES Receipt Rule `forward-to-gmail`
3. (Opcional) Crear nuevo IAM User SMTP si necesita enviar desde ese buzón via Gmail

---

### Infraestructura Core (Fase 1 — Pendiente despliegue)

| Recurso | Tipo | Identificador | Notas |
|---------|------|---------------|-------|
| — | ECS Fargate | (por crear) | Backend API + Worker |
| — | RDS PostgreSQL | (por crear) | t3.micro Single-AZ |
| — | ElastiCache Redis | (por crear) | t3.micro |
| — | ALB | (por crear) | HTTPS :443 |
| — | S3 (frontend) | (por crear) | SPA build |
| — | CloudFront | (por crear) | CDN + HTTPS |
| — | ECR | (por crear) | Registry privado Docker |
| — | Secrets Manager | (por crear) | Variables sensibles |

---

## Cuenta Root (461299757352) — Solo Management

| Recurso | Tipo | Estado | Notas |
|---------|------|--------|-------|
| IAM Identity Center | IAM IC | ACTIVO | SSO para las 3 cuentas |
| AWS Organizations | Orgs | ACTIVO | Management account |

> Todos los recursos de email fueron eliminados de esta cuenta el 2026-06-16.

---

## Reglas para Kiro

1. Cada vez que se cree un recurso AWS nuevo → actualizar este archivo.
2. Si se elimina un recurso → moverlo a una sección "Eliminados" con fecha.
3. Agrupar por funcionalidad, no por tipo de servicio.
4. Incluir siempre: tipo, identificador/ARN, y notas de contexto.
5. Nunca incluir secrets, passwords ni access keys en este archivo.
