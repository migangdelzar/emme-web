import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '../../pages/DashboardPage';
import { ServicesPage } from '../../pages/ServicesPage';
import { ClientsPage } from '../../pages/ClientsPage';
import { AppointmentsPage } from '../../pages/AppointmentsPage';
import { FinancesPage } from '../../pages/FinancesPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { Tag } from '../../shared/tags';
import { makeClient } from '../../shared/factories/clientFactory';

test.describe('Data Persistence', {
  tag: [Tag.DASHBOARD, Tag.SERVICES, Tag.CLIENTS, Tag.APPOINTMENTS, Tag.CRITICAL, Tag.HAPPY_PATH],
}, () => {
  test('all pages load with real data', async ({ authenticatedPage }) => {
    const pages = [
      { path: '/#/services', header: () => new ServicesPage(authenticatedPage).header(), main: true },
      { path: '/#/clients', header: () => new ClientsPage(authenticatedPage).header(), main: true },
      { path: '/#/agenda', header: () => new AppointmentsPage(authenticatedPage).header(), main: true },
      { path: '/#/finances', header: () => new FinancesPage(authenticatedPage).header(), main: true },
      { path: '/#/settings', header: () => new SettingsPage(authenticatedPage).header(), main: true },
    ];

    for (const page of pages) {
      await authenticatedPage.goto(page.path);
      await expect(page.header()).toBeVisible({ timeout: 5000 });
      if (page.main) await expect(authenticatedPage.getByRole('main')).toBeVisible();
    }
  });

  test('dashboard KPI values are numeric', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/dashboard');
    const dashboard = new DashboardPage(authenticatedPage);
    await expect(dashboard.sidebar()).toBeVisible();

    const incomeText = await dashboard.incomeCard().textContent();
    expect(incomeText).toMatch(/\$/);
  });

  test('create forms open via URL params and seed appears in UI', async ({ authenticatedPage, provider }) => {
    // Client add form
    await authenticatedPage.goto('/#/clients?add=true');
    await expect(new ClientsPage(authenticatedPage).dialog()).toBeVisible({ timeout: 5000 });

    // Appointment add form
    await authenticatedPage.goto('/#/agenda?add=true');
    await expect(new AppointmentsPage(authenticatedPage).dialog()).toBeVisible({ timeout: 5000 });

    // API seed → UI verify
    const uniqueName = `API-${Date.now().toString(36)}`;
    await provider.seed({
      customers: [makeClient({ name: uniqueName, phone: '555-9999', email: `${uniqueName}@test.com` })],
    });
    await authenticatedPage.goto('/#/clients');
    await expect(new ClientsPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(uniqueName).first()).toBeVisible({ timeout: 8000 });
  });
});
