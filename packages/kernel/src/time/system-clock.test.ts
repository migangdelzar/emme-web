import { expect, it } from 'vitest';

import { SystemClock } from './system-clock.js';

it('returns a Date from the system clock implementation', () => {
  const clock = new SystemClock();

  expect(clock.now()).toBeInstanceOf(Date);
});
