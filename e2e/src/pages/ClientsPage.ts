import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class ClientsPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly header = () => this.page.getByTestId(tid('clients.header'));
  readonly searchInput = () => this.page.getByTestId(tid('clients.search'));
  readonly emptyState = () => this.page.getByTestId(tid('clients.empty'));
  readonly addButton = () => this.page.getByTestId(tid('clients.addButton'));
  readonly dialog = () => this.page.getByTestId(tid('clients.dialog'));
  readonly customerNameInput = () => this.dialog().getByPlaceholder('Ej. Sofia Villarreal');
  readonly customerPhoneInput = () => this.dialog().getByPlaceholder('55 1234 5678');
  readonly continueButton = () => this.dialog().getByRole('button', { name: 'Continuar' });
  readonly finishButton = () => this.dialog().getByRole('button', { name: 'Finalizar' });

  // Fallback: text-based (i18n coverage)
  readonly clientRow = (name: string) => this.page.locator(`text=${name}`).first();
  readonly emptyStateCount = () => this.page.getByText(/0 almas|alma/i);

  async goto() {
    await this.page.goto(PAGE.CLIENTS);
  }

  async createCustomer(name: string, phone: string): Promise<void> {
    await this.page.goto(`${PAGE.CLIENTS}?add=true`);
    await this.dialog().waitFor({ state: 'visible' });
    await this.customerNameInput().fill(name);
    await this.customerPhoneInput().fill(phone);
    await this.continueButton().click();
    await this.finishButton().click();
  }
}
