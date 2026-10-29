---
name: bt-threat-modeling-stride
description: >
  Modelado de amenazas STRIDE por flujo y frontera de confianza para BorondoTours, con mapeo a
  OWASP Top 10, OWASP API Security Top 10 2023 y NIST CSF 2.0, y matriz RBAC/tenant de los 10 roles.
  Para el rol security-architect de la fábrica (produce ThreatModel.json).
---

# bt-threat-modeling-stride

Metodología para redactar `ThreatModel.json` del bus. Se analiza amenaza por amenaza sobre cada flujo
de datos y cada frontera de confianza del sistema serverless (B2C público → API Gateway → Lambda →
RDS/S3/SES → integraciones externas).

## Cuándo se activa

- Diseñar o revisar un `ThreatModel` en Fase 2.
- Identificar vectores de ataque antes de que el backend implemente.
- Verificar que cada mitigación tenga una prueba negativa.

## STRIDE por categoría

| Letra | Amenaza | Pregunta guía | Mitigación típica |
|---|---|---|---|
| S | Spoofing (suplantación) | ¿puede alguien hacerse pasar por otro? | autenticación, verificación de firma del webhook |
| T | Tampering (manipulación) | ¿se puede alterar el dato en tránsito o reposo? | TLS, HMAC, integridad en BD |
| R | Repudiation (repudio) | ¿se puede negar una acción? | logging estructurado con actor y marca de tiempo |
| I | Information disclosure (fuga) | ¿se exponen datos sensibles? | cifrado KMS, PII fuera de logs/URLs/errores |
| D | Denial of service | ¿se puede agotar el servicio? | límite de tasa, timeouts, DLQ |
| E | Elevation of privilege | ¿se puede ganar más permiso del debido? | RBAC por middleware, mínimo privilegio IAM |

## Fronteras de confianza del sistema

Analizar cada cruce:

1. Navegador B2C anónimo → API Gateway (entrada pública).
2. API Gateway → Lambda (autorización y validación Zod).
3. Lambda → RDS (consultas con `operator_id`, `SELECT FOR UPDATE`).
4. Lambda → S3 privado de pasaportes (acceso firmado, retención 5 años).
5. OnePay.la → webhook (firma verificada, idempotente por `webhook_event_id`).
6. Lambda → SES (correo transaccional sin PII en asunto).

Por cada frontera, listar las amenazas STRIDE aplicables con su mitigación y su prueba negativa.

## Matriz RBAC y tenant

- Los 10 roles de BorondoTours más `ANONYMOUS`.
- Por operación: roles permitidos, `tenantScope` (si filtra por `operator_id`) y las `tables[]` que toca.
- Verificar que toda tabla con alcance de operador tenga al menos una operación que filtre por `operator_id` (sin fugas cross-tenant).

## Mapeo a marcos

- **OWASP Top 10 (web)**: p. ej. A01 control de acceso roto → cross-tenant; A03 inyección → consultas parametrizadas Drizzle.
- **OWASP API Security Top 10 2023**: API1 BOLA (autorización a nivel de objeto), API2 autenticación rota, API3 autorización a nivel de propiedad.
- **NIST CSF 2.0**: funciones Govern, Identify, Protect, Detect, Respond, Recover; cada mitigación mapea a una función.

## Reglas de datos sensibles

- PII cifrada con KMS; secretos solo por nombre en Secrets Manager (nunca valores en el bus).
- Nada de datos de tarjeta en BT (alcance PCI reducido por tokenización OnePay.la).
- PII fuera de logs, URLs y mensajes de error.

## Verificación (PowerShell)

```powershell
node .kiro/factory/scripts/factory.mjs publish --feature <id> --type threat-model
```

Cada mitigación declarada debe quedar verificable por el security-auditor en Fase 4
(`factory.mjs scan`, pruebas negativas de auth y cross-tenant).

## Lista de verificación

- [ ] STRIDE aplicado a cada frontera de confianza.
- [ ] Matriz RBAC con `tenantScope` y `tables[]` por operación.
- [ ] Mapeo a OWASP Top 10, OWASP API 2023 y NIST CSF 2.0.
- [ ] Cada mitigación con una prueba negativa asociada.
- [ ] Sin datos de tarjeta; PII cifrada y fuera de logs.

## Atribución

Inspirado en wshobson/agents `threat-modeling-expert` (MIT); redactado desde cero para
BorondoTours. Ver `.kiro/factory/THIRD_PARTY.md`.
