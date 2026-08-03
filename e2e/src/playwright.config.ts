import { defineConfig } from '@playwright/test';

const recordDemo = process.env.RECORD_DEMO === 'true';

export default defineConfig({
  testDir: './specs',
  timeout: 30000,
  expect: { timeout: 8000 },
  retries: 0,
  fullyParallel: true,
  maxFailures: 0,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],

  outputDir: recordDemo ? 'test-results/demo-recordings' : 'test-results',

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    video: recordDemo ? 'on' : 'retain-on-failure',
    trace: recordDemo ? 'on' : 'on-first-retry',
    screenshot: recordDemo ? 'on' : 'only-on-failure',
  },

  projects: [
    {
      name: 'mock',
      use: { browserName: 'chromium' },
      metadata: { mode: 'mock', description: 'Mock API — fast, no backend' },
    },
    {
      name: 'real',
      use: { browserName: 'chromium' },
      timeout: 30000,               // real backend + OAuth2 needs more time
      metadata: { mode: 'real', description: 'Real backend + Keycloak' },
    },
  ],

  webServer: {
    command: 'cd ../../apps/emme-salon-app && bun dev',
    port: 3000,
    reuseExistingServer: true,
    env: {
      ...process.env,
      VITE_APP_ENV: process.env.VITE_APP_ENV ?? 'local',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? 'http://localhost:8081',
      VITE_WEB_BASE_DOMAIN: process.env.VITE_WEB_BASE_DOMAIN ?? 'localhost',
    },
  },
});
