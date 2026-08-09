import { describe, expect, it } from 'vitest';

import { FixedClock } from './fixed-clock.js';

describe('FixedClock', () => {
  it('returns the injected instant without changing it', () => {
    const instant = new Date('2026-01-01T00:00:00.000Z');
    const clock = new FixedClock(instant);

    expect(clock.now()).toBe(instant);
  });
});
