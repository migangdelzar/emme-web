import type { Service } from '@emme/api';

export function createServiceFixture(overrides: Partial<Service> = {}): Service {
  return {
    id: 'service-test',
    name: 'Test Service',
    price: 300,
    duration: 60,
    category: 'general',
    isActive: true,
    ...overrides,
  };
}
