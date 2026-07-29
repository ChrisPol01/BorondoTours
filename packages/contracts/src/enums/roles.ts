// 10 roles canónicos del sistema (Fuente de verdad: Modelo-Datos-Core §1)
export const ROLES = [
  'SUPER_ADMIN',
  'GERENTE',
  'AGENT',
  'COORD',
  'CLIENT',
  'OPERATOR_ADMIN',
  'OPERATOR_COORD',
  'OPERATOR_AGENT',
  'OPERATOR_GUIDE',
  'OPERATOR_DRIVER',
] as const;

export type Role = (typeof ROLES)[number];
