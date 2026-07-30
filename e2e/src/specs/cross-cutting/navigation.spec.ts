import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { Tag } from '../../shared/tags';

test.describe('Cross-cutting Navigation - Authenticated', { tag: [Tag.NAVIGATION, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
  });

  test('navigate all 6 sections without error', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.navItem('common.appointments').click();
    await expect(new AppointmentsPage(authenticatedPage).header()).toBeVisible();

    await dashboard.navItem('common.finances').click();
    await expect(new FinancesPage(authenticatedPage).header()).toBeVisible();

    await dashboard.navItem('common.clients').click();
    await expect(new ClientsPage(authenticatedPage).header()).toBeVisible();

    await dashboard.navItem('common.services').click();
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible();

    await dashboard.navItem('common.settings').click();
    await expect(new SettingsPage(authenticatedPage).header()).toBeVisible();
  });

  test('rapid navigation no white screen', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.navItem('common.appointments').click();
    await dashboard.navItem('common.dashboard').click();
    await dashboard.navItem('common.clients').click();
    await dashboard.navItem('common.services').click();
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible();
  });
});
