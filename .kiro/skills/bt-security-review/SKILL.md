---
name: bt-security-review
description: >
  Revisión de seguridad para BorondoTours: OWASP, Ley 1581 (PII fuera de logs, URLs y errores),
  SafeHtml/DOMPurify, access token en memoria, webhook OnePay.la con HMAC e idempotente, pnpm audit,
  factory.mjs scan y ausencia de datos de tarjeta. Para security-architect, security-auditor, backend e integrations.
---

# bt-security-review

Checklist y patrones de seguridad para implementar y auditar features. Verifica cada mitigación del
`ThreatModel` y las obligaciones de la Ley 1581/2012 (datos personales) del steering 07.

## Cuándo se activa

- Implementar autenticación, autorización o endpoints nuevos.
- Manejar entrada de usuario, PII o pagos.
- Auditar el código en Fase 4.

## 1. Secretos

- Nunca credenciales en el código. Solo nombres de Secrets Manager; valores fuera del repo y del bus.
- `.env` fuera de git; verificar que no haya secretos en el historial.

```powershell
node .kiro/factory/scripts/factory.mjs scan --feature <id>
```

## 2. Validación de entrada

- Validar todo con Zod (`packages/contracts`) antes de procesar; 422 ante fallo semántico.
- Consultas parametrizadas con Drizzle (sin SQL por concatenación).

## 3. PII y Ley 1581

- PII cifrada con KMS; pasaporte de extranjeros en S3 privado (retención 5 años).
- PII fuera de logs, URLs y mensajes de error (anonimizar, no exponer).
- Consentimiento explícito no premarcado; finalidad declarada; ARCO.

## 4. Autorización

- RBAC por middleware; autorización a nivel de objeto (comprobar `operator_id` del recurso).
- Prueba negativa por operación: un caso denegado por rol y uno cross-tenant.

## 5. Frontend

- HTML del backend solo con `SafeHtml` (DOMPurify); sin `innerHTML` directo.
- Access token en memoria, nunca en `localStorage`.

## 6. Pagos y webhook

- Webhook de OnePay.la: firma HMAC verificada e idempotente por `webhook_event_id`.
- Ningún dato de tarjeta en BT (tokenización OnePay.la; alcance PCI reducido).

## 7. Dependencias

```powershell
pnpm audit --prod --audit-level high
```

Dependencia nueva sin aprobación es un hallazgo `high`. Versiones exactas; cuidado con typosquatting.

## 8. Mapeo a marcos

- OWASP Top 10 y OWASP API Security Top 10 2023 (BOLA, autenticación rota, exposición de propiedades).
- NIST CSF 2.0 por mitigación.

## Lista de verificación

- [ ] Sin secretos ni datos de tarjeta en código, logs ni bus.
- [ ] Entrada validada con Zod; consultas parametrizadas.
- [ ] PII cifrada y fuera de logs/URLs/errores.
- [ ] RBAC por middleware con prueba negativa y chequeo de `operator_id`.
- [ ] SafeHtml para HTML del backend; token en memoria.
- [ ] Webhook con firma e idempotencia.
- [ ] `pnpm audit` sin vulnerabilidades `high`; dependencias aprobadas.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/security-review`, `.kiro/steering/typescript-security` y
`.kiro/agents/security-reviewer`, MIT, Copyright (c) 2026 Affaan Mustafa. Ver
`.kiro/factory/THIRD_PARTY.md`. Reescrito para BorondoTours (Ley 1581, OnePay.la, SafeHtml, `factory.mjs scan`).
