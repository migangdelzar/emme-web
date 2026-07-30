import { defineConfig } from '@playwright/test';

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

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
  },
});
