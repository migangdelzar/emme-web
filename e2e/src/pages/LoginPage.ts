import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class LoginPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly emailInput = () => this.page.getByTestId(tid('auth.emailInput')!);
  readonly passwordInput = () => this.page.getByTestId(tid('auth.passwordInput')!);
  readonly submitBtn = () => this.page.getByTestId(tid('auth.submitBtn')!);
  readonly landingBtn = () => this.page.getByTestId(tid('auth.landingBtn')!);

  // Fallback: text-based (i18n coverage)
  readonly heading = () => this.page.locator('h1');
  readonly landingEnterBtn = () => this.page.getByRole('button', { name: t('landing.enter') });
  readonly landingRegisterBtn = () => this.page.getByRole('button', { name: t('landing.register') });
  readonly registerSubmitBtn = () => this.page.getByRole('button', { name: t('auth.register') });
  readonly backBtn = () => this.page.getByRole('button', { name: t('common.back') });
  readonly poweredBy = () => this.page.getByText(t('auth.poweredBy'));

  async goto() {
    await this.page.goto(PAGE.LANDING);
  }

  async goToLoginForm() {
    await this.landingEnterBtn().click();
  }

  async goToRegisterForm() {
    await this.landingRegisterBtn().click();
  }

  async login(email: string, password: string) {
    await this.goToLoginForm();
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitBtn().click();
  }
}
