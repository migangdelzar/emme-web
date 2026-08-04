import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '../../pages/DashboardPage';
import { Tag } from '../../shared/tags';

test.describe('OAuth2 Login Flow', { tag: [Tag.AUTH, Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test.beforeAll(() => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires Keycloak + backend');
  });

  test('landing page shows login button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /ingresar|Iniciar/i })).toBeVisible();
  });

  test('login redirects to Keycloak', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /ingresar|Iniciar/i }).click();
    // App uses BFF login form (its own "Bienvenida." form)
    await expect(page.getByPlaceholder(/email|usuario/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Iniciar|Ingresar/i })).toBeVisible();
  });

  test('dashboard loads after successful login', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    // authenticatedPage fixture already completed OAuth2 login in real mode
    await page.goto('/#/dashboard');
    const dashboard = new DashboardPage(page);
    await expect(dashboard.sidebar()).toBeVisible();
  });
});
