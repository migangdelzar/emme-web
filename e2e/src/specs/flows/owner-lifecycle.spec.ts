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

  test('UC-001/003 — dashboard renders with KPIs, greeting, and tenant branding', async ({ authenticatedPage }) => {
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
    await expect(page.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();
  });

  test('UC-004/005 — services and customers CRUD with verification', async ({ authenticatedPage, provider }) => {
    const page = authenticatedPage;

    // ── Service: create via API → verify in catalog (auto-cleaned by provider.teardown) ──
    const svcName = `E2E-Svc-${Date.now().toString(36)}`;
    await provider.seed({ services: [{ id: 'e2e-s1', name: svcName, price: 500, duration: 45, category: 'Manicura', isActive: true }] });

    const services = new ServicesPage(page);
    await services.goto();
    await page.waitForLoadState('networkidle');
    await expect(services.header()).toBeVisible({ timeout: 10000 });

    await services.searchInput().fill(svcName);
    await page.waitForTimeout(500);
    await expect(services.serviceName(svcName)).toBeVisible({ timeout: 10000 });
    await services.searchInput().fill('');
    await page.waitForTimeout(300);

    await services.serviceName(svcName).click();
    await expect(services.detailDialog()).toBeVisible();
    await expect(services.detailName()).toContainText(svcName);
    await services.detailCloseBtn().click();
    await expect(services.detailDialog()).not.toBeVisible();

    // ── Customer: create via API → verify in UI via search ──
    const uniqueName = `E2E-${Date.now().toString(36)}`;
    await provider.seed({ customers: [{ id: 'e2e-c1', name: uniqueName, phone: '555-2001' }] });

    const clients = new ClientsPage(page);
    await clients.goto();
    await page.waitForLoadState('networkidle');
    await expect(clients.header()).toBeVisible({ timeout: 10000 });

    // Search for the seeded customer (pagination hides new records otherwise)
    await clients.searchInput().fill(uniqueName);
    await page.waitForTimeout(1000);
    await expect(clients.clientRow(uniqueName)).toBeVisible({ timeout: 10000 });

    await clients.searchInput().fill('zzz-non-existent');
    await expect(clients.emptyState()).toBeVisible();
  });

  test('UC-006/007/014/022/024 — appointments, finances, settings tabs, and navigation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const appointments = new AppointmentsPage(page);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible({ timeout: 10000 });
    await expect(appointments.dateStrip()).toBeVisible();
    await appointments.gotoNewAppointment();
    await expect(appointments.dialog()).toBeVisible();
    await appointments.dialogCloseBtn().click();
    await expect(appointments.dialog()).not.toBeVisible();

    const finances = new FinancesPage(page);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });

    // Settings + data management (UC-007, UC-014, UC-022, UC-024)
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

    // UC-024: verify logout/security is reachable
    await expect(page.getByRole('button', { name: /cerrar sesión|logout/i })).toBeVisible({ timeout: 5000 });

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });
});
