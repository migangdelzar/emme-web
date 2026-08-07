import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { createE2eDataFactory } from '../../shared/factories/e2eDataFactory';
import { makeClient } from '../../shared/factories/clientFactory';
import { makeService } from '../../shared/factories/serviceFactory';
import { Tag } from '../../shared/tags';
import { t } from '@emme/i18n';

test.describe('Owner Lifecycle', { tag: [Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('dashboard renders all sections with tenant branding', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();
    await expect(dashboard.incomeCard()).toBeVisible();
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();
    await expect(dashboard.goalCard()).toBeVisible();
    await expect(dashboard.emptyAgenda()).toBeVisible();
    await expect(authenticatedPage.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();
  });

  test('services and customers CRUD through UI and API', async ({ authenticatedPage, provider }) => {
    // Seed services
    await provider.seed({
      services: [
        { id: 's1', name: 'Manicure Clasica', category: 'Manicura y Cuidado Natural', duration: 45, price: 350, isActive: true },
        { id: 's2', name: 'Manicure Rusa', category: 'Manicura y Cuidado Natural', duration: 90, price: 750, isActive: true },
        { id: 's3', name: 'Soft Gel Premium', category: 'Extensiones y Estructura', duration: 120, price: 1200, isActive: true },
      ],
      customers: [
        { id: 'c1', name: 'Valeria Arriaza', phone: '555-0101' },
        { id: 'c2', name: 'Elena Garcia', phone: '555-0102' },
      ],
    });

    // Services catalog + search + filter
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.header()).toBeVisible();
    await expect(services.activeCountBadge()).toBeVisible();
    await services.searchInput().fill('Rusa');
    await authenticatedPage.waitForTimeout(500);
    await expect(services.serviceName('Manicure Rusa').first()).toBeVisible();
    await services.searchInput().fill('');
    await authenticatedPage.waitForTimeout(500);

    // Service detail dialog
    await services.serviceName('Manicure Rusa').first().click();
    await expect(services.detailDialog()).toBeVisible();
    await expect(services.detailName()).toContainText('Manicure Rusa');
    await services.detailCloseBtn().click();
    await expect(services.detailDialog()).not.toBeVisible();

    // Customers list
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
    await expect(clients.clientRow('Valeria Arriaza')).toBeVisible();
    await expect(clients.clientRow('Elena Garcia')).toBeVisible();

    // Customer search → empty
    await clients.searchInput().fill('zzz-non-existent');
    await expect(clients.emptyState()).toBeVisible();

    // Add dialogs open via URL params
    await authenticatedPage.goto('/#/clients?add=true');
    await expect(clients.dialog()).toBeVisible();
    await authenticatedPage.goto('/#/services?add=true');
    await expect(services.dialog()).toBeVisible();

    // API seed → UI verify
    const apiName = `API-Client-${Date.now().toString(36)}`;
    await provider.seed({ customers: [makeClient({ name: apiName, phone: '555-9999', email: `${apiName}@test.com` })] });
    await clients.goto();
    await expect(clients.header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(apiName).first()).toBeVisible({ timeout: 8000 });

    const apiSvc = `API-Svc-${Date.now().toString(36)}`;
    await provider.seed({ services: [makeService({ name: apiSvc, price: 999, duration: 30, category: 'Test' })] });
    await services.goto();
    await expect(services.header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(apiSvc).first()).toBeVisible({ timeout: 8000 });
  });

  test('appointments, finances, settings, and navigation', async ({ authenticatedPage, provider }) => {
    const today = new Date().toISOString().split('T')[0];
    await provider.seed({
      customers: [{ id: 'ac1', name: 'Elena Garcia', phone: '555-0101' }],
      services: [{ id: 'as1', name: 'Manicure Rusa', category: 'Manicura', duration: 90, price: 750, isActive: true }],
      appointments: [{ id: 'apt-1', clientId: 'ac1', serviceId: 'as1', date: today, startTime: '10:00', endTime: '11:00', status: 'confirmed' as const }],
    });

    // Appointments
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible({ timeout: 10000 });
    await expect(appointments.dateStrip()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await appointments.dialogCloseBtn().click();
    await expect(appointments.dialog()).not.toBeVisible();

    // Finances
    const finances = new FinancesPage(authenticatedPage);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });

    // Settings
    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();
    await expect(settings.header()).toBeVisible({ timeout: 10000 });

    // Navigation — rapid nav back to dashboard
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });
});
