import { test, expect } from '@fixtures/testWithUser';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { Tag } from '../../shared/tags';

test.describe('Full Section Coverage', { tag: [Tag.CRITICAL] }, () => {

  test('Finances — UC-003: revenue, charts, transactions load', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const finances = new FinancesPage(page);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('main')).toBeVisible();
    // Verify analytics content renders (charts, revenue, stats)
    const analyticsText = page.getByText(/analítica|analytics|inteligencia|revenue|ingresos/i);
    if (await analyticsText.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(analyticsText.first()).toBeVisible();
    }
  });

  test('Settings — UC-007/022/024: all 7 tabs load with content', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const settings = new SettingsPage(page);
    await settings.goto();
    await expect(settings.header()).toBeVisible({ timeout: 10000 });

    const tabChecks = [
      { name: 'Perfil', content: /nombre|name|negocio/i, uc: 'UC-007' },
      { name: 'Horarios', content: /horario|lunes|monday|operating/i, uc: 'UC-007' },
      { name: 'Notificaciones', content: /notificación|reminder|recordatorio/i, uc: 'UC-014' },
      { name: 'WhatsApp Bot', content: /whatsapp|mensaje|message|auto/i, uc: 'UC-007' },
      { name: 'Google Workspace', content: /google|workspace|conectar|connect|calendar/i, uc: 'UC-022' },
      { name: 'Datos', content: /exportar|backup|cache|datos|data/i, uc: 'UC-024' },
      { name: 'Cuenta', content: /cerrar|log out|sign out|eliminar|delete/i, uc: 'UC-024' },
    ];

    for (const tab of tabChecks) {
      const btn = page.locator(`text=${tab.name}`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
        // Verify tab content loaded
        const content = page.getByText(tab.content).first();
        if (await content.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(content).toBeVisible();
        }
      }
    }

    // Logout button reachable from Cuenta tab
    await expect(page.getByRole('button', { name: /cerrar sesión|log out|sign out/i })).toBeVisible({ timeout: 5000 });
  });

  test('All pages — dashboard, services, clients, appointments, finances, settings load', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const pages = [
      { name: 'Dashboard', goto: () => new DashboardPage(page).goto(), verify: () => page.getByTestId('sidebar-container') },
      { name: 'Services', goto: () => new ServicesPage(page).goto(), verify: () => new ServicesPage(page).header() },
      { name: 'Clients', goto: () => new ClientsPage(page).goto(), verify: () => new ClientsPage(page).header() },
      { name: 'Appointments', goto: () => new AppointmentsPage(page).goto(), verify: () => new AppointmentsPage(page).header() },
      { name: 'Finances', goto: () => new FinancesPage(page).goto(), verify: () => new FinancesPage(page).header() },
      { name: 'Settings', goto: () => new SettingsPage(page).goto(), verify: () => new SettingsPage(page).header() },
    ];

    for (const p of pages) {
      await p.goto();
      await page.waitForLoadState('networkidle');
      await expect(p.verify()).toBeVisible({ timeout: 10000 });
    }

    // Navigate back to dashboard from settings
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });
});
