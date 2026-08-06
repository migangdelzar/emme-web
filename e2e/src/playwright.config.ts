import { defineConfig } from '@playwright/test';

const recordDemo = process.env.RECORD_DEMO === 'true';
const isReal = process.env.E2E_MODE === 'real';
const useExternalWeb = process.env.E2E_EXTERNAL_WEB === 'true';
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

const webServerConfig = useExternalWeb
  ? undefined
  : {
      command: 'cd ../../apps/emme-salon-app && bun dev',
      port: 3000,
      reuseExistingServer: false,
      env: {
        VITE_APP_ENV: process.env.VITE_APP_ENV ?? 'local',
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
        API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? 'http://localhost:8081',
        VITE_WEB_BASE_DOMAIN: process.env.VITE_WEB_BASE_DOMAIN ?? 'localhost',
      },
    };

const realProjects = isReal
  ? [
      {
        name: 'setup',
        testDir: './specs/setup',
        testMatch: /real-login\.setup\.ts/,
        metadata: { mode: 'real' },
      },
      {
        name: 'real',
        use: {
          browserName: 'chromium' as const,
          storageState: '.auth/auth-state.json',
        },
        dependencies: ['setup'],
        testIgnore: '**/setup/**',
        timeout: 120000,
        expect: { timeout: 40000 },
        metadata: { mode: 'real', description: 'Real backend + Keycloak (shared login)' },
      },
    ]
  : [];

export default defineConfig({
  testDir: './specs',
  timeout: 30000,
  expect: { timeout: 8000 },
  retries: process.env.CI ? 1 : (isReal ? 2 : 0),
  fullyParallel: !isReal,
  maxFailures: 0,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 4 : (isReal ? 1 : undefined),

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],

  outputDir: recordDemo
    ? isReal ? 'test-results/real-recordings' : 'test-results/mock-recordings'
    : 'test-results',

  use: {
    baseURL,
    headless: true,
    video: recordDemo ? 'on' : isReal ? 'retain-on-failure' : 'off',
    trace: recordDemo ? 'on' : 'on-first-retry',
    screenshot: recordDemo ? 'on' : 'only-on-failure',
  },

  projects: [
    {
      name: 'mock',
      use: { browserName: 'chromium' },
      metadata: { mode: 'mock', description: 'Mock API — fast, no backend' },
    },
    ...realProjects,
  ],

  ...(webServerConfig ? { webServer: webServerConfig } : {}),
});
