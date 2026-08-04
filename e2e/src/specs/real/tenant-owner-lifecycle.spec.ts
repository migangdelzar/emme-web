import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { createE2eDataFactory } from '../../shared/factories/e2eDataFactory';
import { Tag } from '../../shared/tags';

test.describe('Real tenant-owner lifecycle', { tag: [Tag.REAL, Tag.CRITICAL] }, () => {
  test.beforeEach(() => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires the full stack and owner credentials');
  });

  test.describe.configure({ mode: 'serial' });

  test('owner reaches dashboard with tenant context', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('owner can read and update a tenant service', async ({ authenticatedPage, provider }) => {
    const factory = createE2eDataFactory(`service-${Date.now()}`);
    const service = factory.service();
    await provider.seed({ services: [{ id: 'source-service', ...service, isActive: true }] });

    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.serviceName(service.name)).toBeVisible();
    await services.editService(service.name);
    await services.serviceNameInput().fill(`${service.name} Updated`);
    await services.submitBtn().click();
    await expect(services.serviceName(`${service.name} Updated`)).toBeVisible();
  });

  test('owner can read customers and open appointment creation', async ({ authenticatedPage, provider }) => {
    const factory = createE2eDataFactory(`appointment-${Date.now()}`);
    const customer = factory.customer();
    const service = factory.service();
    await provider.seed({
      customers: [{ id: 'source-customer', ...customer }],
      services: [{ id: 'source-service', ...service, isActive: true }],
    });

    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.clientRow(customer.name)).toBeVisible();

    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
  });

  test('owner can open finance and business settings sections', async ({ authenticatedPage }) => {
    const finances = new FinancesPage(authenticatedPage);
    await finances.goto();
    await expect(finances.header()).toBeVisible();

    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();
    await expect(settings.header()).toBeVisible();
  });
});
