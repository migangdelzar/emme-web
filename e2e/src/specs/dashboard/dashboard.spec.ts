import { test, expect } from '@fixtures/testWithUser';
import { DashboardPage } from '@pages/DashboardPage';
import { t } from '@emme/i18n';
import { Tag } from '../../shared/tags';

test.describe('Dashboard Page', { tag: [Tag.DASHBOARD, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await expect(dashboard.greeting()).toBeVisible({ timeout: 10000 });
  });

  test('shows greeting with user name', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await expect(dashboard.greeting()).toContainText(t('dashboard.greeting'));
  });

  test('shows KPI stat cards', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await expect(dashboard.incomeCard()).toBeVisible({ timeout: 5000 });
    await expect(dashboard.confirmedCard()).toBeVisible();
    await expect(dashboard.occupancyCard()).toBeVisible();
    await expect(dashboard.newClientsCard()).toBeVisible();
  });

  test('shows monthly goal card', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await expect(dashboard.goalCard()).toBeVisible({ timeout: 5000 });
    await expect(dashboard.goalLabel()).toBeVisible();
  });

  test('agenda section shows empty state', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await expect(dashboard.emptyAgenda()).toBeVisible({ timeout: 5000 });
  });
});
