import type { Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { expect } from '@playwright/test';
import { t } from '@emme/i18n';

export class AuthFlow {
  constructor(private page: Page) {}

  async loginAsOwner(email: string, password: string) {
    const login = new LoginPage(this.page);
    await login.goto();
    await login.goToLoginForm();
    await login.emailInput().fill(email);
    await login.passwordInput().fill(password);
    await login.submitBtn().click();
    const dashboard = new DashboardPage(this.page);
    await expect(dashboard.greeting()).toBeVisible();
  }

  async logout() {
    await this.page.getByText(t('auth.logout')).click();
    const login = new LoginPage(this.page);
    await expect(login.landingEnterBtn()).toBeVisible();
  }
}
