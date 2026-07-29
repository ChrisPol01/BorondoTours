import { z } from 'zod';

export const CheckoutSchema = z.object({
  tourInstanceId: z.string().uuid(),
  pax: z.array(z.object({
    category: z.string(),
    quantity: z.number().int().min(1),
  })),
  addons: z.array(z.object({
    addonId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).optional(),
  isColombianResident: z.boolean(),
  passportS3Key: z.string().optional(),
  splitFare: z.object({
    enabled: z.boolean(),
    parts: z.number().int().min(2).optional(),
  }).optional(),
  passengerData: z.object({
    documentType: z.enum(['CC', 'CE', 'PASSPORT']),
    documentNumber: z.string(),
    phone: z.string(),
    emergencyContactName: z.string(),
    emergencyContactPhone: z.string(),
    medicalConditions: z.string().optional(),
    hotelPickup: z.string().optional(),
  }),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const CancelBookingSchema = z.object({
  reason: z.string().optional(),
  isForceMajeure: z.boolean().default(false),
  evidenceS3Key: z.string().optional(),
});

export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
