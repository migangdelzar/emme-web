import { describe, expect, it } from 'vitest';

import { FakeClock } from './fake-clock.js';

describe('FakeClock', () => {
  it('returns the configured time and supports deterministic updates', () => {
    const first = new Date('2026-01-01T00:00:00.000Z');
    const second = new Date('2026-01-02T00:00:00.000Z');
    const clock = new FakeClock(first);

    expect(clock.now()).toEqual(first);
    clock.setNow(second);
    expect(clock.now()).toEqual(second);
  });
});
