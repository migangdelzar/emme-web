import { describe, expect, it } from 'vitest';

import { createPlatformClient } from './platformClient';
import type { RuntimeConfig } from '../app/config/runtimeConfig';

describe('createPlatformClient', () => {
  it('creates a platform client from runtime config', async () => {
    const requests: Array<[RequestInfo | URL, RequestInit?]> = [];
    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push([input, init]);
      return new Response(JSON.stringify({ status: 'UP' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = createPlatformClient({
      runtimeConfig: createRuntimeConfig({ apiBaseUrl: 'https://api.staging.emme.app' }),
      fetcher,
    });

    await client.getHealth();

    expect(requests[0]?.[0].toString()).toBe('https://api.staging.emme.app/q/health');
  });
});

function createRuntimeConfig(overrides: Partial<RuntimeConfig> = {}): RuntimeConfig {
  return {
    appEnv: 'staging',
    apiBaseUrl: 'https://api.emme.app',
    webBaseDomain: 'emme.app',
    sentryDsn: null,
    ...overrides,
  };
}
