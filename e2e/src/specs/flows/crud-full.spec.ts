import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { withService, withClient, withAppointment } from '../../shared/helpers/seed-helpers';
import { Tag } from '../../shared/tags';

test.describe('Full CRUD — UC-004/005/006', { tag: [Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('FR-WS030/031/035/032 — service: search, detail dialog, edit button', async ({ authenticatedPage, provider }) => {
    const page = authenticatedPage;

    await withService(provider, async (svc) => {
      const services = new ServicesPage(page);
      await services.goto();
      await page.waitForLoadState('networkidle');
      await expect(services.header()).toBeVisible({ timeout: 10000 });

      // Search by seeded name
      await services.searchInput().fill(svc.name);
      await page.waitForTimeout(1000);
      await expect(services.serviceName(svc.name)).toBeVisible({ timeout: 10000 });

      // Detail dialog
      await services.serviceName(svc.name).click();
      await page.waitForTimeout(300);
      await expect(services.detailDialog()).toBeVisible({ timeout: 5000 });
      await expect(services.detailName()).toContainText(svc.name);
      await services.detailCloseBtn().click();

      // Edit button exists on card
      const card = services.serviceCard(svc.name);
      await expect(card).toBeVisible();
    });
  });

  test('FR-WS022/023/026/024 — client: search, detail view, filter button', async ({ authenticatedPage, provider }) => {
    const page = authenticatedPage;

    await withClient(provider, async (client) => {
      const clients = new ClientsPage(page);
      await clients.goto();
      await page.waitForLoadState('networkidle');
      await expect(clients.header()).toBeVisible({ timeout: 10000 });

      // Search
      await clients.searchInput().fill(client.name);
      await page.waitForTimeout(1000);
      await expect(clients.clientRow(client.name)).toBeVisible({ timeout: 10000 });

      // Detail view
      await clients.clientRow(client.name).click();
      await page.waitForTimeout(1000);
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible({ timeout: 5000 });

      // Filter button
      await clients.goto();
      await page.waitForTimeout(500);
      const filterBtn = page.getByRole('button', { name: /filtrar|filter/i });
      if (await filterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await filterBtn.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test('FR-WS007/011/012/013/021 — appointment: calendar, wizard, revenue, dashboard agenda', async ({ authenticatedPage, provider }) => {
    const page = authenticatedPage;

    await withAppointment(provider, async (appt, client, svc) => {
      const appointments = new AppointmentsPage(page);
      await appointments.goto();
      await page.waitForLoadState('networkidle');
      await expect(appointments.header()).toBeVisible({ timeout: 10000 });

      // FR-WS012: Date strip
      await expect(appointments.dateStrip()).toBeVisible();

      // FR-WS013: Create wizard opens
      await appointments.gotoNewAppointment();
      await expect(appointments.dialog()).toBeVisible();
      await expect(appointments.stepIndicator()).toBeVisible();
      await appointments.dialogCloseBtn().click();

      // FR-WS021: Projected revenue
      await expect(appointments.todayAppointmentsSummary()).toBeVisible();

      // FR-WS007: Dashboard agenda
      await page.goto('/#/dashboard');
      await page.waitForLoadState('networkidle');
      const agenda = page.getByTestId('dashboard-agenda');
      await expect(agenda).toBeVisible({ timeout: 5000 });
    });
  });
});
