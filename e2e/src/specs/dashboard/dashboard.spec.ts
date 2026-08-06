import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { DashboardPage } from '@pages/DashboardPage';

test.describe('Dashboard', { tag: [Tag.DASHBOARD, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible();
  });

  test('renders all sections correctly', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await expect(dashboard.greeting()).toContainText(/madrugada|mañana|tarde|noche|madrugada|morning|afternoon|evening/);

    await expect(dashboard.incomeCard()).toBeVisible();
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();

    await expect(dashboard.goalCard()).toBeVisible();
    await expect(dashboard.goalLabel()).toBeVisible();

    await expect(dashboard.emptyAgenda()).toBeVisible();
  });
});
