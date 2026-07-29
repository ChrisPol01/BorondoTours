---
tags: [adr, arquitectura, infraestructura, aws]
created: 2026-07-05
updated: 2026-07-05
status: Aceptado
fase: "1→3"
supersedes: ADR-005
---

# ADR-008 — Infraestructura AWS-first desde Fase 1

## Estado
`Superado por ADR-011` (2026-07-10) — Mantiene válido el principio **AWS-first desde Fase 1**, pero la plataforma de cómputo cambió de **ECS Fargate a AWS Lambda (serverless-first)**. La fuente de verdad vigente es [[ADR-011-Arquitectura-Consolidada]].

> **⚠️ HISTÓRICO:** Las tablas de servicios abajo asumen ECS Fargate + ElastiCache. Para el stack vigente (Lambda + API Gateway + EventBridge/SQS, sin ElastiCache) ver ADR-011.

## Contexto

El ADR-005 original proponía desplegar la Fase 1 (demo de inversionista) en Railway/Render + Neon PostgreSQL por velocidad de deploy, migrando a AWS ECS Fargate + Aurora en Fase 3. Sin embargo, el documento `04-Tech-Design/Arquitectura-Sistema.md` adoptó una estrategia **AWS-first desde el día 1**, generando una contradicción entre la fuente de verdad de infraestructura (ADR-005) y la arquitectura vigente.

Esta contradicción bloqueaba decisiones concretas: no se podía generar Infraestructura como Código (IaC) ni pipelines de CI/CD sin saber si el objetivo era Railway o AWS. También afectaba la generación asistida por IA, que no podía inferir el target de despliegue.

## Decisión

**Toda la infraestructura vive en AWS desde la Fase 1.** Las fases solo varían el *tier/tamaño* de cada servicio, nunca la plataforma. Migrar de proveedor se considera deuda técnica evitable.

| Componente | Fase 1 (MVP) | Fase 2 (Operativo) | Fase 3 (Escala) |
|---|---|---|---|
| Compute backend | ECS Fargate (1 task, 0.25 vCPU/512MB) | ECS Fargate (2-4 tasks, auto-scaling) | ECS Fargate multi-AZ auto-scaling |
| Base de datos | RDS PostgreSQL t3.micro Single-AZ (PostGIS) | RDS t3.small Multi-AZ | Aurora PostgreSQL Serverless v2 |
| Cache/Queue | ElastiCache Redis t3.micro | ElastiCache Redis t3.small | ElastiCache Redis Cluster mode |
| Frontend | S3 + CloudFront | S3 + CloudFront + WAF básico | S3 + CloudFront + WAF avanzado + Shield |
| Secretos | AWS Secrets Manager | igual | igual + Parameter Store |
| Registry | Amazon ECR | igual | igual |
| Email | AWS SES | igual | igual |
| DNS + TLS | Route 53 + ACM | igual | igual + Route 53 Health Checks |
| Búsqueda | PostgreSQL ILIKE | OpenSearch Serverless | igual |
| Chat | — | DynamoDB (TTL 90 días) | igual + sessions |

**Costo estimado Fase 1:** ~$100/mes (el NAT Gateway ~$35/mes domina; se puede diferir con VPC Endpoints en subnet pública con SG restrictivo durante las primeras semanas).

## Opciones evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **AWS-first (elegida)** | Cero re-arquitectura entre fases; escalar = cambiar instance type; sin vendor lock-in externo; IAM/VPC/Secrets nativos desde día 1 | Mayor costo fijo inicial (~$100 vs ~$20/mes); curva de setup AWS más pronunciada |
| Railway/Neon en Fase 1 (ADR-005) | Deploy en minutos; costo inicial mínimo | Migración forzosa a AWS en Fase 3 (deuda técnica); dos entornos que mantener; divergencia de comportamiento entre plataformas |

## Consecuencias

- **Positivas:** un solo target de IaC (SAM + CloudFormation), pipeline CI/CD único (GitHub Actions → SAM deploy), coherencia total entre fases, seguridad enterprise desde el inicio.
- **Negativas:** costo fijo mensual mayor en Fase 1; el equipo necesita competencia AWS desde el arranque.
- **Acciones derivadas:** actualizar el steering `11-inventario-tecnico-aws` a medida que se creen los recursos; crear la definición IaC de Fase 1; confirmar región (us-east-1 vs sa-east-1 São Paulo por latencia Colombia).

## Referencias
- [[ADR-005-Infra-MVP]] (superado)
- [[../04-Tech-Design/Arquitectura-Sistema]] §2
- [[../00-Inicio/Stack-Tecnologico]]
