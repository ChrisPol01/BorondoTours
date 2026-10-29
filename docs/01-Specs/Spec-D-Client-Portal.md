---
tags: [spec, portal-cliente, wallet, coins, loyalty, gamificacion]
created: 2025-07-14
updated: 2026-04-06
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-d-client-portal.md
---

# 📋 Spec D — Área Privada, Wallet y Fidelización

> ⚠️ BullMQ/Socket.io en este Spec se leen como EventBridge/SQS/Step Functions y API Gateway WebSocket (ADR-011). Ver [[../DECISIONES-PENDIENTES]] #3.

---

## 1. Objetivos de negocio

- Retener liquidez mediante Borondo Coins en lugar de reembolsos bancarios
- Fidelizar usuarios con programa de lealtad que beneficia al cliente sin destruir margen
- Los beneficios del programa son financiados por ingresos publicitarios (anuncios en checkout/confirmación)
- Reducir carga operativa de atención al cliente con autogestión total

---

## 2. Sistema de niveles — Borondo Loyalty

### Regla general
- Los niveles se alcanzan acumulando **Puntos de Experiencia (XP)** por múltiples acciones (no solo compras)
- Los XP determinan el nivel; los Borondo Coins son la moneda de descuento (ratio configurable)
- Los Coins son permanentes (sin vencimiento), intransferibles entre usuarios
- Ratio por defecto: 100 Coins = $500 COP (configurable por SUPER_ADMIN)

> ℹ️ **Fuente de verdad del modelo completo:** Spec-E §2-3. Esta sección es un resumen ejecutivo.

### Tabla de niveles por XP

| Nivel | Nombre | XP requeridos | % Coins por compra | Beneficio adicional |
|---|---|---|---|---|
| 0 | Sin nivel | 0 | 0% | Solo acceso básico |
| 1 | Explorador | 100 XP | 0.5% | Badge + acceso a ofertas anticipadas 12h |
| 2 | Viajero | 1.500 XP | 1% | Acceso anticipado 24h a nuevos tours |
| 3 | Aventurero | 5.000 XP | 1.5% | 3% descuento en add-ons del checkout |
| 4 | Conquistador | 12.000 XP | 2% | Prioridad en lista de espera + 5% desc. add-ons + sin ads checkout |
| 5 | Embajador | 25.000 XP | 3% | Tours exclusivos + sin ads en todo el flujo + badge especial |

### Cómo se ganan XP (resumen — detalle en Spec-E §3)
- Tours completados: 100-300 XP según tipo (nacional/internacional/crucero)
- Reseñas: 20-30 XP por reseña
- Referidos convertidos: 75 XP
- Ver anuncios rewarded (20 o más al mes): 25 XP/mes
- Monto acumulado: 50 XP por cada $1M COP gastado
- Completar perfil: 50 XP (una vez)

### Notas de diseño del programa
- Un usuario activo (reseñas + ads + referidos) sube de nivel MÁS RÁPIDO que uno que solo compra
- Los % de Coins por compra son bajos deliberadamente (financiados por publicidad)
- El nivel Embajador requiere diversidad (internacionales o cruceros)
- La plataforma muestra al usuario: XP actual + barra de progreso al siguiente nivel

### Requerimientos funcionales de niveles

#### RF-D-LVL01 — Cálculo automático de nivel por XP
**Criterios de aceptación:**
- [ ] Al completar cualquier acción que otorga XP, el backend recalcula el nivel del usuario
- [ ] Se suman XP de todas las fuentes en `UserStats.xp_total`
- [ ] Si el XP supera el umbral del siguiente nivel: sube automáticamente
- [ ] Si sube de nivel, se registra en `LoyaltyEvents` y se envía email + push de felicitación
- [ ] El nivel nunca baja (es acumulativo y permanente)

#### RF-D-LVL02 — Acreditación de Coins por compra
**Criterios de aceptación:**
- [ ] Al confirmar pago, se calcula: `coins = floor(subtotal_antes_iva * % del nivel * multiplicador_nacionalidad)`
- [ ] Multiplicador: 2x si tour internacional (usuario local), 1.5x si tour nacional (usuario extranjero), 1x default
- [ ] Se crea registro en `WalletTransactions` (CREDIT, reason: `LOYALTY_PURCHASE`)
- [ ] El saldo del wallet se actualiza en tiempo real (Zustand en frontend)
- [ ] El cliente ve en la confirmación: "Ganaste X Borondo Coins + Y XP en esta compra"

---

## 3. Wallet — Borondo Coins

### RF-D01 — Visualización del wallet
**Criterios de aceptación:**
- [ ] Saldo actual en Coins visible en el dashboard y en el header
- [ ] Historial de transacciones: tipo (CREDIT/DEBIT), monto, motivo, fecha
- [ ] Todos los Coins son libres — usables en cualquier tour de cualquier operador (ADR-007)
- [ ] No hay distinción entre Coins "restringidos" y "libres"

### RF-D02 — Uso de Coins en checkout
**Criterios de aceptación:**
- [ ] En el checkout, sección "¿Quieres usar tus Borondo Coins?"
- [ ] Todos los Coins son usables en cualquier tour (sin restricción por operador)
- [ ] El sistema valida que `coins_a_usar ≤ saldo_disponible`
- [ ] El descuento se aplica antes de calcular el IVA
- [ ] Si se usan Coins, se genera registro `DEBIT` en `WalletTransactions`

### RF-D03 — Reglas de acreditación de Coins

| Motivo | Monto | Restricción | Origen |
|---|---|---|---|
| Cancelación ≥10 días (cliente) | 60% del pago (penalidad 40%) | Libre | Automático al cancelar |
| Cancelación 5–9 días (cliente) | 40% del pago (penalidad 60%) | Libre | Automático al cancelar |
| Cancelación <5 días (cliente) | 0% (penalidad 100%) | — | No aplica reembolso |
| Fuerza mayor (cancela el operador) | 100% del pago | Libre | COORD/SUPER_ADMIN acredita |
| Loyalty por compra | Puntos según nivel (ratio configurable) | Libre | Automático al confirmar pago |
| Compensación manual (admin) | Variable | Libre | SUPER_ADMIN |
| Ver anuncios rewarded (máx 3/día) | Puntos fijos por visualización | Libre | Automático al completar ad |
| Dejar reseña | Puntos fijos por reseña | Libre | Automático al enviar |

**Criterios de aceptación:**
- [ ] Cancelación del cliente: `DB.transaction` atómico (CANCELED + CREDIT wallet). Monto según franja de cancelación (ver Spec-C RF-C11)
- [ ] Fuerza mayor: solo `COORD` o `SUPER_ADMIN` puede acreditar. Todos los Coins son LIBRES (usables en cualquier operador)
- [ ] No existen Coins restringidos por operador (ADR-007)

---

## 4. Gamificación — Perfil de viajero

### RF-D04 — Mapa de conquistas
**Criterios de aceptación:**
- [ ] Mapa de Colombia con Mapbox GL JS
- [ ] Departamentos donde el usuario tiene ≥1 tour `COMPLETED` se colorean
- [ ] Color por cantidad: 1 tour = tono claro, 5+ tours = tono oscuro (misma escala cromática)
- [ ] Tooltip al hover: "X tours en [Departamento]"
- [ ] Polígonos GeoJSON de departamentos de Colombia precargados en S3

### RF-D05 — Estadísticas del perfil
**Criterios de aceptación:**
- [ ] Tours realizados (total, nacionales, internacionales, cruceros)
- [ ] Departamentos visitados (count)
- [ ] Total gastado en la plataforma
- [ ] Nivel actual con barra de progreso al siguiente nivel
- [ ] "Te faltan X tours o $Y para ser [Siguiente Nivel]"

---

## 5. Gestión de reservas

### RF-D06 — Voucher PDF descargable
**Criterios de aceptación:**
- [ ] Botón "Descargar Voucher" en cada reserva `CONFIRMED` o `COMPLETED`
- [ ] PDF incluye: logo BorondoTours, nombre tour, fecha, pax, número de confirmación, datos del pasajero principal, QR con el booking_id
- [ ] Generado server-side (NestJS + pdf-lib o puppeteer)

### RF-D07 — Cancelación autónoma (escalonada — ADR-007)
*(Ver Spec-C RF-C11 para la tabla completa de franjas y penalidades)*
**Criterios de aceptación:**
- [ ] **≥10 días**: Opción de reprogramar (RF-D08b) o cancelar con penalidad 40% → recibe 60% en Coins
- [ ] **5–9 días**: Cancelar con penalidad 60% → recibe 40% en Coins
- [ ] **<5 días**: Botón deshabilitado con tooltip "Sin reembolso por cancelación tardía — penalidad 100%"
- [ ] Modal muestra la franja actual y el monto exacto que recibirá: "Recibirás $X en Borondo Coins (penalidad del Y%)"
- [ ] `DB.transaction`: booking → `CANCELED` + `WalletTransactions` CREDIT (monto según franja) + `PenaltyIncome` registro
- [ ] Fuerza mayor: requiere adjuntar documento EPS → penalidades reducidas (ver Spec-C RF-C11)

### RF-D12 — Mis reservas: pestañas y estados (diseño 2026-09-27)
**Criterios de aceptación:**
- [ ] Pestañas con contador: **Próximas** · **Por pagar** · **Completadas** · **Canceladas**.
- [ ] **Por pagar:** abono pagado y saldo pendiente, con monto y fecha límite resaltados + CTA "Pagar saldo". Aviso de que el abono no es reembolsable si vence.
- [ ] **Completadas:** CTA "Calificar" si no hay reseña; si ya existe, se muestra la calificación y "Reservar de nuevo".
- [ ] **Canceladas:** fecha de cancelación, penalidad aplicada y monto a favor.
- [ ] **Vacío:** mensaje y CTA "Explorar tours".
- [ ] **Detalle de reserva:** QR del voucher, datos del viaje, pagos ("Impuestos incluidos"), reprogramaciones restantes y acciones (voucher, reprogramar, chat del tour, cancelar). Se abre como **panel lateral** derecho de 480 px (alto = viewport − 32, velo 20 % + blur 8, barra con título y cerrar, acciones fijas abajo). En móvil, pantalla completa.
- [ ] **Patrón de modales (design.md §8f):** cancelar, reprogramar y calificar son diálogos bloqueantes de 480 px centrados, con velo `#0F1A2B` 30 % + blur 20, sobre Mis reservas. En móvil, hojas inferiores con el mismo velo.
- [ ] **Modal cancelar:** muestra las 3 franjas de ADR-007 resaltando la que aplica, el resumen (pagado, penalidad, monto a favor), opción de adjuntar soporte de fuerza mayor y confirmación por OTP (RF-F06). Ofrece reprogramar como alternativa cuando es gratis.
- [ ] **Modal reprogramar:** fechas con semáforo de disponibilidad y la diferencia a pagar. Si la nueva fecha cuesta menos, la diferencia no se reembolsa.
- [ ] Mientras Spec-E está en pausa, el monto devuelto se muestra como **"Saldo a favor"** sin nombrar Borondo Coins. **Decisión 2026-09-29:** el saldo a favor por cancelación se guarda como **crédito interno** en la cuenta del cliente (usable en cualquier tour, no se reembolsa al medio de pago). El reembolso bancario real solo aplica en los casos de RF-C09 (retracto, fuerza mayor del operador, orden judicial).
- [ ] Referencia visual: Figma, tablero Colorido, fila Mis reservas → estados.

### RF-D14 — Eventos transaccionales: email por backend, vista y aviso en frontend (decisión 2026-09-29)
**Regla:** los correos transaccionales los genera y envía el backend (SES, plantillas en código). El frontend **no** replica el correo: tiene la **vista donde vive esa información** y un **aviso** (bandeja + toast) cuando la acción se completa.

| Evento | Email (backend) | Vista en frontend | Aviso in-app |
|---|---|---|---|
| Verificación de cuenta / OTP | Sí (código) | Auth Gate: pantalla "Código OTP" y "Cuenta verificada" | Toast "Cuenta verificada" |
| Reserva confirmada | Sí (voucher + QR) | Confirmación de compra + Detalle de reserva (QR, datos, pagos) | Toast + bandeja "Reserva confirmada" |
| Pago rechazado / enlace vencido | Sí | Estados de error del checkout (RF-C16) + "Por pagar" | Bandeja + toast |
| Cancelación confirmada | Sí (penalidad + saldo a favor) | Pestaña "Canceladas" + detalle con penalidad y saldo | Toast + bandeja |
| Recordatorio 24 h | Sí | Detalle de reserva (punto de encuentro, hora, qué llevar) + chat del tour | Bandeja (+ push en app) |
| Link para pagar el saldo | Sí (enlace) | Pestaña "Por pagar" con CTA "Pagar saldo" y fecha límite | Bandeja + aviso fijo si vence en < 48 h |

**Criterios de aceptación:**
- [ ] Todo aviso lleva a la vista correspondiente (deeplink); el correo también enlaza a esa vista.
- [ ] Bandeja con tope: últimas **50 notificaciones o 90 días**, lo que ocurra primero. Lo que sale de la bandeja **no se pierde**: el soporte vive en Mis reservas, el voucher y los documentos fiscales (retención 5 años).
- [ ] Los transaccionales no llevan publicidad ni promociones (si la llevan pasan a ser comerciales y requieren consentimiento).
- [ ] Los transaccionales no se pueden desactivar; los comerciales sí (opt-in explícito, revocable desde Configuración).
- [ ] Contenido mínimo sin datos sensibles: no se muestran documento completo, datos médicos ni datos de pago en avisos ni correos (solo últimos 4 dígitos si aplica).

**Marco legal (validar con asesoría):** Ley 1581 de 2012 y Decreto 1377 (finalidad y consentimiento; lo transaccional se ampara en la ejecución del contrato), Ley 1480 de 2011 (información clara, constancia de la compra y derecho de retracto visible), Ley 2300 de 2023 (horarios y frecuencia de contactos **comerciales**: lunes a viernes 7 a.m.–7 p.m., sábados 8 a.m.–3 p.m., una vez por semana; no aplica a transaccionales). Los envíos comerciales se programan solo dentro de ese horario.

### RF-D13 — Notificaciones y menú de cuenta con sesión (diseño 2026-09-29)
**Criterios de aceptación:**
- [ ] **Bandeja de notificaciones:** popover anclado a la derecha de la campana del sidebar (380 px, `glass-strong`, sin velo ni blur de la pantalla). En móvil, pantalla completa.
- [ ] **Eventos en tiempo real** (pago confirmado, mensaje del guía, cupo liberado): toast abajo a la derecha, 400 px, por encima del FAB, `role="status"`. En móvil, toast arriba a ancho completo.
- [ ] **Urgencias** (tour cancelado por el operador, cambio de punto de encuentro a menos de 24 h): aviso fijo en la franja superior. Nunca un diálogo.
- [ ] **Menú de cuenta:** popover sobre el perfil del sidebar, mismo ancho (280 px), sin velo. En móvil, hoja inferior. Opciones: Editar perfil, Tema, Idioma, Recomendar, Cotiza con un asesor, Configuración, Nosotros, Cerrar sesión.
- [ ] **Soporte:** panel lateral derecho de 480 px (mismo patrón que el detalle de reserva). En móvil, pantalla completa. El horario publicado es lunes a sábado, 8:00 a.m. – 5:00 p.m.
- [ ] **Sidebar fijo:** `position: sticky; top: 16px; height: calc(100vh - 32px)`; solo el contenido de la derecha hace scroll (como ChatGPT o Gemini).
- [ ] Referencia visual: Figma, tablero Colorido, filas con sesión → estados "Notificaciones", "Menú de cuenta", "Soporte".

---

## 6. Chat del tour (Fase 2)

> **Actualizado 2026-09-27 (decisión del usuario):** el chat es **por tour (instancia)**, entre el **guía y el grupo**. Reemplaza el modelo "tripartito cliente + guía + agente".

### RF-D08 — Chat del tour (guía ↔ grupo)
**Criterios de aceptación:**
- [ ] Existe **una sala por instancia de tour** (`tour_instance_id`), no por reserva. Participan el guía asignado y todos los pasajeros con reserva confirmada de esa instancia.
- [ ] Botón "Abrir chat del tour" visible en reservas confirmadas con fecha futura; deshabilitado con countdown hasta 24h antes del tour.
- [ ] **Mensajes del guía** → los ve todo el grupo (difusión).
- [ ] **Mensajes de un turista** → por defecto solo los recibe el guía (el resto del grupo no los ve).
- [ ] El guía tiene un control **"Mostrar mensajes al grupo"**: al activarlo, los mensajes de los turistas se vuelven visibles para todo el grupo; puede desactivarlo en cualquier momento. El cambio queda registrado.
- [ ] Permite texto y fotos (presigned URL S3). Sin llamadas ni video. Sin chats privados entre turistas.
- [ ] Los datos de contacto personales (teléfono/WhatsApp) no se muestran en el chat; toda la comunicación pasa por la sala (marca blanca: no se identifica al operador).
- [ ] Historial en DynamoDB (PK: `CHAT#TOUR#{tour_instance_id}`, SK: `timestamp#messageId`, atributo `visibility`: `GROUP` | `GUIDE_ONLY`).
- [ ] **Al finalizar el tour** (estado `TERMINADO`/`COMPLETED`): la sala pasa a solo lectura, se **exporta** el historial completo (mensajes + metadatos + adjuntos) a S3 privado cifrado (SSE-KMS) por seguridad y soporte, y **se eliminan los datos de DynamoDB**. El export no es visible para el cliente; solo SUPER_ADMIN/COORD lo consultan ante una disputa o incidente.
- [ ] Retención del export en S3: por definir con asesoría legal (propuesta: 1 año y luego eliminación; con Glacier si se requiere más tiempo).

### RF-D08b — Reprogramar reserva
**Criterios de aceptación:**
- [ ] El cliente puede solicitar reprogramación si `tour_date - now() >= 5 días calendario`.
- [ ] UI muestra calendario con instancias disponibles del mismo tour.
- [ ] Si la nueva instancia tiene sobrecargo, el cliente debe pagar la diferencia vía link de pago.
- [ ] Si el cliente no paga en 48h, se cancela la solicitud de reprogramación.

### RF-D10 — Recordatorio pre-tour (Push + Email)
**Criterios de aceptación:**
- [ ] BullMQ job que corre 24h antes de cada instancia.
- [ ] Envía Push Notification y Email a pasajeros con booking `CONFIRMED`.
- [ ] Contenido: "¡Prepárate! Tu tour [Nombre] empieza mañana a las [Hora]. No olvides [Recomendaciones]."
- [ ] Si el tour no tiene guía asignado alerta al COORD en el mensaje intero.

---

## 6b. Onboarding del Viajero (H-63)

### RF-D11 — Onboarding completo del viajero con tooltips
**Contexto:** Un viajero recién registrado llega a `/mis-reservas` y no sabe qué puede hacer en la plataforma. Un onboarding guiado con tooltips reduce la fricción y aumenta la retención.

**Criterios de aceptación:**
- [ ] Al primer login del usuario (campo `onboarding_completed = false` en `Users`), se activa automáticamente una secuencia de onboarding.
- [ ] La secuencia usa **Shepherd.js** (o equivalente React) para mostrar tooltips contextuales sobre los elementos de la UI.
- [ ] Pasos del onboarding (en orden):
  1. **Bienvenida**: modal con avatar del nivel actual (Explorador) y mensaje "¡Bienvenido a BorondoTours! Te mostramos cómo funciona en 30 segundos".
  2. **Búsqueda de tours** *(tooltip sobre el buscador)*: "Encuentra tu próxima aventura: filtra por destino, fecha y tipo de tour".
  3. **Wallet** *(tooltip sobre el saldo de Coins)*: "Ganas Borondo Coins con cada compra. Son como cashback para tu próximo tour".
  4. **Nivel de viajero** *(tooltip sobre el badge de nivel)*: "Entre más tours hagas, más beneficios: descuentos, acceso anticipado y tours exclusivos".
  5. **Mis reservas** *(tooltip sobre la lista vacía)*: "Aquí aparecerán todos tus tours próximos y pasados. ¡Haz tu primera reserva!".
  6. **CTA final**: botón "¡Explorar tours ahora!" que lleva a `/` (Discovery).
- [ ] El usuario puede saltar el onboarding con botón "Saltar" en cualquier paso — se marca como completado igualmente.
- [ ] Al completar el onboarding: actualizar `Users.onboarding_completed = true` vía `PATCH /api/v1/users/me/onboarding`.
- [ ] El onboarding NO se vuelve a mostrar aunque el usuario limpie cookies (persiste en backend).
- [ ] En mobile (viewport < 768px): los tooltips se adaptan a posición inferior con flecha apuntando al elemento.
- [ ] Los tooltips son accesibles: focus trap dentro del tooltip, Escape para saltar, ARIA roles correctos.

---

## 7. Feedback post-tour (Fase 2)

### RF-D09 — Recolección de reseñas separadas (Tour vs Guía)
**Criterios de aceptación:**
- [ ] Al cambiar booking a `COMPLETED` o `⚫ Terminado` (en App), BullMQ encola tarea de envío de feedback (con el nombre del guía adjunto).
- [ ] Email/SMS/Push Notificaton con enlace mágico o redirección a la vista de Wallet (token único, expira en 7 días, un solo uso).
- [ ] Modal de calificación segmentado en dos bloques visuales obligatorios:
  - **Experiencia / Tour:** Estrellas 1–5 + Comentario libre sobre la logística y la locación.
  - **Atención del Guía:** Estrellas 1–5 + Comentario libre sobre quien los lideró (`{Nombre del Guía}`).
- [ ] La reseña del tour aparece en la página pública del tour en el B2C (Spec B).
- [ ] La reseña del Guía aparece EXCLUSIVAMENTE en el Dashboard Privado de Performance del guía (vía BorondoTours App) y en los reportes del Operador.
- [ ] Un booking solo puede generar un registro atómico de doble-reseña.

---

## 8. API endpoints

```
GET  /api/v1/wallet/me               → saldo y transacciones del usuario
POST /api/v1/wallet/use              → aplicar Coins en checkout
GET  /api/v1/loyalty/me              → nivel, stats, progreso
GET  /api/v1/bookings/me             → upcoming, completed (Kanban)
POST /api/v1/bookings/:id/cancel     → cancelación autónoma
GET  /api/v1/bookings/:id/voucher    → PDF del voucher
POST /api/v1/reviews                 → crear reseña (requiere magic token)
PATCH /api/v1/users/me/onboarding   → marcar onboarding como completado
```

---

## 9. Modelo de datos

```
UserStats
  - user_id: uuid FK (PK)
  - tours_national: integer
  - tours_international: integer
  - tours_cruise: integer
  - total_spent: decimal
  - loyalty_level: integer (0–5)
  - updated_at: timestamp

LoyaltyEvents
  - id: uuid
  - user_id: uuid FK
  - event_type: enum (LEVEL_UP, COINS_EARNED, COINS_USED)
  - old_level: integer
  - new_level: integer
  - created_at: timestamp

Wallets
  - id: uuid
  - user_id: uuid FK (UNIQUE)
  - balance: decimal (default: 0)    ← saldo total en Coins (todos libres, ADR-007)

WalletTransactions
  - id: uuid
  - wallet_id: uuid FK
  - booking_id: uuid FK | null
  - type: enum (CREDIT, DEBIT)
  - amount: decimal
  - reason: enum (CANCELLATION_REFUND, FORCE_MAJEURE, LOYALTY_PURCHASE, COMPENSATION, CHECKOUT_USE, AD_REWARD, REVIEW_REWARD, REFERRAL_REWARD, VOIDED)
  - created_by: uuid FK (user que ejecutó la acción)
  - created_at: timestamp
```

---

## 10. Dependencias y riesgos

| Dependencia | Tipo | Impacto |
|---|---|---|
| BullMQ + Redis | Infra | Medio — colas de feedback |
| DynamoDB | AWS | Alto — chat (Fase 2) |
| Mapbox polígonos Colombia | Datos | Medio — GeoJSON de departamentos |
| Siigo API | Externa | Medio — facturación automática (Fase 2) |

---

## Links relacionados
- [[Spec-C-Checkout]]
- [[Spec-F-Dashboard]]
- [[../02-ADRs/ADR-003-DynamoDB-Chat]]
- [[../03-Knowledge/Modelo-Comisiones]]
