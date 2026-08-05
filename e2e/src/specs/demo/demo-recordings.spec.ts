import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { LoginPage } from '@pages/LoginPage';
import { Tag } from '../../shared/tags';

test.describe('Demo recordings', { tag: [Tag.DEMO, Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('01-landing-and-login', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await expect(login.landingEnterBtn()).toBeVisible();
    await expect(login.landingRegisterBtn()).toBeVisible();
    await login.goToLoginForm();
    await expect(login.emailInput()).toBeVisible();
    await expect(login.passwordInput()).toBeVisible();
  });

  test('02-dashboard-and-navigation', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();

    // Navigate to each section
    await dashboard.navItem('common.services').click();
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible();
    await dashboard.navItem('common.clients').click();
    await expect(new ClientsPage(authenticatedPage).header()).toBeVisible();
    await dashboard.navItem('common.appointments').click();
    await expect(new AppointmentsPage(authenticatedPage).header()).toBeVisible();
    await dashboard.navItem('common.dashboard').click();
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('03-service-catalog-search', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.header()).toBeVisible();
    await expect(services.serviceName('Manicure Clásica')).toBeVisible();
    await services.searchInput().fill('Manicure');
    await expect(services.serviceName('Manicure Clásica')).toBeVisible();
  });

  test('04-client-list', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
    await expect(clients.searchInput()).toBeVisible();
  });

  test('05-appointment-entry-point', async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await expect(appointments.stepIndicator()).toBeVisible();
    await appointments.dialogCloseBtn().click();
  });

  test('06-settings-and-finances', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.navItem('common.finances').click();
    await expect(authenticatedPage.getByTestId('finances-header')).toBeVisible();
    await dashboard.navItem('common.settings').click();
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
  });

  test('07-settings-security-logout', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
    const securityBtn = authenticatedPage.locator('text=Seguridad');
    if (await securityBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await securityBtn.click();
      await authenticatedPage.waitForTimeout(500);
    }
    await expect(authenticatedPage.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible();
  });
});
