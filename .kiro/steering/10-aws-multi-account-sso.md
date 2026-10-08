---
inclusion: auto
name: aws-multi-account-sso
description: Perfiles SSO, cuentas dev/prod/root y reglas para ejecutar aws, sam, terraform o scripts contra AWS. Usar al operar AWS.
---
# AWS multi-cuenta y SSO

Detalle completo: `docs/06-Operaciones/AWS-Multi-Account-SSO.md`.

| Cuenta | ID | Profile |
|---|---|---|
| Root (solo billing/SSO) | 461299757352 | AdministratorAccess-461299757352 |
| Dev (por defecto) | 232025404765 | AdministratorAccess-232025404765 |
| Prod | 787565887675 | AdministratorAccess-787565887675 |

- Entorno por defecto: dev. Si hay `ExpiredToken`: `aws sso login --profile <PROFILE>` y avisar al usuario que apruebe en el navegador.
- AWS CLI: siempre `--profile`. Terraform/SAM/scripts: `$env:AWS_PROFILE` (PowerShell). Nunca credenciales en código.
- Autonomía solo en Dev. Cambios en Prod/Root (incluye DNS/SES) requieren confirmación explícita.