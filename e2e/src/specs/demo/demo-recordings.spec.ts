import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { LoginPage } from '@pages/LoginPage';
import { Tag } from '../../shared/tags';

test.describe('Demo recordings', { tag: [Tag.DEMO, Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('01-landing-and-login', async ({ unauthenticatedPage }) => {
    const login = new LoginPage(unauthenticatedPage);
    await login.goto();
    await unauthenticatedPage.waitForTimeout(2000);
    // Use testId-based landing button, fall back to role-based
    const landingBtn = unauthenticatedPage.getByTestId('auth-landing').or(
      unauthenticatedPage.getByRole('button', { name: /Ingresar|entrar|enter|ingresar/i })
    );
    await expect(landingBtn.first()).toBeVisible({ timeout: 10000 });
    await login.goToLoginForm();
    await expect(login.emailInput()).toBeVisible({ timeout: 10000 });
    await expect(login.passwordInput()).toBeVisible({ timeout: 10000 });
  });

  test('02-dashboard-overview', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toBeVisible();
    await expect(dashboard.agendaSection()).toBeVisible();
  });

  test('03-navigation-all-sections', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await authenticatedPage.waitForLoadState('networkidle');

    await dashboard.navItem('common.services').click();
    await authenticatedPage.waitForTimeout(500);

    await dashboard.navItem('common.clients').click();
    await authenticatedPage.waitForTimeout(500);

    await dashboard.navItem('common.dashboard').click();
    await authenticatedPage.waitForTimeout(500);
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('04-service-catalog', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await authenticatedPage.waitForTimeout(800);
    await expect(services.header()).toBeVisible();
  });

  test('05-client-crm', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await authenticatedPage.waitForTimeout(800);
    await expect(clients.header()).toBeVisible();
  });

  test('06-appointment-views', async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await authenticatedPage.waitForTimeout(1000);
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await appointments.dialogCloseBtn().click();
    await expect(appointments.dialog()).not.toBeVisible();
  });

  test('07-finances-overview', async ({ authenticatedPage }) => {
    const finances = new FinancesPage(authenticatedPage);
    await finances.goto();
    await authenticatedPage.waitForTimeout(1000);
    await expect(finances.header()).toBeVisible();
  });

  test('08-settings-and-tabs', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByTestId('settings-header')).toBeVisible();
    for (const tab of ['Perfil', 'Horarios', 'Notificaciones', 'WhatsApp Bot', 'Promociones', 'Google Workspace']) {
      const btn = authenticatedPage.locator(`text=${tab}`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await authenticatedPage.waitForTimeout(300);
      }
    }
  });

  test('09-settings-appearance-language', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await authenticatedPage.waitForTimeout(1000);
    for (const tab of ['Apariencia', 'Idioma', 'Datos']) {
      const btn = authenticatedPage.locator(`text=${tab}`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await authenticatedPage.waitForTimeout(300);
      }
    }
  });

  test('10-security-logout', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/settings');
    await authenticatedPage.waitForTimeout(1000);
    const securityBtn = authenticatedPage.locator('text=Seguridad').first();
    if (await securityBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await securityBtn.click();
      await authenticatedPage.waitForTimeout(400);
    }
    await expect(authenticatedPage.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible({ timeout: 8000 });
  });
});
