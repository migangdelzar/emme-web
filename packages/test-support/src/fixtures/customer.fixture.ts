import type { Client } from '@emme/api';

export function createCustomerFixture(overrides: Partial<Client> = {}): Client {
  return {
    id: 'customer-test',
    name: 'Test Customer',
    phone: '+52 55 0000 0000',
    ...overrides,
  };
}
