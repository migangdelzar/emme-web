import type { Page } from '@playwright/test';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { DashboardPage } from '@pages/DashboardPage';
import { expect } from '@playwright/test';
import { t } from '@emme/i18n';

export class AppointmentFlow {
  constructor(private page: Page) {}

  async createAppointment(clientName: string, serviceName: string) {
    const appointments = new AppointmentsPage(this.page);
    // App uses URL param ?add=true for new appointment flow
    await appointments.gotoNewAppointment();
    await expect(appointments.stepIndicator(t('appointments.step01'))).toBeVisible({ timeout: 5000 });
    // Flow continues based on actual form steps
    // ... select client, select service, confirm
  }

  async verifyAppointmentInDashboard(clientName: string) {
    const dashboard = new DashboardPage(this.page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible({ timeout: 5000 });
    await expect(dashboard.appointmentRow(clientName)).toBeVisible();
  }
}
