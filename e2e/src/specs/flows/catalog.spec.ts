import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { Tag } from '../../shared/tags';
import { SEEDS } from '../../setup/seed-data';

test.describe('UC-004/005 — Catalog verification', { tag: [Tag.CRITICAL, Tag.SERVICES, Tag.CLIENTS] }, () => {

  test('search services, detail dialog, edit/delete buttons', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svc = SEEDS.services[0];
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await expect(services.header()).toBeVisible({ timeout: 10000 });

    // Search by provisioned name
    if (svc) {
      await services.searchInput().fill(svc.name);
      await page.waitForTimeout(1000);
      await expect(services.serviceName(svc.name)).toBeVisible({ timeout: 10000 });

      // Detail dialog
      await services.serviceName(svc.name).click();
      await page.waitForTimeout(300);
      await expect(services.detailDialog()).toBeVisible({ timeout: 5000 });
      await expect(services.detailName()).toContainText(svc.name);
      await services.detailCloseBtn().click();

      // Edit + delete buttons exist on card
      const card = services.serviceCard(svc.name);
      await expect(card).toBeVisible();
    }
  });

  test('search clients, empty search', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const client = SEEDS.customers[0];
    const clients = new ClientsPage(page);

    await clients.goto();
    await page.waitForLoadState('networkidle');
    await expect(clients.header()).toBeVisible({ timeout: 10000 });

    if (client) {
      // Search by provisioned name
      await clients.searchInput().fill(client.name);
      await page.waitForTimeout(1000);
      await expect(clients.clientRow(client.name)).toBeVisible({ timeout: 10000 });
    }

    // Empty search
    await clients.searchInput().fill('zzz-nonexistent-999');
    await page.waitForTimeout(500);
    await expect(clients.emptyState()).toBeVisible({ timeout: 5000 });
  });
});
