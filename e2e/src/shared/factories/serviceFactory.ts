import type { Service, CreateService } from '@emme/api';

/** Create a single service fixture */
export const makeService = (overrides?: Partial<Service>): Service => ({
  id: `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: 'Manicure Clásica',
  price: 350,
  duration: 45,
  category: 'Manicura',
  isActive: true,
  ...overrides,
});

/** Create a list of services */
export const makeServices = (count: number, overrides?: Partial<Service>): Service[] =>
  Array.from({ length: count }, (_, i) =>
    makeService({ id: `svc-${i + 1}`, name: `Servicio ${i + 1}`, ...overrides })
  );

/** Pre-built scenarios */
export const serviceCatalog = {
  empty: [] as Service[],
  single: [makeService()],
  full: [
    makeService({ id: 'svc-1', name: 'Manicure Rusa', price: 750, duration: 60, category: 'Manicura' }),
    makeService({ id: 'svc-2', name: 'Soft Gel Premium', price: 1200, duration: 90, category: 'Extensiones' }),
    makeService({ id: 'svc-3', name: 'Pedicure Spa', price: 600, duration: 50, category: 'Pedicura' }),
    makeService({ id: 'svc-4', name: 'Nail Art', price: 350, duration: 30, category: 'Decoración' }),
    makeService({ id: 'svc-5', name: 'Acrílico Escultural', price: 1500, duration: 120, category: 'Extensiones' }),
  ],
  inactive: [makeService({ id: 'svc-1', name: 'Manicure Clásica', isActive: false })],
};
