import { test as setup, chromium } from '@playwright/test';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { LoginPage } from '../../pages/LoginPage';
import { provisionTestData } from '../../setup/seed-data';
import {
  readProvisionedSalonAuthState,
  resolveRealAuthStatePath,
} from '../../setup/authState';
import { resolveRealE2ECredentials } from '../../setup/provisionerCredentials';

setup('real E2E login — save auth state for reuse', async () => {
  if (process.env.E2E_MODE !== 'real') return;

  const baseUrl = process.env.E2E_BASE_URL?.trim() || 'http://localhost:3000';
  const authStatePath = resolveRealAuthStatePath();

  const browser = await chromium.launch({
    headless: process.env.E2E_HEADED !== 'true',
  });
  const canReuseAuthState =
    process.env.E2E_FORCE_LOGIN !== 'true' && existsSync(authStatePath);
  const provisionedState =
    process.env.E2E_FORCE_LOGIN === 'true' ? null : readProvisionedSalonAuthState();
  const context = await browser.newContext({
    ...(provisionedState
      ? { storageState: provisionedState }
      : canReuseAuthState
        ? { storageState: authStatePath }
        : {}),
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem(
      'emme-ui-state',
      JSON.stringify({ state: { isFirstTime: false }, version: 0 })
    );
  });

  await page.goto(baseUrl);

  let token = await page.evaluate(() => localStorage.getItem('access_token'));
  let reusedAuthState = false;

  if (token && process.env.E2E_FORCE_LOGIN !== 'true') {
    try {
      await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 10000 });
      reusedAuthState = true;
    } catch {
      try {
        await page.getByRole('complementary').waitFor({ state: 'visible', timeout: 5000 });
        reusedAuthState = true;
      } catch {
        token = null;
      }
    }
  }

  if (!reusedAuthState) {
    const { username, password } = resolveRealE2ECredentials();
    const login = new LoginPage(page);
    await login.login(username, password);

    try {
      await page.getByTestId('sidebar-container').waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      await page.getByRole('complementary').waitFor({ state: 'visible', timeout: 15000 });
    }
    await page.waitForLoadState('networkidle');

    for (let attempt = 0; attempt < 5; attempt++) {
      token = await page.evaluate(() => localStorage.getItem('access_token'));
      if (token) break;
      await page.waitForTimeout(500);
    }
  }
  await page.waitForLoadState('networkidle');

  if (!token) throw new Error('Setup login failed — no access token in localStorage');

  mkdirSync(dirname(authStatePath), { recursive: true, mode: 0o700 });
  await context.storageState({ path: authStatePath });
  chmodSync(authStatePath, 0o600);
  await browser.close();

  // Provision test data for E2E flows (idempotent)
  const tenantSlug = process.env.E2E_TENANT_SLUG || 'e2e-studio';
  await provisionTestData(token, tenantSlug);

  console.log(
    `[Setup] ${reusedAuthState ? 'Reused' : 'Created'} Playwright auth state at ${authStatePath}`
  );
});
