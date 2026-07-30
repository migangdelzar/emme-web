import type { Page } from '@playwright/test';
import { ClientsPage } from '@pages/ClientsPage';
import { expect } from '@playwright/test';

export class CustomerFlow {
  constructor(private page: Page) {}

  async registerClient(name: string, email?: string, phone?: string) {
    const clients = new ClientsPage(this.page);
    // App uses URL param to open add dialog
    await this.page.goto('/#/clients?add=true');
    await expect(this.page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    // Fill form fields
    // ... (form interactions depend on actual dialog structure)
    await expect(clients.clientRow(name)).toBeVisible();
  }

  async verifyClientInSidebar(name: string) {
    const clients = new ClientsPage(this.page);
    await clients.goto();
    await expect(clients.clientRow(name)).toBeVisible();
  }
}
