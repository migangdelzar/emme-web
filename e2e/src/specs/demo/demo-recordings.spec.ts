import { test, expect } from '@fixtures/testWithUser';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { Tag } from '../../shared/tags';

test.describe('Demo recordings', { tag: [Tag.DEMO, Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('01-landing-and-login-entry', async ({ unauthenticatedPage }) => {
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
    await expect(dashboard.greeting()).toBeVisible();
    await expect(dashboard.sidebar()).toBeVisible();
    await dashboard.navItem('common.services').click();
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible();
    await dashboard.navItem('common.clients').click();
    await expect(new ClientsPage(authenticatedPage).header()).toBeVisible();
    await dashboard.navItem('common.appointments').click();
    await expect(new AppointmentsPage(authenticatedPage).header()).toBeVisible();
  });

  test('03-service-catalog-search', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);

    await services.goto();
    await expect(services.header()).toBeVisible();
    await expect(services.serviceName('Manicure Clásica')).toBeVisible();
    await services.searchInput().fill('Manicure');
    await expect(services.serviceName('Manicure Clásica')).toBeVisible();
  });

  test('04-customer-and-appointment-entry-points', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    const appointments = new AppointmentsPage(authenticatedPage);

    await clients.goto();
    await expect(clients.header()).toBeVisible();
    await authenticatedPage.goto('/#/clients?add=true');
    await expect(clients.dialog()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
  });
});
