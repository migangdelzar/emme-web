import { describe, expect, it } from 'vitest';

import { parseRuntimeConfig } from './runtimeConfig';

describe('parseRuntimeConfig', () => {
  it('returns config when required VITE_ values are present', () => {
    const config = parseRuntimeConfig({
      VITE_APP_ENV: 'staging',
      VITE_API_BASE_URL: 'https://api.staging.emme.app',
      VITE_WEB_BASE_DOMAIN: 'staging.emme.app',
      VITE_SENTRY_DSN: 'https://public@sentry.example/1',
    });

    expect(config).toEqual({
      appEnv: 'staging',
      apiBaseUrl: 'https://api.staging.emme.app',
      webBaseDomain: 'staging.emme.app',
      sentryDsn: 'https://public@sentry.example/1',
    });
  });

  it('defaults optional values without inventing secrets', () => {
    const config = parseRuntimeConfig({
      VITE_API_BASE_URL: 'http://localhost:8080',
      VITE_WEB_BASE_DOMAIN: 'localhost',
    });

    expect(config.appEnv).toBe('local');
    expect(config.sentryDsn).toBeNull();
  });

  it('rejects missing required config', () => {
    expect(() => parseRuntimeConfig({})).toThrow(
      'Missing public runtime config: VITE_API_BASE_URL'
    );
  });

  it('rejects invalid app environments', () => {
    expect(() =>
      parseRuntimeConfig({
        VITE_APP_ENV: 'qa',
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_WEB_BASE_DOMAIN: 'localhost',
      })
    ).toThrow('Invalid runtime config: VITE_APP_ENV=qa');
  });

  it('rejects secret-like keys in client config', () => {
    expect(() =>
      parseRuntimeConfig({
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_WEB_BASE_DOMAIN: 'localhost',
        GOOGLE_CLIENT_SECRET: 'not-allowed',
      })
    ).toThrow('Secret-like config key is not allowed in the client bundle');
  });

  it('rejects Gemini API keys in client runtime config', () => {
    expect(() =>
      parseRuntimeConfig({
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_WEB_BASE_DOMAIN: 'localhost',
        VITE_GEMINI_API_KEY: 'test-key',
      })
    ).toThrow('Secret-like config key is not allowed in the client bundle');
  });
});
