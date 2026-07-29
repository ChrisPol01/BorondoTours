import { z } from 'zod';

// Response format estándar (todas las respuestas de la API)
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
    }).nullable(),
    meta: z.object({
      cursor: z.string().optional(),
      hasMore: z.boolean().optional(),
      total: z.number().optional(),
    }).nullable(),
  });

// Paginación cursor-based
export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(12),
});
