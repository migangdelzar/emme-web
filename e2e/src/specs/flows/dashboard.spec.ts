import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { Tag } from '../../shared/tags';
import { t } from '@emme/i18n';

test.describe('Dashboard — UC-003', { tag: [Tag.CRITICAL, Tag.DASHBOARD] }, () => {
  test('KPIs, greeting, agenda, goal card, and tenant branding render', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await expect(dashboard.sidebar()).toBeVisible();

    // FR-WS005: KPIs
    await expect(dashboard.greeting()).toContainText(/madrugada|mañana|tarde|noche|morning|afternoon|evening/);
    await expect(dashboard.incomeCard()).toBeVisible();
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();

    // FR-WS010: Monthly goal
    await expect(dashboard.goalCard()).toBeVisible();
    await expect(dashboard.goalLabel()).toBeVisible();

    // FR-WS006: Today's agenda (empty state)
    await expect(dashboard.emptyAgenda()).toBeVisible();

    // Tenant branding
    await expect(page.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();
  });
});
