import { expectTypeOf, it } from 'vitest';

import type { Clock } from './clock.js';

it('defines a framework-independent clock protocol', () => {
  const clock: Clock = { now: () => new Date(0) };

  expectTypeOf(clock.now()).toEqualTypeOf<Date>();
});
