export const TOUR_CATEGORY = [
  'NATURALEZA', 'AVENTURA', 'CULTURAL', 'GASTRONOMICO',
  'URBANO', 'INTERNACIONAL', 'CRUCERO',
] as const;

export const PRODUCT_TYPE = [
  'PASADIA', 'PASANOCHE', 'EXCURSION',
  'PLAN_PERSONALIZADO', 'PLAN_AEREO',
] as const;

export const DIFFICULTY = ['FACIL', 'MODERADO', 'DIFICIL', 'EXTREMO'] as const;

export const TOUR_STATUS = [
  'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED',
] as const;

export type TourCategory = (typeof TOUR_CATEGORY)[number];
export type ProductType = (typeof PRODUCT_TYPE)[number];
export type Difficulty = (typeof DIFFICULTY)[number];
export type TourStatus = (typeof TOUR_STATUS)[number];
