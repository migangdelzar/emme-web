import { describe, expect, it } from 'vitest';

import {
  calculateServiceTotal,
  createService,
  isDesignVisible,
  isServiceBookable,
} from './index.js';

const service = createService({
  id: 'service-1',
  tenantId: 'tenant-1',
  name: 'Classic manicure',
  price: 450,
  durationMinutes: 60,
  isActive: true,
});

describe('catalog domain', () => {
  it('rejects negative prices and non-positive durations', () => {
    expect(() => createService({ ...service, price: -1 })).toThrow(/price/i);
    expect(() => createService({ ...service, durationMinutes: 0 })).toThrow(/duration/i);
  });

  it('calculates totals and only books active services', () => {
    expect(calculateServiceTotal(service, 2)).toBe(900);
    expect(isServiceBookable(service)).toBe(true);
    expect(isServiceBookable({ ...service, isActive: false })).toBe(false);
  });

  it('exposes designs only when active and public for the same tenant', () => {
    const design = { id: 'design-1', tenantId: 'tenant-1', title: 'Nail art', isActive: true, isPublic: true };
    expect(isDesignVisible(design, 'tenant-1')).toBe(true);
    expect(isDesignVisible({ ...design, isPublic: false }, 'tenant-1')).toBe(false);
    expect(isDesignVisible(design, 'tenant-2')).toBe(false);
  });
});
