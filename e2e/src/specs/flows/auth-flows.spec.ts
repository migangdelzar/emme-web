import { test, expect } from '@fixtures/testWithUser';
import { t } from '@emme/i18n';
import { Tag } from '../../shared/tags';
import { LoginPage } from '@pages/LoginPage';

test.describe('Auth — UC-001', { tag: [Tag.AUTH, Tag.REGRESSION] }, () => {
  test('landing renders and auth forms navigate correctly', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);

    await login.goto();
    await expect(login.landingBtn()).toBeVisible();
    await expect(login.landingRegisterBtn()).toBeVisible();
    await expect(login.poweredBy()).toBeVisible();

    await login.goToLoginForm();
    await expect(login.emailInput()).toBeVisible();
    await expect(login.passwordInput()).toBeVisible();
    await expect(login.submitBtn()).toBeVisible();

    await login.goto();
    await login.goToRegisterForm();
    await expect(login.emailInput()).toBeVisible();
    await expect(login.passwordInput()).toBeVisible();
    await expect(login.registerSubmitBtn()).toBeVisible();
    await expect(login.backBtn()).toBeVisible();

    await login.backBtn().click();
    await expect(login.landingBtn()).toBeVisible();
  });

  test('Keycloak login form appears for unauthenticated users', async ({ page }) => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires Keycloak + backend');

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: t('landing.enter') }).click();
    await expect(page.getByPlaceholder(/email|usuario/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: t('auth.submit') })).toBeVisible();
  });
});
