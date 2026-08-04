import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { acquireUser, releaseUser, type TestUser } from './userPool';
import { MockProvider } from '../providers/MockProvider';
import { RealProvider } from '../providers/RealProvider';
import type { ApiProvider, SeedData } from '../providers/ApiProvider';
import { LoginPage } from '../pages/LoginPage';

const MODE = process.env.E2E_MODE || 'mock';

const DEFAULT_SEED: SeedData = {
  services: [{
    id: 'svc-default', name: 'Manicure Clásica', price: 350, duration: 45,
    category: 'Manicura', isActive: true,
  }],
  customers: [{
    id: 'cust-default', name: 'Cliente Demo', phone: '555-0000', email: 'demo@emme.app',
  }],
};

/**
 * Authenticated page fixture. Same API for mock and real:
 * - Mock: injects fake tokens via localStorage, intercepts API with page.route()
 * - Real: does BFF OAuth2 flow through Keycloak, hits real backend
 *
 * Usage:
 * ```
 * test('flow', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/#/dashboard');
 *   // ... test UI flows
 * });
 * ```
 */

interface Fixtures {
  testUser: TestUser;
  provider: ApiProvider;
  authenticatedPage: Page;
  unauthenticatedPage: Page;
}

function requiredRealEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Real E2E requires ${name} to be configured; refusing to use an implicit environment.`);
  }
  return value;
}

async function realLogin(page: Page, user: TestUser): Promise<RealProvider> {
  const provider = new RealProvider();
  const baseUrl = requiredRealEnvironment('E2E_BASE_URL');
  const username = requiredRealEnvironment('E2E_KEYCLOAK_USERNAME');
  const password = requiredRealEnvironment('E2E_KEYCLOAK_PASSWORD');

  await page.addInitScript(() => {
    localStorage.setItem('emme-ui-state', JSON.stringify({ state: { isFirstTime: false }, version: 0 }));
  });
  await page.goto(baseUrl);
  const login = new LoginPage(page);
  await login.login(username, password);
  await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 15000 });

  // Extract access token from browser localStorage → pass to RealProvider for Node.js API calls
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token) throw new Error('Real E2E login completed without an access token.');
  provider.setToken(token);
  await provider.setup(page, user);

  return provider;
}

export const test = base.extend<Fixtures>({
  testUser: [async ({}, use) => {
    const user = acquireUser();
    await use(user);
    releaseUser(user.userId);
  }, { scope: 'test' }],

  provider: [async ({ page, testUser }, use) => {
    let provider: ApiProvider;

    if (MODE === 'mock') {
      const mockProvider = new MockProvider();
      await mockProvider.setup(page, testUser);
      await mockProvider.seed(DEFAULT_SEED);
      provider = mockProvider;
    } else {
      provider = await realLogin(page, testUser);
    }

    try {
      await use(provider);
    } finally {
      await provider.teardown();
    }
  }, { scope: 'test' }],

  unauthenticatedPage: [async ({ page }, use) => {
    const provider = new MockProvider();
    await provider.setup(page, undefined);
    await use(page);
  }, { scope: 'test' }],

  authenticatedPage: [async ({ page, provider: _provider }, use) => {
    await use(page);
  }, { scope: 'test' }],
});

export { expect } from '@playwright/test';
export type { TestUser, ApiProvider };
