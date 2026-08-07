import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class ServicesPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly header = () => this.page.getByTestId(tid('services.header'));
  readonly searchInput = () => this.page.getByTestId(tid('services.search'));
  readonly emptyState = () => this.page.getByTestId(tid('services.empty'));
  readonly addButton = () => this.page.getByTestId(tid('services.addButton'));
  readonly dialog = () => this.page.getByTestId(tid('services.dialog'));

  // Fallback: text-based (i18n coverage)
  readonly activeCountBadge = () =>
    this.page.locator('p').filter({ hasText: 'experiencias premium activas' });
  readonly searchClearBtn = () =>
    this.page.locator('button').filter({ has: this.page.locator('svg.lucide-x') });
  readonly categoryChip = (category: string) =>
    this.page.getByRole('button', { name: category, exact: true });
  readonly serviceCard = (name: string) =>
    this.page.locator('.group').filter({ hasText: name }).first();
  readonly serviceName = (name: string) =>
    this.page.locator('h3').filter({ hasText: name }).first();
  readonly servicePrice = (price: string) =>
    this.page.locator('p').filter({ hasText: `$${price}` });
  readonly editBtn = (serviceCardLocator: ReturnType<Page['locator']>) =>
    serviceCardLocator.getByRole('button', { name: new RegExp('^' + 'Editar ') });
  readonly toggleBtn = (serviceCardLocator: ReturnType<Page['locator']>) =>
    serviceCardLocator.locator('button').filter({ has: this.page.locator('svg.lucide-power') });
  readonly addDialogByRole = () => this.page.locator('[role="dialog"]');
  readonly addDialogHeading = () =>
    this.addDialogByRole().getByRole('heading', { name: /^(Nuevo Servicio|Editar Servicio|Diseñar Tratamiento)$/ });
  readonly serviceNameInput = () =>
    this.addDialogByRole().getByPlaceholder('Ej. Soft Gel Premium');
  readonly priceInput = () =>
    this.addDialogByRole().getByPlaceholder('0').first();
  readonly durationInput = () =>
    this.addDialogByRole()
      .getByPlaceholder('60')
      .or(this.addDialogByRole().getByPlaceholder('0').nth(1));
  readonly descriptionInput = () =>
    this.addDialogByRole().getByPlaceholder('Describe la esencia...');
  readonly categoryBtn = (category: string) =>
    this.addDialogByRole().getByRole('button', { name: category });
  readonly submitBtn = () =>
    this.addDialogByRole().getByRole('button', { name: /^(Inmortalizar|Actualizar)$/ });
  readonly discardBtn = () =>
    this.addDialogByRole().getByRole('button', { name: 'Descartar' });
  readonly emptySearchMsg = () =>
    this.emptyState();
  readonly noServicesMsg = () =>
    this.page.getByText('EL TELÓN ESTÁ CERRADO');
  readonly deleteDialog = () =>
    this.page.locator('[role="alertdialog"]');
  readonly deleteConfirmBtn = () =>
    this.deleteDialog().getByRole('button', { name: 'Confirmar' });
  readonly deleteCancelBtn = () =>
    this.deleteDialog().getByRole('button', { name: t('common.cancel') });
  readonly detailDialog = () =>
    this.page.locator('[role="dialog"]').filter({ hasText: 'Exclusividad Atelier' });
  readonly detailName = () => this.detailDialog().locator('h2');
  readonly detailCategory = () =>
    this.detailDialog()
      .locator('span')
      .filter({ hasText: /^(Manicura|Extensiones|Pedicura|Nail Art|Servicios)$/ });
  readonly detailDuration = () =>
    this.detailDialog().locator('p').filter({ hasText: 'min' });
  readonly detailPrice = () =>
    this.detailDialog().locator('p').filter({ hasText: /^\$/ });
  readonly detailEditBtn = () =>
    this.detailDialog().getByRole('button', { name: 'Editar Tratamiento' });
  readonly detailCloseBtn = () =>
    this.detailDialog().getByRole('button', { name: 'Cerrar' });
  readonly editServiceBtn = () =>
    this.page.getByRole('button', { name: new RegExp('^' + 'Editar ') }).first();
  readonly toggleServiceBtn = () =>
    this.page.locator('button svg.lucide-power').first();
  readonly paginationLabel = () =>
    this.page.locator('.font-display').filter({ hasText: /\/\d/ });
  readonly serviceNameInCard = (name: string) =>
    this.page.locator('h3').filter({ hasText: name });

  async goto() {
    await this.page.goto(PAGE.SERVICES)
  }

  async editService(name: string): Promise<void> {
    await this.serviceCard(name).getByRole('button', { name: `Editar ${name}` }).click();
    await this.addDialogByRole().waitFor({ state: 'visible' });
  }
}
