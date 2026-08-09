import { describe, expect, it } from 'vitest';
import { mapCatalogService } from './catalog-mapper.js';

describe('mapCatalogService', () => {
  it('normalizes basePrice/price and durationMinutes/duration', () => {
    expect(mapCatalogService({ id: 'service-1', tenantId: 'tenant-1', name: 'Gel', basePrice: 500, durationMinutes: 45, status: 'ACTIVE' })).toMatchObject({
      price: 500, durationMinutes: 45, isActive: true,
    });
    expect(mapCatalogService({ id: 'service-2', tenantId: 'tenant-1', name: 'Spa', price: 300, duration: 30, isActive: false })).toMatchObject({
      price: 300, durationMinutes: 30, isActive: false,
    });
  });
});
