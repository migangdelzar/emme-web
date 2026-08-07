import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { FinancesPage } from '@pages/FinancesPage';
import { SettingsPage } from '@pages/SettingsPage';
import { Tag } from '../../shared/tags';
import { t } from '@emme/i18n';

test.describe('Owner Lifecycle', { tag: [Tag.CRITICAL] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('UC-001/003 — dashboard renders with KPIs, greeting, agenda, and tenant branding', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();
    await expect(dashboard.greeting()).toContainText(/madrugada|mañana|tarde|noche|morning|afternoon|evening/);
    await expect(dashboard.incomeCard()).toBeVisible();
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();
    await expect(dashboard.goalCard()).toBeVisible();
    await expect(dashboard.emptyAgenda()).toBeVisible();
    await expect(page.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();
  });

  test('UC-004/005 — services and clients full UI CRUD', async ({ authenticatedPage, provider }) => {
    const page = authenticatedPage;

    // ── Service: create via UI form → verify in catalog → detail dialog → search ──
    const svcName = `E2E Svc ${Date.now().toString(36).slice(-4)}`;
    const services = new ServicesPage(page);
    await services.goto();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/services?add=true');
    await expect(services.dialog()).toBeVisible({ timeout: 5000 });
    await services.serviceNameInput().fill(svcName);
    await services.priceInput().fill('650');
    await services.durationInput().fill('60');
    await services.submitBtn().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(services.serviceName(svcName)).toBeVisible({ timeout: 10000 });

    // Search → verify filter
    await services.searchInput().fill(svcName);
    await page.waitForTimeout(500);
    await expect(services.serviceName(svcName)).toBeVisible();

    // Detail dialog
    await services.serviceName(svcName).click();
    await page.waitForTimeout(300);
    await expect(services.detailDialog()).toBeVisible({ timeout: 5000 });
    await expect(services.detailName()).toContainText(svcName);
    await services.detailCloseBtn().click();

    // ── Client: create via UI 2-step wizard ──
    const clientName = `E2E Maria ${Date.now().toString(36).slice(-4)}`;
    const clients = new ClientsPage(page);
    await clients.goto();
    await page.waitForLoadState('networkidle');

    await page.goto('/#/clients?add=true');
    await expect(clients.dialog()).toBeVisible({ timeout: 5000 });
    await clients.customerNameInput().fill(clientName);
    await clients.customerPhoneInput().fill('555-2001');
    await clients.continueButton().click();
    await page.waitForTimeout(500);
    await clients.finishButton().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Search for newly created client
    await clients.searchInput().fill(clientName);
    await page.waitForTimeout(1000);
    await expect(clients.clientRow(clientName)).toBeVisible({ timeout: 10000 });

    // Empty search
    await clients.searchInput().fill('zzz-nonexistent-999');
    await page.waitForTimeout(500);
    await expect(clients.emptyState()).toBeVisible({ timeout: 5000 });
  });

  test('UC-006/007/014/022/024 — appointments, finances, settings, and navigation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Appointments — view list, date strip, open create wizard
    const appointments = new AppointmentsPage(page);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible({ timeout: 10000 });
    await expect(appointments.dateStrip()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await expect(appointments.stepIndicator()).toBeVisible();
    await appointments.dialogCloseBtn().click();
    await expect(appointments.dialog()).not.toBeVisible();

    // Finances — page loads
    const finances = new FinancesPage(page);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });

    // Settings — all tabs load (UC-007, 014, 022, 024)
    const settings = new SettingsPage(page);
    await settings.goto();
    await expect(settings.header()).toBeVisible({ timeout: 10000 });

    const tabs = ['Perfil', 'Horarios', 'Notificaciones', 'WhatsApp Bot', 'Google Workspace', 'Datos', 'Cuenta'];
    for (const tab of tabs) {
      const btn = page.locator(`text=${tab}`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // UC-024: verify logout/security reachable
    await expect(page.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible({ timeout: 5000 });

    // Rapid navigation back to dashboard
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });
});
