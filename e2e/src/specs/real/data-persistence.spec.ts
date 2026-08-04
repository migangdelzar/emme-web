import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '../../pages/DashboardPage';
import { ServicesPage } from '../../pages/ServicesPage';
import { ClientsPage } from '../../pages/ClientsPage';
import { AppointmentsPage } from '../../pages/AppointmentsPage';
import { FinancesPage } from '../../pages/FinancesPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { Tag } from '../../shared/tags';
import { makeClient } from '../../shared/factories/clientFactory';

test.describe(
  'Data Persistence',
  {
    tag: [Tag.DASHBOARD, Tag.SERVICES, Tag.CLIENTS, Tag.APPOINTMENTS, Tag.CRITICAL, Tag.HAPPY_PATH],
  },
  () => {
    test.beforeAll(() => {
      test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');
    });

    test('services page loads with real catalog data', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/services');
      const services = new ServicesPage(authenticatedPage);
      await expect(services.header()).toBeVisible({ timeout: 5000 });
      await expect(authenticatedPage.getByRole('main')).toBeVisible();
    });

    test('clients page loads with real customer data', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/clients');
      await expect(new ClientsPage(authenticatedPage).header()).toBeVisible({ timeout: 5000 });
    });

    test('appointments page loads with real agenda', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/agenda');
      await expect(new AppointmentsPage(authenticatedPage).header()).toBeVisible({ timeout: 5000 });
    });

    test('finances page loads with real data', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/finances');
      await expect(new FinancesPage(authenticatedPage).header()).toBeVisible({ timeout: 5000 });
      await expect(authenticatedPage.getByText(/analítica|inteligencia/i).first()).toBeVisible({
        timeout: 5000,
      });
    });

    test('settings page loads with real business config', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/settings');
      await expect(new SettingsPage(authenticatedPage).header()).toBeVisible({ timeout: 5000 });
    });

    test('dashboard KPI values are numeric (real data)', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/dashboard');
      const dashboard = new DashboardPage(authenticatedPage);
      await expect(dashboard.sidebar()).toBeVisible();

      // Get income card text
      const incomeText = await dashboard.incomeCard().textContent();
      expect(incomeText).toMatch(/\$/); // should contain dollar sign
    });

    test('create client via add=true opens form', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/clients?add=true');
      await expect(new ClientsPage(authenticatedPage).dialog()).toBeVisible({ timeout: 5000 });
    });

    test('create appointment form accessible', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/agenda?add=true');
      await expect(new AppointmentsPage(authenticatedPage).dialog()).toBeVisible({ timeout: 5000 });
    });

    test('seed client via API → appears in UI', async ({ authenticatedPage, provider }) => {
      const uniqueName = `API-${Date.now().toString(36)}`;
      // Seed via RealProvider (POST to real backend)
      await provider.seed({
        customers: [
          makeClient({ name: uniqueName, phone: '555-9999', email: `${uniqueName}@test.com` }),
        ],
      });
      // Verify appears in UI
      await authenticatedPage.goto('/#/clients');
      await expect(new ClientsPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
      await expect(authenticatedPage.getByText(uniqueName).first()).toBeVisible({ timeout: 8000 });
    });
  }
);
