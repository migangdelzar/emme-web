import type { Page } from '@playwright/test';
import { DashboardPage } from '@pages/DashboardPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { ClientsPage } from '@pages/ClientsPage';
import { ServicesPage } from '@pages/ServicesPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { expect } from '@playwright/test';
import { t } from '@emme/i18n';

export class NavigationFlow {
  constructor(private page: Page) {}

  async navigateAllSections() {
    const dashboard = new DashboardPage(this.page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible({ timeout: 10000 });

    await dashboard.navItem(t('common.appointments')).click();
    await expect(new AppointmentsPage(this.page).header()).toBeVisible();

    await dashboard.navItem(t('common.clients')).click();
    await expect(new ClientsPage(this.page).header()).toBeVisible();

    await dashboard.navItem(t('common.services')).click();
    await expect(new ServicesPage(this.page).header()).toBeVisible();

    await dashboard.navItem(t('common.finances')).click();
    await expect(new FinancesPage(this.page).header()).toBeVisible();

    await dashboard.navItem(t('common.settings')).click();
    await expect(new SettingsPage(this.page).header()).toBeVisible();
  }
}
