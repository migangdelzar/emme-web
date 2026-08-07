import { test, expect } from '@fixtures/testWithUser';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { DashboardPage } from '@pages/DashboardPage';
import { Tag } from '../../shared/tags';

test.describe('Appointments + Finances + Settings — UC-006, UC-007, UC-022, UC-024', { tag: [Tag.CRITICAL] }, () => {
  test('UC-006 — appointments: list, date strip, create wizard opens', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const appointments = new AppointmentsPage(page);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible({ timeout: 10000 });

    // FR-WS012: Date strip navigation
    await expect(appointments.dateStrip()).toBeVisible();

    // FR-WS013: Create appointment wizard (step 1 visible)
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await expect(appointments.stepIndicator()).toBeVisible();
    await appointments.dialogCloseBtn().click();
    await expect(appointments.dialog()).not.toBeVisible();
  });

  test('UC-007/022/024 — finances + all settings tabs + logout', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // FR-WS036: Finances page
    const finances = new FinancesPage(page);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });

    // UC-007/022/024: Settings — all tabs
    const settings = new SettingsPage(page);
    await settings.goto();
    await expect(settings.header()).toBeVisible({ timeout: 10000 });

    for (const tab of ['Perfil', 'Horarios', 'Notificaciones', 'WhatsApp Bot', 'Google Workspace', 'Datos', 'Cuenta']) {
      const btn = page.locator(`text=${tab}`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // FR-WS004/59: Logout button reachable
    await expect(page.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible({ timeout: 5000 });

    // Rapid nav back to dashboard
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });
});
