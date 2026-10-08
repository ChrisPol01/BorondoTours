---
inclusion: fileMatch
fileMatchPattern: ["infra/**","**/template.yaml","**/samconfig.toml"]
---
# Inventario AWS (resumen)

Inventario completo y vivo: `docs/06-Operaciones/Inventario-AWS.md`.

- Prod (787565887675): email corporativo (SES + Lambda `Resend-Email-SES` + S3 `borondotours-email-prod`), hosting web (CloudFront `E1DRI1BOOOHRAX` / bucket `borondotours-web-prod`), Route 53 `borondotours.com`.
- Dev web: `dev.borondotours.com` (CloudFront `E3BJK4DCIP1V66`, bucket `borondotours-web-dev`). Desplegar siempre primero en Dev.
- Dev (232025404765) vacía; infra core (Lambda, RDS, DynamoDB) pendiente.
- Regla: al crear, modificar o eliminar un recurso, actualizar el inventario en docs. Sin secretos en él.
- IaC: doble enfoque SAM/CDK sin decidir (DECISIONES-PENDIENTES #15).
