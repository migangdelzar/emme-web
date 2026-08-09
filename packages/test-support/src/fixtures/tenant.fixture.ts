import type { TenantContext } from '@emme/core';

export function createTenantFixture(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    id: 'tenant-test',
    slug: 'test-salon',
    name: 'Test Salon',
    ...overrides,
  };
}
