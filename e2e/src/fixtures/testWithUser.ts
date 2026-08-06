import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { acquireUser, releaseUser, type TestUser } from './userPool';
import { MockProvider } from '../providers/MockProvider';
import { RealProvider } from '../providers/RealProvider';
import type { ApiProvider, SeedData } from '../providers/ApiProvider';
import { LoginPage } from '../pages/LoginPage';

const MODE = process.env.E2E_MODE || 'mock';

const DEFAULT_SEED: SeedData = {
  services: [
    { id: 's1', name: 'Manicure Clasica', price: 350, duration: 45, category: 'Manicura y Cuidado Natural', isActive: true },
    { id: 's2', name: 'Manicure Rusa', price: 750, duration: 90, category: 'Manicura y Cuidado Natural', isActive: true },
    { id: 's3', name: 'Soft Gel Premium', price: 1200, duration: 120, category: 'Extensiones y Estructura', isActive: true },
  ],
  customers: [
    { id: 'c1', name: 'Valeria Arriaza', phone: '555-0101', email: 'valeria@test.com' },
    { id: 'c2', name: 'Elena Garcia', phone: '555-0102', email: 'elena@test.com' },
    { id: 'c3', name: 'Maria Jose', phone: '555-0103', email: 'maria@test.com' },
  ],
};

interface Fixtures {
  testUser: TestUser;
  provider: ApiProvider;
  authenticatedPage: Page;
  unauthenticatedPage: Page;
}

function requiredRealEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Real E2E requires ${name} to be configured; refusing to use an implicit environment.`
    );
  }
  return value;
}

async function realLogin(page: Page, user: TestUser): Promise<RealProvider> {
  const provider = new RealProvider();
  const baseUrl = requiredRealEnvironment('E2E_BASE_URL');
  const username = requiredRealEnvironment('E2E_KEYCLOAK_USERNAME');
  const password = requiredRealEnvironment('E2E_KEYCLOAK_PASSWORD');

  await page.addInitScript(() => {
    localStorage.setItem(
      'emme-ui-state',
      JSON.stringify({ state: { isFirstTime: false }, version: 0 })
    );
  });
  await page.goto(baseUrl);
  const login = new LoginPage(page);
  await login.login(username, password);
  try {
    await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    await page.getByRole('complementary').waitFor({ state: 'visible', timeout: 5000 });
  }
  await page.waitForLoadState('networkidle');

  let token: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    token = await page.evaluate(() => localStorage.getItem('access_token'));
    if (token) break;
    await page.waitForTimeout(500);
  }
  if (!token) throw new Error('Real E2E login completed without an access token.');
  provider.setToken(token);
  await provider.setup(page, user);

  await page.waitForLoadState('networkidle');

  return provider;
}

/**
 * Real mode setup using shared storageState auth.
 * Skips the expensive OAuth2 Keycloak flow — token is already in localStorage.
 */
async function realSetupFromStorageState(page: Page, user: TestUser): Promise<RealProvider> {
  const provider = new RealProvider();
  const baseUrl = requiredRealEnvironment('E2E_BASE_URL');

  await page.addInitScript(() => {
    localStorage.setItem(
      'emme-ui-state',
      JSON.stringify({ state: { isFirstTime: false }, version: 0 })
    );
  });
  await page.goto(baseUrl);

  try {
    await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    await page.getByRole('complementary').waitFor({ state: 'visible', timeout: 10000 });
  }
  await page.waitForLoadState('networkidle');

  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token) {
    // Token expired or storageState corrupted — fall back to full login
    console.warn('[Provider] No token in storageState, falling back to full OAuth2 login');
    return realLogin(page, user);
  }

  provider.setToken(token);
  await provider.setup(page, user);

  await page.waitForLoadState('networkidle');
  return provider;
}

export const test = base.extend<Fixtures>({
  testUser: [
    async ({}, use) => {
      const user = acquireUser();
      await use(user);
      releaseUser(user.userId);
    },
    { scope: 'test' },
  ],

  provider: [
    async ({ page, testUser }, use) => {
      let provider: ApiProvider;

      if (MODE === 'mock') {
        const mockProvider = new MockProvider();
        await mockProvider.setup(page, testUser);
        await mockProvider.seed(DEFAULT_SEED);
        provider = mockProvider;
      } else {
        // Detect if storageState already provides auth (token in localStorage)
        // This avoids the 3-8s OAuth2 flow when using shared login setup
        const existingToken = await page.evaluate(() => localStorage.getItem('access_token'));

        if (existingToken) {
          provider = await realSetupFromStorageState(page, testUser);
        } else {
          provider = await realLogin(page, testUser);
        }

        await provider.seed(DEFAULT_SEED);
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
      }

      try {
        await use(provider);
      } finally {
        await provider.teardown();
      }
    },
    { scope: 'test' },
  ],

  unauthenticatedPage: [
    async ({ page }, use) => {
      const provider = new MockProvider();
      await provider.setup(page, undefined);
      try {
        await use(page);
      } finally {
        await provider.teardown();
      }
    },
    { scope: 'test' },
  ],

  authenticatedPage: [
    async ({ page, provider: _provider }, use) => {
      if (MODE === 'real') {
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
      await use(page);
    },
    { scope: 'test' },
  ],
});

export { expect } from '@playwright/test';
export type { TestUser, ApiProvider };
