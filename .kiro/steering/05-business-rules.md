---
inclusion: always
---

# Reglas de Negocio Críticas — BorondoTours

## Reservas y Pagos
- Una reserva CONFIRMADA nunca se elimina, solo se CANCELA (con registro)
- Toda cotización tiene vigencia de 72h (expira automáticamente)
- Los precios pueden cambiar entre cotización y confirmación — el precio se "congela" al crear el booking
- El webhook de Onepayla es la ÚNICA fuente de verdad para confirmar pagos
- Split Fare: la reserva principal queda en HOLD_GROUP hasta 100% del pago entre todos los participantes

## Comisiones
- Comisión del operador: % variable negociado individualmente (campo `commission_pct` en Operators)
- Comisión del agente: se calcula sobre el `borondo_amount` (lo que retiene BorondoTours) × rate del agente
- El rate del agente es mensual y configurable por el GERENTE
- Historial inmutable: cada cambio de comisión crea un nuevo registro (no se editan los existentes)
- Propiedad del lead: 90 días de exclusividad con renovación por interacción

## IVA y Exenciones
- Residentes colombianos: IVA 19% sobre el tour
- Extranjeros con pasaporte: IVA 0% — pero deben adjuntar foto del pasaporte
- El pasaporte se almacena en S3 privado con presigned URL (retención: 5 años por obligación fiscal DIAN)

## Programa de Lealtad (Borondo Coins)
- 5 niveles: Explorador (0.5%) → Viajero (1%) → Aventurero (1.5%) → Conquistador (2%) → Embajador (3%)
- TODOS los Coins son LIBRES — usables en cualquier tour de cualquier operador (sin restricción por operador)
- Coins no expiran
- Niveles 4-5 no ven publicidad en checkout (beneficio premium)
- La publicidad financia el costo de los Coins — el % otorgado debe ser menor al ingreso publicitario
- Cancelación del operador por fuerza mayor: Coins libres acreditados al cliente (no restringidos)

## Cancelaciones y Reembolsos
- Política de cancelación escalonada con 3 franjas (por defecto para todos los operadores):
  - ≥10 días: reprogramar gratis. Si pide reembolso: penalidad 40%, recibe 60% en Coins
  - 5–9 días: penalidad 60%, recibe 40% en Coins
  - <5 días: penalidad 100% (pierde todo)
  - No Show: penalidad 100%
- Fuerza mayor con documento EPS: penalidades reducidas (10% en ≥10 días, 30% en 5–9 días)
- La cuota inicial (% de reserva) NUNCA se devuelve si el cliente no paga el saldo
- Si el operador no cobra penalidad (logró revender cupos): BorondoTours retiene como ingreso neto
- Penalidad se contabiliza como ingreso ordinario (NIIF 15, PUC 4135)
- Reembolso bancario real SOLO aplica por: derecho de retracto (Ley 1480), cancelación por fuerza mayor del operador, orden judicial
- Chargeback: BorondoTours asume; si el operador ya fue pagado, se descuenta del siguiente payout

## Operadores
- Tour nuevo requiere aprobación de BorondoTours (status PENDING_REVIEW → PUBLISHED)
- Tour publicado: cambios requieren solicitud (TourEditRequest con diff)
- Cupos pool compartido por defecto; cupos premium reservados para agencias de alto volumen
- Cupos premium no usados 3 días antes del tour → vuelven al pool automáticamente
- Documentos legales: S3 Standard → Deep Glacier 15 días post-verificación

## Manifiesto
- Se llena automáticamente desde todos los canales (B2C, agente, link de agencia)
- Agencias externas sin login: link público con token temporal
- Pasajeros en HOLD_AGENCY: 48h para confirmar pago, si no → cupos liberados
- Exportable como PDF de campo con QR al manifiesto digital

## Yield Management (interno, invisible)
- `yield_score = commission_rate × 100` (30% del peso del ranking en búsqueda B2C)
- 70% restante: relevancia textual + popularidad
- `featured_boost` (0-50): acuerdos comerciales especiales gestionados por SUPER_ADMIN
- NUNCA visible para clientes ni operadores en ninguna UI pública

## Reconocimiento de Ingresos — NIIF 15 (Principal vs. Agente)
- **Borondo Tours actúa como PRINCIPAL**: controla la reserva, asume riesgo de incumplimiento del operador, tiene discreción sobre el precio final al viajero.
- **Ingreso bruto contable** = 100% del valor facturado al viajero (campo: `tour_price` total).
- **Costo del tour** = monto liquidado al operador (`operator_amount`). Registrar en cuenta 6105.
- **`borondo_amount`** = comisión que retiene BorondoTours = ingreso bruto − costo del tour = margen bruto.
- Fase 1 (sin Split Payment): Borondo Tours recibe el 100% → liquida al operador → ingreso = total; costo = pago al operador.
- Fase 2 (con Split Payment activo): el operador recibe su parte directamente → ingreso = solo `borondo_amount`.
- Los Coins otorgados son un **pasivo** (obligación de desempeño futura), no un gasto inmediato al vender. Se registran en cuenta 2805.
- Ver tratamiento contable completo y PUC en `.obsidian/docs/03-Knowledge/Estructura-Contable.md`.
