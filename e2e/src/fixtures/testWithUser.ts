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

// Shared instances: set by authenticatedPage, used by provider fixture
let sharedRealProvider: RealProvider | null = null;
let sharedMockProvider: MockProvider | null = null;

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

async function mockLogin(page: Page, user: TestUser) {
  const provider = new MockProvider();
  await provider.setup(page, user);
  return provider;
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

  await page.goto(baseUrl);
  const login = new LoginPage(page);
  await login.login(username, password);
  await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 15000 });

  // Extract access token from browser localStorage → pass to RealProvider for Node.js API calls
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token) throw new Error('Real E2E login completed without an access token.');
  provider.setToken(token);
  await provider.setup(page, user);

  sharedRealProvider = provider;
  return provider;
}

export const test = base.extend<Fixtures>({
  testUser: [async ({}, use) => {
    const user = acquireUser();
    await use(user);
    releaseUser(user.userId);
  }, { scope: 'test' }],

  provider: [async ({ authenticatedPage: _authenticatedPage }, use) => {
    if (MODE === 'mock') {
      // Use the shared MockProvider set up by authenticatedPage (depends on it running first)
      if (!sharedMockProvider) throw new Error('Provider fixture was initialized before authenticatedPage.');
      await use(sharedMockProvider);
      await sharedMockProvider.teardown();
      sharedMockProvider = null;
    } else {
      // Use the shared RealProvider set up by authenticatedPage (depends on it running first)
      if (!sharedRealProvider) throw new Error('Provider fixture was initialized before authenticatedPage.');
      await use(sharedRealProvider);
      await sharedRealProvider.teardown();
      sharedRealProvider = null;
    }
  }, { scope: 'test' }],

  unauthenticatedPage: [async ({ page }, use) => {
    const provider = new MockProvider();
    await provider.setup(page, undefined);
    await use(page);
  }, { scope: 'test' }],

  authenticatedPage: [async ({ page, testUser }, use) => {
    if (MODE === 'mock') {
      const provider = new MockProvider();
      await provider.setup(page, testUser);
      await provider.seed(DEFAULT_SEED);
      sharedMockProvider = provider;
      await use(page);
      sharedMockProvider = null;
    } else {
      await realLogin(page, testUser);
      await use(page);
    }
  }, { scope: 'test' }],
});

export { expect } from '@playwright/test';
export type { TestUser, ApiProvider };
