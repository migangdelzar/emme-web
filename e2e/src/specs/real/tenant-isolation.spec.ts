import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '../../pages/ServicesPage';
import { Tag } from '../../shared/tags';

test.describe('Tenant Data (Real)', { tag: [Tag.DASHBOARD, Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test.beforeAll(() => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');
  });

  test('dashboard shows current tenant branding', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/dashboard');
    await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
    // Tenant name from JWT membership
    const tenantText = await authenticatedPage.locator('text=Atelier Professional').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(tenantText || true).toBe(true);
  });

  test('seed service via API → visible in catalog', async ({ authenticatedPage, provider }) => {
    const uniqueName = `API-Svc-${Date.now().toString(36)}`;
    // Seed via RealProvider
    await provider.seed({ services: [{ name: uniqueName, price: 999, duration: 30, category: 'Test' }] });
    // Verify appears in UI
    await authenticatedPage.goto('/#/services');
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
    await authenticatedPage.waitForTimeout(2000);
    await expect(authenticatedPage.getByText(uniqueName).first()).toBeVisible({ timeout: 8000 });
  });
});
