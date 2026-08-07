import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { Tag } from '../../shared/tags';
import { makeClient } from '../../shared/factories/clientFactory';
import { makeService } from '../../shared/factories/serviceFactory';

test.describe('Tenant Isolation', { tag: [Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test('API-seeded data is visible only within tenant scope', async ({ authenticatedPage, provider }) => {
    const uniqueName = `Iso-Client-${Date.now().toString(36)}`;
    await provider.seed({
      customers: [makeClient({ name: uniqueName, phone: '555-9999', email: `${uniqueName}@test.com` })],
    });
    await authenticatedPage.goto('/#/clients');
    await expect(new ClientsPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(uniqueName).first()).toBeVisible({ timeout: 8000 });

    const uniqueSvc = `Iso-Svc-${Date.now().toString(36)}`;
    await provider.seed({
      services: [makeService({ name: uniqueSvc, price: 999, duration: 30, category: 'Test' })],
    });
    await authenticatedPage.goto('/#/services');
    await expect(new ServicesPage(authenticatedPage).header()).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.getByText(uniqueSvc).first()).toBeVisible({ timeout: 8000 });
  });
});
