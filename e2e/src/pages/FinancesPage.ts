import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class FinancesPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly header = () => this.page.getByTestId(tid('finances.header')!);

  // Fallback: text-based (i18n coverage)
  readonly revenueContent = () => this.page.locator(`text=${t('finances.currency')}`);

  async goto() {
    await this.page.goto(PAGE.FINANCES);
  }
}
