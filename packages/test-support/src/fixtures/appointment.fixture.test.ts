import { expect, expectTypeOf, it } from 'vitest';

import { createAppointmentFixture } from './appointment.fixture.js';

it('creates an appointment fixture with typed override support', () => {
  const appointment = createAppointmentFixture({ status: 'confirmed' });

  expect(appointment.status).toBe('confirmed');
  expectTypeOf(appointment.id).toEqualTypeOf<string>();
});
