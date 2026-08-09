import { describe, expect, it } from 'vitest';

import { getRuntimeConfig, parseRuntimeConfig } from './runtimeConfig';

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
      appName: 'salon-app',
      sentryDsn: 'https://public@sentry.example/1',
    });
  });

  it('defaults optional values without inventing secrets', () => {
    const config = parseRuntimeConfig({
      VITE_API_BASE_URL: 'http://localhost:8080',
      VITE_WEB_BASE_DOMAIN: 'localhost',
    });

    expect(config.appEnv).toBe('local');
    expect(config.appName).toBe('salon-app');
    expect(config.sentryDsn).toBeNull();
  });

  it('accepts an explicit deployable app name from public runtime config', () => {
    const config = parseRuntimeConfig({
      VITE_API_BASE_URL: 'https://admin.emme.app',
      VITE_WEB_BASE_DOMAIN: 'admin.emme.app',
      APP_NAME: 'admin-app',
    });

    expect(config.appName).toBe('admin-app');
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

  it('reads browser-provided runtime configuration for a production container', () => {
    window.__EMME_RUNTIME_CONFIG__ = {
      apiUrl: 'https://api.emme.app',
      environment: 'prod',
      appName: 'salon-app',
      webBaseDomain: 'app.emme.com',
    };

    expect(getRuntimeConfig()).toEqual({
      appEnv: 'prod',
      apiBaseUrl: 'https://api.emme.app',
      webBaseDomain: 'app.emme.com',
      appName: 'salon-app',
      sentryDsn: null,
    });

    delete window.__EMME_RUNTIME_CONFIG__;
  });

  it('falls back to the browser origin and hostname when runtime values are absent', () => {
    window.__EMME_RUNTIME_CONFIG__ = {};

    const config = getRuntimeConfig();

    expect(config.apiBaseUrl).toBe(window.location.origin);
    expect(config.webBaseDomain).toBe(window.location.hostname);

    delete window.__EMME_RUNTIME_CONFIG__;
  });
});
