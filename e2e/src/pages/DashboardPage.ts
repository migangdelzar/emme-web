import type { Page } from '@playwright/test';
import { PAGE } from '@routes/routes';
import { t, tid, findTestId, type ElementKey } from '@emme/i18n';

export class DashboardPage {
  constructor(readonly page: Page) {}

  // Primary: testId
  readonly greeting = () => this.page.getByTestId(tid('dashboard.greeting')!);
  readonly sidebar = () => this.page.getByTestId(tid('sidebar.container')!);
  readonly navItem = (key: string) => {
    const shortKey = (key.split('.').pop() ?? key) as string;
    const navTid = tid(`nav.${shortKey}` as ElementKey);
    return this.page.getByTestId(findTestId(key) ?? navTid ?? key).first();
  };

  readonly incomeCard = () => this.page.getByTestId(tid('dashboard.incomeToday')!);
  readonly confirmedCard = () => this.page.getByTestId(tid('dashboard.confirmedToday')!);
  readonly occupancyCard = () => this.page.getByTestId(tid('dashboard.occupancy')!);
  readonly newClientsCard = () => this.page.getByTestId(tid('dashboard.newClients')!);
  readonly goalCard = () => this.page.getByTestId(tid('dashboard.goalCard')!);
  readonly missionCard = () => this.page.getByTestId(tid('dashboard.missionCard')!);
  readonly agendaSection = () => this.page.getByTestId(tid('dashboard.agenda')!);

  // Fallback: text-based (i18n coverage)
  readonly greetingByText = () => this.page.getByRole('heading', { name: t('dashboard.greeting') });
  readonly goalLabel = () => this.page.getByTestId(tid('dashboard.goalTitle')!);
  readonly goalProgressPercent = () =>
    this.goalCard().locator('span').filter({ hasText: /%/ }).first();
  readonly emptyAgenda = () =>
    this.page
      .getByTestId(tid('dashboard.emptyAgenda')!)
      .or(this.page.getByRole('heading', { name: 'Agenda despejada' }));
  readonly agendaHeading = () =>
    this.page.getByRole('heading', { name: t('appointments.header'), exact: true });
  readonly viewAllBtn = () => this.page.getByRole('button', { name: 'Ver todo' });
  readonly appointmentRow = (clientName: string) => this.agendaSection().getByText(clientName);
  readonly tenantSelector = () => this.page.getByText('Selecciona tu estudio');

  async goto() {
    await this.page.goto(PAGE.DASHBOARD);
  }
}
