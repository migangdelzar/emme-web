import type { Page } from '@playwright/test';
import { ServicesPage } from '@pages/ServicesPage';
import { expect } from '@playwright/test';

export class ServiceFlow {
  constructor(private page: Page) {}

  async createService(
    name: string,
    price: number,
    durationMinutes: number,
    category: string,
  ) {
    const services = new ServicesPage(this.page);
    // App uses URL param to open add dialog
    await this.page.goto('/#/services?add=true');
    await expect(services.dialog()).toBeVisible({ timeout: 10000 });
    // Fill form fields
    // ... (form interactions depend on actual dialog structure)
  }
}
