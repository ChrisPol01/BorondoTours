// Máquina de estados multi-dimensional del Booking
// Ver: docs/04-Tech-Design/Services/Maquina-Estados-Booking.md

export const PAYMENT_STATUS = [
  'IN_PAID',
  'PARTIAL_PAID',
  'CONFIRMED',
  'SETTLED',
  'EXPIRED_PAID',
  'PAYMENT_FAILED',
  'CHARGEBACK',
] as const;

export const OPERATIONAL_STATUS = [
  'PENDING',
  'ASSISTED',
  'NO_ASSISTED',
  'IN_TOUR',
  'TOUR_COMPLETED',
  'TOUR_CANCELLED_ONSITE',
  'CANCELLED',
] as const;

export const LIFECYCLE_STATUS = [
  'ACTIVE',
  'CANCELED',
  'OPERATOR_CANCELLED',
  'RESCHEDULED',
] as const;

export const PAYOUT_STATUS = [
  'HELD',
  'SCHEDULED',
  'DISBURSED',
  'PARTIALLY_DISBURSED',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export type OperationalStatus = (typeof OPERATIONAL_STATUS)[number];
export type LifecycleStatus = (typeof LIFECYCLE_STATUS)[number];
export type PayoutStatus = (typeof PAYOUT_STATUS)[number];
