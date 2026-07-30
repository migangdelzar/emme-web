import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Real UI test fixture — authenticates via BFF OAuth2 flow
 * and runs UI tests against the real backend.
 */

const KEYCLOAK_URL = 'http://localhost:18080';

/**
 * Authenticate by navigating through the OAuth2 BFF flow:
 * Vite proxy → backend → Keycloak → session cookie → dashboard.
 */
async function realLogin(page: Page) {
  // Go through the BFF OAuth2 flow
  await page.goto('http://localhost:3000/oauth2/authorization/keycloak');

  // Should redirect to Keycloak login
  await page.waitForTimeout(3000);

  // If on Keycloak page, fill login form
  if (page.url().includes('protocol/openid-connect/auth')) {
    await page.getByRole('textbox', { name: /Username|usuario/i }).fill(
      process.env.E2E_KEYCLOAK_USERNAME || 'owner'
    );
    await page.getByRole('textbox', { name: 'Password' }).fill(
      process.env.E2E_KEYCLOAK_PASSWORD || 'owner123'
    );
    await page.getByRole('button', { name: 'Sign In' }).click();
  }

  // Wait for redirect back to dashboard via backend callback
  await page.waitForURL(/#\/dashboard/, { timeout: 20000 });
  await page.waitForTimeout(1000);
}

/**
 * Real UI test fixture — extends base test with realLogin.
 */
export const test = base.extend<{ realLogin: () => Promise<void> }>({
  realLogin: async ({ page }, use) => {
    await use(async () => realLogin(page));
  },
});

export { expect };
