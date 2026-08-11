import { expect, expectTypeOf, it } from 'vitest';

import { createEntityId, type EntityId } from './entity-id.js';

it('creates a typed entity ID for a non-empty value', () => {
  const appointmentId = createEntityId<'Appointment'>('appointment-123');

  expect(appointmentId).toBe('appointment-123');
  expectTypeOf(appointmentId).toEqualTypeOf<EntityId<'Appointment'> | null>();
});

it('rejects empty and whitespace-only entity ID values', () => {
  expect(createEntityId<'Appointment'>('')).toBeNull();
  expect(createEntityId<'Appointment'>('   ')).toBeNull();
});

it('keeps IDs for different entity types distinct', () => {
  expectTypeOf<EntityId<'Appointment'>>().not.toMatchTypeOf<EntityId<'Customer'>>();
});
