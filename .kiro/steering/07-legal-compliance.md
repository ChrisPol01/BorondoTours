---
inclusion: fileMatch
fileMatchPattern: ["services/**","packages/db/**","packages/domain/**"]
---
# Legal y compliance (Colombia)

Detalle: `docs/03-Knowledge/Politica-Datos-Personales.md`, ADR-006.

- Ley 1581: consentimiento explícito no premarcado; consentimiento separado para datos sensibles (médicos, pasaporte); derechos ARCO; anonimizar (no borrar) por trazabilidad fiscal.
- Retención: pasaporte y documento 5 años; condiciones médicas y GPS 30 días post-tour; IP/UA 90 días; chat exportado a S3 privado (plazo por definir con legal).
- Nunca PII en logs, URLs ni errores; PII cifrada en reposo (AES-256/KMS).
- Ley 1480: retracto 5 días, precios con impuestos incluidos, condiciones de cancelación visibles antes de pagar.
- Facturación electrónica DIAN vía Siigo (Fase 2); exención IVA extranjeros (Decreto 297/2016) con soporte.
- Ley 2300: contactos comerciales solo en horario permitido; transaccionales sin publicidad.