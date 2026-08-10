import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid } from '@emme/i18n';

export class AppointmentsPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly header = () => this.page.getByTestId(tid('appointments.header')!);
  readonly addButton = () => this.page.getByTestId(tid('appointments.addButton')!);
  readonly dialog = () => this.page.getByTestId(tid('appointments.dialog')!);

  // Fallback: text-based (i18n coverage)
  readonly dateStrip = () =>
    this.page
      .getByRole('button', { name: /\b(lun|mar|mié|jue|vie|sáb|dom)\s+\d+\b/i })
      .first();
  readonly todayAppointmentsSummary = () =>
    this.page.getByText(/\d+\s+citas para hoy/i);
  readonly appointmentCard = (customerName: string) =>
    this.page.getByText(customerName).first();
  readonly dialogByRole = () => this.page.locator('[role="dialog"]');
  readonly dialogServiceLabel = () => this.dialogByRole().getByText('Servicio');
  readonly dialogCloseBtn = () => this.dialogByRole().locator('button').first();
  readonly stepIndicator = (label?: string) => {
    const indicator = this.page.getByTestId(tid('appointments.step01')!);
    const currentStep = this.page.getByText(/Paso\s+0?1/i);
    return label ? indicator.or(this.page.getByText(label)).or(currentStep) : indicator.or(currentStep);
  };
  readonly step1Label = () => this.stepIndicator(t('appointments.step01'));
  readonly step2Label = () => this.stepIndicator(t('appointments.step02'));
  readonly stepQuestion = (q: string) => this.page.getByText(q);
  readonly clientSearchInput = () =>
    this.page.getByPlaceholder('Buscar por nombre o móvil...');
  readonly clientOption = (name: string) =>
    this.page.locator(`text=${name}`).first();
  readonly serviceCategoryChip = (category: string) =>
    this.page.getByText(category);
  readonly serviceCard = (name: string) => this.page.getByText(name);
  readonly formCancelBtn = () =>
    this.page.locator('button svg.lucide-x').first();

  async goto() {
    await this.page.goto(PAGE.AGENDA)
  }

  async gotoNewAppointment() {
    await this.page.goto(PAGE.AGENDA + '?add=true')
  }
}
