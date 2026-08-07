import { test as setup, chromium } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { provisionTestData } from '../../setup/seed-data';

const AUTH_STATE = '.auth/auth-state.json';

setup('real E2E login — save auth state for reuse', async () => {
  if (process.env.E2E_MODE !== 'real') return;

  const baseUrl = process.env.E2E_BASE_URL?.trim() || 'http://localhost:3000';
  const username = process.env.E2E_KEYCLOAK_USERNAME?.trim();
  const password = process.env.E2E_KEYCLOAK_PASSWORD?.trim();

  if (!username || !password) {
    throw new Error('E2E_KEYCLOAK_USERNAME and E2E_KEYCLOAK_PASSWORD required for real mode');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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
    await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    await page.getByRole('complementary').waitFor({ state: 'visible', timeout: 15000 });
  }
  await page.waitForLoadState('networkidle');

  let token = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    token = await page.evaluate(() => localStorage.getItem('access_token'));
    if (token) break;
    await page.waitForTimeout(500);
  }
  if (!token) throw new Error('Setup login failed — no access token in localStorage');

  await context.storageState({ path: AUTH_STATE });
  await browser.close();

  // Provision test data for E2E flows (idempotent)
  const tenantSlug = process.env.E2E_TENANT_SLUG || 'e2e-studio';
  await provisionTestData(token, tenantSlug);

  console.log(`[Setup] Auth state saved to ${AUTH_STATE} (token: ${token.slice(0, 12)}...)`);
});
