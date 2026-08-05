import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class SettingsPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly header = () => this.page.getByTestId(tid('settings.header')!);
  readonly tabs = () => this.page.getByTestId(tid('settings.tabs')!);

  // Fallback: text-based (i18n coverage)
  readonly profileSection = () => this.page.locator('text=Perfil');

  async goto() {
    await this.page.goto(PAGE.SETTINGS)
  }
}
