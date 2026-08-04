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

  test('01-owner-dashboard', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('02-service-lifecycle', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.header()).toBeVisible();
  });

  test('03-customer-appointment', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
    await new AppointmentsPage(authenticatedPage).goto();
  });

  test('04-business-settings', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
  });

  test('05-finances-and-navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/finances');
    await expect(authenticatedPage.getByTestId('finances-header')).toBeVisible();
  });
});
