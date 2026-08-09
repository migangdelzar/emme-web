import { describe, expect, it } from 'vitest';
import { calculateServiceTotal, isServiceBookable } from './service.rules.js';
import type { Service } from './service.types.js';

const service: Service = {
  id: 'service-1',
  name: 'Classic manicure',
  price: 450,
  durationMinutes: 60,
  isActive: true,
};

describe('service rules', () => {
  it('calculates a non-negative total from a valid quantity', () => {
    expect(calculateServiceTotal(450, 2)).toBe(900);
  });

  it('rejects invalid prices and quantities', () => {
    expect(() => calculateServiceTotal(-1, 1)).toThrow('Service price must be non-negative');
    expect(() => calculateServiceTotal(450, 0)).toThrow('Service quantity must be positive');
  });

  it('allows booking only for active services with a positive duration', () => {
    expect(isServiceBookable(service)).toBe(true);
    expect(isServiceBookable({ ...service, isActive: false })).toBe(false);
    expect(isServiceBookable({ ...service, durationMinutes: 0 })).toBe(false);
  });
});
