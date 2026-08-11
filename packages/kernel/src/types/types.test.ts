import { describe, expect, expectTypeOf, it } from 'vitest';

import { createEntityId, type Brand, type EntityId, type Nullable } from './index.js';

type AppointmentId = EntityId<'Appointment'>;
type CustomerId = EntityId<'Customer'>;

describe('kernel types', () => {
  it('creates a branded entity identifier from a non-empty value', () => {
    const id = createEntityId<'Appointment'>('appointment-1');

    expect(id).toBe('appointment-1');
    expectTypeOf(id).toEqualTypeOf<AppointmentId | null>();
  });

  it('rejects an empty entity identifier', () => {
    expect(createEntityId('')).toBeNull();
  });

  it('keeps entity identifier brands distinct', () => {
    expectTypeOf<AppointmentId>().not.toEqualTypeOf<CustomerId>();
    expectTypeOf<Brand<string, 'Appointment'>>().toEqualTypeOf<AppointmentId>();
  });

  it('models nullable values without widening the non-null branch', () => {
    expectTypeOf<Nullable<string>>().toEqualTypeOf<string | null>();
  });
});
