import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { Tag } from '../../shared/tags';

test.describe('Real tenant-owner demo recordings', { tag: [Tag.DEMO, Tag.CRITICAL] }, () => {
  test.beforeEach(() => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only recording suite');
  });

  test.describe.configure({ mode: 'serial' });

  test('01-dashboard-and-kpis', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();
    await expect(dashboard.incomeCard()).toBeVisible();
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();
    await expect(dashboard.goalCard()).toBeVisible();
    await expect(dashboard.agendaSection()).toBeVisible();
  });

  test('02-navigation-all-sections', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    for (const key of ['common.services', 'common.clients', 'common.appointments', 'common.finances']) {
      await dashboard.navItem(key).click();
      await authenticatedPage.waitForTimeout(500);
    }
    await dashboard.navItem('common.settings').click();
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
    await dashboard.navItem('common.dashboard').click();
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('03-service-catalog-create', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.header()).toBeVisible();
    await services.addButton().click();
    await expect(services.dialog()).toBeVisible();
    await services.serviceNameInput().fill('Real Test Service');
    await services.priceInput().fill('500');
    await services.discardBtn().click();
  });

  test('04-client-crm', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
    await expect(clients.searchInput()).toBeVisible();
    await clients.addButton().click();
    await expect(clients.dialog()).toBeVisible();
    await clients.customerNameInput().fill('Real Test Client');
    await clients.dialog().getByRole('button', { name: /cancelar|cancel/i }).click();
  });

  test('05-appointment-views', async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible();
    await expect(appointments.dateStrip()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await appointments.dialogCloseBtn().click();
  });

  test('06-finances', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/finances');
    await expect(authenticatedPage.getByTestId('finances-header')).toBeVisible();
  });

  test('07-settings-business-profile', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
    const tab = authenticatedPage.locator('text=Perfil');
    if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await tab.click();
      await authenticatedPage.waitForTimeout(400);
    }
  });

  test('08-settings-hours-and-notifications', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    for (const tab of ['Horarios', 'Notificaciones', 'WhatsApp Bot', 'Promociones']) {
      const btn = authenticatedPage.getByRole('button', { name: tab }).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await authenticatedPage.waitForTimeout(400);
      }
    }
  });

  test('09-settings-google-and-appearance', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    for (const tab of ['Google Workspace', 'Apariencia', 'Idioma']) {
      const btn = authenticatedPage.getByRole('button', { name: tab }).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await authenticatedPage.waitForTimeout(400);
      }
    }
  });

  test('10-settings-data-and-security', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    for (const tab of ['Datos', 'Seguridad']) {
      const btn = authenticatedPage.getByRole('button', { name: tab }).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await authenticatedPage.waitForTimeout(400);
      }
    }
    await expect(authenticatedPage.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible();
  });
});
