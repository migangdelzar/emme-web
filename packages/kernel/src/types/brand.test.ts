import { expectTypeOf, it } from 'vitest';

import type { Brand } from './brand.js';

it('creates a distinct readonly brand without changing the underlying value type', () => {
  type AppointmentId = Brand<string, 'AppointmentId'>;
  type CustomerId = Brand<string, 'CustomerId'>;

  expectTypeOf<AppointmentId>().toMatchTypeOf<string>();
  expectTypeOf<string>().not.toMatchTypeOf<AppointmentId>();
  expectTypeOf<AppointmentId>().not.toMatchTypeOf<CustomerId>();
});
