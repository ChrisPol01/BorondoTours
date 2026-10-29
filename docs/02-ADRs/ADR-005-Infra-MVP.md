---
tags: [adr, infraestructura, mvp, aws, ecs, fargate]
id: ADR-005
titulo: Infraestructura AWS-first desde Fase 1 — ECS Fargate tier economico
estado: Aceptado
created: 2025-07-14
updated: 2026-06-09
autores: [BorondoTours CTO]
---

# ADR-005 — Infraestructura: AWS desde Fase 1 con tier economico

> **Nota:** Este ADR reemplaza la version del 2025-07-14, que documentaba Railway + Neon PostgreSQL + Vercel para Fase 1. La decision fue revisada el 2026-06-09 al adoptar la estrategia AWS-first desde el dia 1.

## Estado
`Superado por ADR-011` (2026-07-10) — La arquitectura pasó de ECS Fargate a **serverless-first (AWS Lambda)**. Este ADR se conserva por trazabilidad histórica. La fuente de verdad vigente es [[ADR-011-Arquitectura-Consolidada]].

> **⚠️ HISTÓRICO:** El contenido abajo describe la arquitectura ECS Fargate (descartada). No usar como referencia de implementación. Ver ADR-011.

## Contexto

La decision original (2025-07-14) usaba Railway + Neon PostgreSQL + Vercel para Fase 1 con la
intencion de migrar a AWS en Fase 3. Ese enfoque genera deuda tecnica predecible:
- La migracion de plataforma (Railway a ECS, Neon a Aurora) toma 1-2 semanas de esfuerzo
- Las variables de entorno, configuracion de red y secrets deben rehacerse desde cero
- El equipo aprende dos plataformas distintas en lugar de una

Decision revisada (2026-06-09): AWS desde el dia 1, usando los tier mas economicos de los
mismos servicios que se usaran en Fase 3. El costo adicional vs Railway es ~$50/mes, pero
elimina permanentemente el riesgo y esfuerzo de migracion.

---

## Opciones evaluadas

### Opcion A: Railway/Neon/Vercel (descartada)

| Componente | Servicio | Costo |
|---|---|---|
| Backend NestJS | Railway Docker | ~$10-20/mes |
| Base de datos | Neon PostgreSQL serverless | ~$0-19/mes |
| Redis (BullMQ) | Railway Redis | ~$3/mes |
| Frontend | Vercel | ~$0-20/mes |
| Object storage | AWS S3 | ~$2/mes |
| Email | AWS SES | ~$1/mes |
| Total | | ~$36-65/mes |

Problemas:
- Migracion a AWS en Fase 3: 1-2 semanas de esfuerzo tecnico
- Secrets en Railway sin rotacion automatica ni IAM nativo
- Sin VPC privada en Fase 1 (menor seguridad de red)
- El equipo aprende Railway Y AWS en lugar de solo AWS

### Opcion B: AWS tier economico desde Fase 1 (SELECCIONADA)

| Componente | Servicio AWS | Tier Fase 1 | Costo estimado |
|---|---|---|---|
| Backend NestJS | ECS Fargate | 0.25 vCPU / 512MB, 1 task | ~$9/mes |
| Base de datos | RDS PostgreSQL + PostGIS | t3.micro, Single-AZ | ~$15/mes |
| Redis (BullMQ) | ElastiCache Redis | t3.micro, single node | ~$12/mes |
| Frontend | S3 + CloudFront | S3 Standard + CloudFront | ~$5/mes |
| Object storage | S3 (media, docs) | S3 Standard | ~$2/mes |
| Email | AWS SES | Sin minimo | ~$1/mes |
| Networking | NAT Gateway + ALB | 1 NAT + 1 ALB | ~$53/mes |
| Secrets | AWS Secrets Manager | Por secret | ~$2/mes |
| DNS y TLS | Route 53 + ACM | 1 hosted zone + cert gratis | ~$1/mes |
| Total | | | ~$100/mes |

Ventajas:
- Escalar a Fase 3 es cambiar el instance type y el desired count, no migrar de plataforma
- Secrets Manager con rotacion automatica e IAM desde el dia 1
- VPC privada con subnets desde el inicio (postura de seguridad correcta)
- El equipo aprende una sola plataforma
- El mismo Dockerfile, las mismas variables, la misma red en todas las fases

---

## Decision

> AWS ECS Fargate + RDS PostgreSQL t3.micro + ElastiCache t3.micro + S3/CloudFront desde Fase 1.
> Region: us-east-1 (Norte de Virginia) por menor costo relativo vs sa-east-1 Sao Paulo.

### Arquitectura Fase 1 (MVP)

```
VPC us-east-1
  Public subnet:  ALB (HTTPS :443), NAT Gateway
  Private subnet: ECS Fargate task, RDS t3.micro, ElastiCache t3.micro

CloudFront Distribution:
  - Origin 1: S3 Bucket (frontend SPA build)
  - Origin 2: ALB (API /api/v1/*)

ECR: registry privado para imagenes Docker del backend
Secrets Manager: JWT_SECRET, DB_URL, REDIS_URL, ONEPAY_KEY, credenciales SES
Route 53 + ACM: DNS + TLS automatico
CloudWatch: Log Groups con retenciones definidas
```

### Upgrade Fase 2 — sin migracion, solo resize

```
RDS t3.micro Single-AZ    -> RDS t3.small Multi-AZ
ElastiCache t3.micro      -> ElastiCache t3.small
ECS 1 task                -> ECS 2-4 tasks con auto-scaling
                          +  DynamoDB (chat, TTL nativo)
                          +  OpenSearch Serverless (busqueda)
                          +  CloudWatch Alarms + SNS
```

### Upgrade Fase 3 — sin migracion, solo upgrade de tier

```
RDS t3.small              -> Aurora PostgreSQL Serverless v2 (read replicas)
ElastiCache t3.small      -> ElastiCache Cluster mode
ECS 2-4 tasks             -> ECS auto-scaling multi-AZ
                          +  AWS X-Ray distributed tracing
                          +  CloudWatch Container Insights
                          +  WAF avanzado (OWASP reglas gestionadas)
                          +  AWS Backup centralizado
```

---

## Politica de Backups

### Fase 1 (RDS + S3)

| Dato | Mecanismo | Frecuencia | Retencion |
|---|---|---|---|
| PostgreSQL | RDS automated backups | Diario PITR | 7 dias |
| PostgreSQL | Snapshot manual pre-deploy | Por deploy | 30 dias |
| Archivos S3 (pasaportes, fotos) | S3 Versioning habilitado | Por escritura | Indefinido, Glacier lifecycle 90 dias |
| Redis (BullMQ jobs) | Sin backup, jobs efimeros | N/A | Se reconstruyen desde RDS |

### Fase 3 (Aurora + S3 + DynamoDB)

| Dato | Mecanismo | Frecuencia | Retencion |
|---|---|---|---|
| Aurora PostgreSQL | AWS Backup automatico PITR | Continuo | 35 dias |
| Aurora PostgreSQL | Snapshot semanal | Domingo 03:00 UTC | 90 dias |
| S3 datos PII | S3 Replication Cross-Region (us-east-1 a us-west-2) | Tiempo real | Indefinido |
| ElastiCache Redis | Snapshots diarios | 03:00 UTC | 7 dias |
| DynamoDB | Point-in-time recovery PITR | Continuo | 35 dias |

Criterios de aceptacion:
- [ ] RPO maximo: 24h en Fase 1, 15min en Fase 3
- [ ] RTO maximo: 30min en Fase 1, 5min en Fase 3
- [ ] Restauracion de prueba mensual en entorno staging documentada en Dev-Log

---

## Observabilidad con CloudWatch

### Estructura de Log Groups (todas las fases)

| Log Group | Retencion | Justificacion |
|---|---|---|
| /borondo/backend/production | 30 dias | Debugging operacional |
| /borondo/backend/errors | 90 dias | Analisis de incidentes post-mortem |
| /borondo/webhooks/onepay | 30 dias | Auditoria de pagos |
| /borondo/bullmq/jobs | 7 dias | Jobs son efimeros |

Criterios de aceptacion:
- [ ] Las retenciones de CloudWatch se configuran con SAM/CloudFormation (no manualmente desde consola)
- [ ] Todos los logs contienen request_id para trazabilidad punta a punta
- [ ] CloudWatch Alarm: error rate > 1% en 5 minutos -> SNS -> email al CTO
- [ ] CloudWatch Alarm: latencia p99 > 2s -> SNS -> email al CTO
- [ ] CloudWatch Alarm: BullMQ queue depth > 1000 jobs -> SNS -> email al CTO

---

## Consecuencias

### Positivas
- Cero esfuerzo de migracion entre fases, solo resize de instancias
- Postura de seguridad correcta desde el dia 1 (VPC, Secrets Manager, ECR privado)
- El equipo aprende un solo ecosistema
- AWS Secrets Manager con IAM nativo y rotacion automatica
- CloudWatch disponible desde Fase 1 sin configuracion adicional

### Negativas / Trade-offs
- ~$50/mes mas caro que Railway/Neon/Vercel en Fase 1
- Configuracion inicial de VPC, ALB, ECS task definitions, IAM roles toma 1-2 dias extra al inicio
- NAT Gateway ($35/mes) es el mayor costo del MVP

> Nota NAT Gateway: En las primeras semanas de desarrollo se puede omitir el NAT Gateway
> poniendo las ECS tasks en subnet publica con Security Group restrictivo y usando VPC Endpoints
> para S3 y ECR. Agregar el NAT Gateway al preparar el entorno de staging/produccion real.

### Acciones derivadas
- [ ] Crear VPC con subnets publicas/privadas en us-east-1
- [ ] Configurar ECR + GitHub Actions para build/push automatico
- [ ] Task definition ECS Fargate con 0.25 vCPU / 512MB
- [ ] RDS PostgreSQL t3.micro con PostGIS extension
- [ ] ElastiCache Redis t3.micro
- [ ] CloudFront Distribution: origen S3 (frontend) y origen ALB (API)
- [ ] AWS Secrets Manager con los secrets iniciales del proyecto
- [ ] CloudWatch Log Groups con retenciones configuradas via SAM/CloudFormation
- [ ] Documentar .env.example con los nombres de los secrets (sin valores)

---

## Links relacionados
- [[ADR-Index]]
- [[../04-Tech-Design/Arquitectura-Sistema]] -- Diagramas detallados por fase
- [[../00-Inicio/Stack-Tecnologico]]
