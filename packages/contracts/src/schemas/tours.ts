import { z } from 'zod';
import { TOUR_CATEGORY, PRODUCT_TYPE, DIFFICULTY } from '../enums/tours';

// QUERY /api/v1/tours/search — body de búsqueda compleja (RFC 10008)
export const TourSearchSchema = z.object({
  q: z.string().optional(),
  filters: z.object({
    categories: z.array(z.enum(TOUR_CATEGORY)).optional(),
    difficulties: z.array(z.enum(DIFFICULTY)).optional(),
    regions: z.array(z.string()).optional(),
    priceRange: z.object({ min: z.number(), max: z.number() }).optional(),
    durationRange: z.object({ min: z.number(), max: z.number() }).optional(),
    productTypes: z.array(z.enum(PRODUCT_TYPE)).optional(),
    dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
    paxMin: z.number().int().optional(),
    ivaExemptAvailable: z.boolean().optional(),
    operatorIds: z.array(z.string().uuid()).optional(),
    geo: z.object({
      type: z.enum(['radius', 'polygon']),
      center: z.object({ lat: z.number(), lng: z.number() }).optional(),
      radiusKm: z.number().optional(),
      polygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
    }).optional(),
  }).optional(),
  sort: z.object({
    field: z.enum(['popular', 'price_asc', 'price_desc', 'recent', 'rating']),
    order: z.enum(['asc', 'desc']).default('desc'),
  }).optional(),
  cursor: z.string().optional(),
});

export type TourSearchInput = z.infer<typeof TourSearchSchema>;
