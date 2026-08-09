import { describe, expect, it } from 'vitest';

import { createNoopTelemetry, redactTelemetry } from './telemetry.js';

describe('telemetry adapters', () => {
  it('redacts credentials and session material before recording', () => {
    expect(
      redactTelemetry({
        route: '/appointments',
        accessToken: 'secret',
        cookie: 'private',
        count: 2,
      }),
    ).toEqual({ route: '/appointments', count: 2 });
  });

  it('provides a safe no-op adapter for tests', () => {
    expect(() => createNoopTelemetry().track('loaded', { count: 1 })).not.toThrow();
  });
});
