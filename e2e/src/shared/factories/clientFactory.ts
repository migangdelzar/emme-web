import type { Client } from '@emme/contracts';

export const makeClient = (overrides?: Partial<Client>): Client => ({
  id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: 'Cliente Demo',
  phone: '555-0000',
  email: 'demo@emme.app',
  ...overrides,
});

export const makeClients = (count: number, overrides?: Partial<Client>): Client[] =>
  Array.from({ length: count }, (_, i) =>
    makeClient({ id: `cust-${i + 1}`, name: `Cliente ${i + 1}`, email: `cliente${i + 1}@test.com`, ...overrides })
  );

export const clientCatalog = {
  empty: [] as Client[],
  single: [makeClient()],
  some: [
    makeClient({ id: 'cust-1', name: 'Valeria Arriaza', email: 'valeria@test.com' }),
    makeClient({ id: 'cust-2', name: 'Elena Garcia', email: 'elena@test.com' }),
    makeClient({ id: 'cust-3', name: 'Maria Jose', email: 'maria@test.com' }),
  ],
};
