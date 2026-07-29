# Infraestructura — BorondoTours

## Enfoque
AWS SAM (Serverless Application Model) + CloudFormation para toda la infraestructura.
SAM extiende CloudFormation con recursos serverless (`AWS::Serverless::*`) que simplifican la definición de Lambdas, API Gateway y eventos.

## Estructura

```
infra/
├── samconfig.toml           # Configuración de deploy (dev, staging, prod)
├── template.yaml            # Template raíz SAM (nested stacks)
├── stacks/
│   ├── network.yaml         # VPC, subnets, security groups, VPC endpoints
│   ├── database.yaml        # RDS PostgreSQL + RDS Proxy + DynamoDB tables
│   ├── storage.yaml         # S3 buckets (media, docs, frontend)
│   ├── services.yaml        # Lambda functions + API Gateway HTTP + WS
│   ├── events.yaml          # EventBridge + SQS + Step Functions
│   ├── cdn.yaml             # CloudFront distributions
│   └── monitoring.yaml      # CloudWatch alarms, budgets, SNS topics
├── parameters/
│   ├── dev.json             # Parámetros para entorno dev
│   ├── staging.json         # Parámetros para staging
│   └── prod.json            # Parámetros para producción
└── scripts/
    ├── deploy.sh            # Deploy con sam deploy
    ├── package.sh           # Package con sam package
    └── local-invoke.sh      # sam local invoke para testing
```

## Comandos

```bash
# Build (compila las funciones Lambda)
sam build

# Deploy a dev
sam deploy --config-env dev

# Deploy a prod
sam deploy --config-env prod

# Invocar Lambda local
sam local invoke ServiceCoreFn --event events/health.json

# API local (emula API Gateway)
sam local start-api

# Ver logs de Lambda en vivo
sam logs -n ServiceCoreFn --tail
```

## Convenciones

- Un stack de CloudFormation por dominio de responsabilidad
- Template raíz orquesta via `AWS::CloudFormation::Stack` (nested stacks)
- Parámetros por entorno en `parameters/*.json`
- Outputs exportados para cross-stack references
- Naming: `borondo-{env}-{resource}` (ej: `borondo-prod-api`, `borondo-dev-db`)
- Tags obligatorios: `Project: BorondoTours`, `Environment: dev|staging|prod`, `Service: {nombre}`
