import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { Tag } from '../../shared/tags';
import { t } from '@emme/i18n';

test.describe('UC-003 — Dashboard', { tag: [Tag.CRITICAL, Tag.DASHBOARD] }, () => {
  test('FR-WS005/006/010 — KPIs, greeting, agenda, goal, tenant branding', async ({ authenticatedPage }) => {
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
    await expect(dashboard.goalLabel()).toBeVisible();
    await expect(dashboard.emptyAgenda()).toBeVisible();
    await expect(page.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();
  });
});
