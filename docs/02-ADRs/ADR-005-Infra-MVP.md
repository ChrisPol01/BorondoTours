---
tags: [adr, infraestructura, mvp, aws, railway]
id: ADR-005
titulo: Infraestructura MVP — Railway/Render vs AWS ECS Fargate
estado: Aceptado
fecha: 2025-07-14
autores: [BorondoTours CTO]
---

# ADR-005 — Infraestructura MVP: Railway/Render en lugar de AWS ECS Fargate

## Estado
`Aceptado`

## Contexto

El stack de arquitectura final incluye AWS ECS Fargate + Amazon Aurora PostgreSQL. Sin embargo, el CTO es solo 1 desarrollador con un plazo de 8 semanas para una demo de inversionista. Configurar ECS Fargate, VPCs, ALBs, task definitions, Aurora clusters y todas sus dependencias IAM tomaría 2–3 semanas de infraestructura, consumiendo tiempo crítico del MVP.

---

## Decisión

> **Fase 1 (MVP): Railway o Render + Neon PostgreSQL**
> **Fase 3 (Escala): Migrar a AWS ECS Fargate + Amazon Aurora PostgreSQL**

### Stack Fase 1 (MVP — 8 semanas)

| Componente | Servicio | Costo estimado |
|---|---|---|
| Backend NestJS | Railway (Docker container) | ~$5–20 USD/mes |
| Base de datos | Neon PostgreSQL serverless | Gratis hasta 0.5GB |
| Redis (BullMQ) | Railway Redis add-on | ~$3 USD/mes |
| Object storage | AWS S3 (solo este servicio) | ~$1–5 USD/mes |
| Email | AWS SES | ~$0.10/1000 emails |
| Frontend | Vercel (React + Vite) | Gratis |
| Dominio | Cloudflare | ~$10 USD/año |

**Costo total estimado MVP: < $50 USD/mes**

### Por qué Railway y no AWS desde el día 1:
- Deploy en minutos desde Dockerfile vs horas de configuración IaC
- Sin VPC, security groups, ALB, IAM roles al inicio
- Variables de entorno simples, no SSM Parameter Store
- Logs y métricas integrados sin CloudWatch
- Puede migrar a ECS con el mismo Dockerfile cuando llegue la inversión

### Estrategia de migración a AWS (Fase 3):
1. El backend ya corre en Docker → el mismo Dockerfile va a ECS Fargate
2. Neon PostgreSQL → dump + restore a Aurora PostgreSQL
3. Variables de entorno → AWS SSM Parameter Store
4. Agregar CloudWatch, WAF, ALB en la migración
5. S3 ya estaba en AWS desde Fase 1 → no cambia

---

## Consecuencias

### Positivas
- 2–3 semanas ahorradas para construir funcionalidad real de negocio
- Costo < $50/mes en Fase 1 (vs ~$200–500/mes en AWS ECS+Aurora)
- El mismo Dockerfile funciona en ambos entornos
- La demo para el inversionista puede estar en vivo rápidamente

### Negativas / Trade-offs
- Railway/Render tienen menos SLA que AWS (99.5% vs 99.99%)
- Neon PostgreSQL tiene límites en el plan gratuito (0.5GB, 1 computo)
- No hay VPC privada en Fase 1 (menor seguridad de red)
- La migración a AWS tendrá algo de esfuerzo (pero es predecible)

### Acciones derivadas
- [ ] Configurar Railway con Dockerfile de NestJS + Bun
- [ ] Configurar Neon PostgreSQL y conectar con Drizzle ORM
- [ ] Configurar S3 + SES en AWS desde el día 1 (son simples)
- [ ] Documentar variables de entorno necesarias en `.env.example`
- [ ] Crear checklist de migración a AWS para Fase 3

---

---

## Política de Backups en AWS (H-56)

### Fase 1 (Neon PostgreSQL + Railway)
| Dato | Mecanismo | Frecuencia | Retención |
|---|---|---|---|
| PostgreSQL | Neon automático | Continuo (PITR) | 7 días en plan free, 30 días en plan Pro |
| Archivos S3 (pasaportes, fotos) | S3 Versioning habilitado | Por cada escritura | Indefinido (Glacier Lifecycle tras 90 días) |
| Redis (BullMQ jobs) | Railway Redis — sin backup nativo | N/A | Jobs son efímeros; las colas se reconstruyen desde PostgreSQL |

### Fase 3 (AWS ECS + Aurora PostgreSQL)
| Dato | Mecanismo | Frecuencia | Retención |
|---|---|---|---|
| Aurora PostgreSQL | AWS Backup automático + snapshots manuales | Continuo (PITR) | 35 días |
| Aurora PostgreSQL | Snapshot semanal | Domingo 03:00 UTC | 90 días |
| S3 datos PII | S3 Replication Cross-Region (us-east-1 → us-west-2) | Tiempo real | Indefinido |
| Redis ElastiCache | Snapshots diarios | 03:00 UTC | 7 días |

**Criterios de aceptación:**
- [ ] El RPO (Recovery Point Objective) máximo aceptado es **1 hora** en Fase 1, **15 minutos** en Fase 3
- [ ] El RTO (Recovery Time Objective) máximo aceptado es **4 horas** en Fase 1, **1 hora** en Fase 3
- [ ] Los backups se verifican mensualmente con una restauración de prueba en entorno staging
- [ ] El procedimiento de restauración está documentado en el Dev-Log

---

## Observabilidad: CloudWatch Logs y Retención (H-58)

### Fase 1 (Railway/Render)
- Railway y Render proveen logs nativos con retención de **7 días** en el plan básico
- Los logs de errores críticos (nivel `ERROR`) se redirigen adicionalmente a **AWS CloudWatch** vía el transporter de Winston (`winston-cloudwatch`)
- Retención en CloudWatch: **7 días** (mínimo que soporta CloudWatch sin costo significativo)

### Fase 3 (AWS ECS)
- Todos los contenedores ECS envían logs a **CloudWatch Logs Groups** automáticamente (log driver `awslogs`)
- **Estructura de grupos:**
  - `/borondo/backend/production` — NestJS app logs
  - `/borondo/backend/errors` — solo nivel ERROR y FATAL
  - `/borondo/webhooks/onepay` — logs de webhooks (debug + info)
  - `/borondo/bullmq/jobs` — logs de jobs BullMQ

**Políticas de retención:**
| Log Group | Retención | Justificación |
|---|---|---|
| `/borondo/backend/production` | **30 días** | Debugging operacional |
| `/borondo/backend/errors` | **90 días** | Análisis de incidentes post-mortem |
| `/borondo/webhooks/onepay` | **30 días** | Auditoría de pagos |
| `/borondo/bullmq/jobs` | **7 días** | Jobs son efímeros |

**Criterios de aceptación:**
- [ ] Las retenciones de CloudWatch se configuran con Terraform/CDK (no manualmente desde consola)
- [ ] Los logs de producción contienen `request_id` para trazar una request de punta a punta
- [ ] Las alarmas de CloudWatch se configuran para: error rate > 1% en 5 minutos, latencia p99 > 2s, queue depth BullMQ > 1000 jobs

---

## Links relacionados
- [[ADR-Index]]
- [[../00-Inicio/Stack-Tecnologico]]
