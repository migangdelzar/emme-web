import { test, expect } from '@fixtures/testWithUser';
import { LoginPage } from '@pages/LoginPage';
import { Tag } from '../../shared/tags';

test.describe('Auth', { tag: [Tag.AUTH, Tag.REGRESSION] }, () => {
  test('landing page shows CTAs', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await expect(login.landingBtn()).toBeVisible();
    await expect(login.landingRegisterBtn()).toBeVisible();
    await expect(login.poweredBy()).toBeVisible();
  });

  test('login form renders correctly', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await login.goToLoginForm();
    await expect(login.emailInput()).toBeVisible();
    await expect(login.passwordInput()).toBeVisible();
    await expect(login.submitBtn()).toBeVisible();
  });

  test('register form renders correctly', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await login.goToRegisterForm();
    await expect(login.emailInput()).toBeVisible();
    await expect(login.passwordInput()).toBeVisible();
    await expect(login.registerSubmitBtn()).toBeVisible();
    await expect(login.backBtn()).toBeVisible();
  });

  test('back button returns to landing', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await login.goToRegisterForm();
    await login.backBtn().click();
    await expect(login.landingBtn()).toBeVisible();
  });
});
