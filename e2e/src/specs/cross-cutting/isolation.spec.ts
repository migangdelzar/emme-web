import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '../../pages/ServicesPage';
import { Tag } from '../../shared/tags';
import { makeService } from '../../shared/factories/serviceFactory';
import { t } from '@emme/i18n';

test.describe('Tenant Isolation', { tag: [Tag.DASHBOARD, Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test('branding renders and API seed appears in catalog', async ({ authenticatedPage, provider }) => {
    await authenticatedPage.goto('/#/dashboard');
    await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(t('dashboard.studioLevel'), { exact: true })).toBeVisible();

    const uniqueName = `API-Svc-${Date.now().toString(36)}`;
    await provider.seed({
      services: [makeService({ name: uniqueName, price: 999, duration: 30, category: 'Test' })],
    });
    await authenticatedPage.goto('/#/services');
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(uniqueName).first()).toBeVisible({ timeout: 8000 });
  });
});
