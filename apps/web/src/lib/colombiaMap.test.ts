import { describe, expect, it } from 'vitest';
import {
  COLOMBIA_DEPARTMENTS,
  COLOMBIA_REGION_LABELS,
  departmentsByRegion,
  findDepartmentByDaneCode,
} from './colombiaMap';

describe('colombiaMap', () => {
  it('tiene los 33 departamentos (32 + Bogotá D. C.) con código DANE único', () => {
    expect(COLOMBIA_DEPARTMENTS).toHaveLength(33);
    const codes = new Set(COLOMBIA_DEPARTMENTS.map((d) => d.daneCode));
    expect(codes.size).toBe(33);
    COLOMBIA_DEPARTMENTS.forEach((d) => expect(d.daneCode).toMatch(/^\d{2}$/));
  });

  it('todos los departamentos tienen trazo y una región válida', () => {
    COLOMBIA_DEPARTMENTS.forEach((d) => {
      expect(d.path.length).toBeGreaterThan(10);
      expect(Object.keys(COLOMBIA_REGION_LABELS)).toContain(d.region);
    });
  });

  it('busca por código DANE y agrupa por región', () => {
    expect(findDepartmentByDaneCode('63')?.name).toBe('Quindío');
    expect(findDepartmentByDaneCode('00')).toBeUndefined();
    expect(departmentsByRegion('INSULAR').map((d) => d.daneCode)).toEqual(['88']);
  });
});
