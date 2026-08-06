import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { LoginPage } from '@pages/LoginPage';

test.describe('Auth', { tag: [Tag.AUTH, Tag.REGRESSION] }, () => {
  test('landing renders and all navigation works', async ({ unauthenticatedPage }) => {
    const page = unauthenticatedPage;
    const login = new LoginPage(page);

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
});
