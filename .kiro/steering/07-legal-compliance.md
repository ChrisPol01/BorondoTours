---
inclusion: always
---

# Legal y Compliance — BorondoTours (Colombia)

## Ley 1581 de 2012 — Habeas Data

### Obligaciones implementadas en el sistema
- Consentimiento explícito al registrarse (checkbox NO pre-marcado)
- Consentimiento SEPARADO para datos sensibles (médicos, biométricos)
- Derechos ARCO+: Acceso, Rectificación, Cancelación, Oposición, Portabilidad
- Retención de datos con plazos definidos por tipo de dato
- Anonimización (no eliminación) para mantener trazabilidad fiscal

### Retención de Datos
| Tipo de dato | Retención | Razón |
|---|---|---|
| Datos de cuenta activa | Mientras tenga cuenta | Contrato |
| Foto de pasaporte | 5 años | Obligación fiscal DIAN |
| Documento identidad | 5 años post-último tour | Ley de Turismo |
| Condiciones médicas | 30 días post-tour | Se elimina automáticamente |
| Ubicación GPS guía | 30 días post-tour | Se elimina automáticamente |
| IP, User Agent | 90 días | Seguridad |
| Chat tripartito | 90 días (DynamoDB TTL) | Servicio al cliente |

### Proceso de Eliminación
1. Verificar que no hay bookings futuros activos
2. Anonimizar PII: nombre → 'ANON', email → 'deleted_{uuid}@anon.borondotours.com'
3. Conservar datos fiscales (bookings, facturas) con PII anonimizada → 5 años
4. Eliminar de Meilisearch
5. Revocar tokens JWT activos
6. Registrar en DataDeletionLog

## Facturación Electrónica (DIAN)
- Integración con Siigo API (Fase 2)
- Factura electrónica para cada venta confirmada
- Nota crédito para cancelaciones con reembolso real
- Nota de liquidación para pagos a operadores

## IVA — Ley del Turismo
- Servicios turísticos: IVA 19%
- Exención para extranjeros no residentes con pasaporte (Decreto 297 de 2016)
- Requisito: foto del pasaporte almacenada como soporte

## Protección al Consumidor (Ley 1480 de 2011)
- Derecho de retracto: 5 días para desistir sin penalidad
- Información clara de precios (con IVA incluido visible)
- Condiciones de cancelación visibles ANTES de confirmar

## Seguridad de Datos (ADR-006)
- Encriptación en tránsito: TLS 1.3
- Encriptación en reposo: AES-256 para PII (document_number, phones, medical)
- S3: Server-Side Encryption habilitado
- Documentos legales: S3 Standard → Deep Glacier (15 días post-verificación)

## Regla para Kiro
Cuando implementes features que manejen datos personales:
- SIEMPRE verifica que existe consentimiento registrado
- NUNCA expongas PII en logs, URLs, o error messages
- Implementa retención automática (BullMQ jobs para limpieza)
- Los datos médicos son SENSIBLES: requieren consentimiento explícito separado
- Al mostrar datos de terceros: usar iniciales o anonimización parcial
