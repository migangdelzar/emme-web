import { describe, expect, it } from 'vitest';
import { resolveClientApiBaseUrl } from './clientRuntimeConfig.js';

describe('client runtime configuration', () => {
  it('uses the configured API base URL', () => {
    expect(
      resolveClientApiBaseUrl(
        { VITE_API_BASE_URL: 'http://localhost:8081' },
        'http://localhost:3001'
      )
    ).toBe('http://localhost:8081');
  });

  it('falls back to the browser origin for proxy-based development', () => {
    expect(resolveClientApiBaseUrl({}, 'http://localhost:3001')).toBe('http://localhost:3001');
  });
});
