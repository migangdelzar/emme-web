import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { Tag } from '../../shared/tags';

test.describe('Catalog — UC-004 + UC-005', { tag: [Tag.CRITICAL, Tag.SERVICES, Tag.CLIENTS] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('UC-004 — service catalog: create via UI, search, detail dialog', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svcName = `E2E Svc ${Date.now().toString(36).slice(-4)}`;
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await expect(services.header()).toBeVisible({ timeout: 10000 });

    // FR-WS031: Create service via UI form
    await page.goto('/#/services?add=true');
    await expect(services.dialog()).toBeVisible({ timeout: 5000 });
    await services.serviceNameInput().fill(svcName);
    await services.priceInput().fill('650');
    await services.durationInput().fill('60');
    await services.submitBtn().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(services.serviceName(svcName)).toBeVisible({ timeout: 10000 });

    // FR-WS035: Search services
    await services.searchInput().fill(svcName);
    await page.waitForTimeout(500);
    await expect(services.serviceName(svcName)).toBeVisible();

    // Detail dialog
    await services.serviceName(svcName).click();
    await page.waitForTimeout(300);
    await expect(services.detailDialog()).toBeVisible({ timeout: 5000 });
    await expect(services.detailName()).toContainText(svcName);
    await services.detailCloseBtn().click();
  });

  test('UC-005 — client profiles: create via UI wizard, search, empty search', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const clientName = `E2E Maria ${Date.now().toString(36).slice(-4)}`;
    const clients = new ClientsPage(page);

    await clients.goto();
    await page.waitForLoadState('networkidle');
    await expect(clients.header()).toBeVisible({ timeout: 10000 });

    // FR-WS025: Create client via 2-step wizard
    await page.goto('/#/clients?add=true');
    await expect(clients.dialog()).toBeVisible({ timeout: 5000 });
    await clients.customerNameInput().fill(clientName);
    await clients.customerPhoneInput().fill('555-2001');
    await clients.continueButton().click();
    await page.waitForTimeout(500);
    await clients.finishButton().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // FR-WS023: Search clients
    await clients.searchInput().fill(clientName);
    await page.waitForTimeout(1000);
    await expect(clients.clientRow(clientName)).toBeVisible({ timeout: 10000 });

    // FR-WS023: Empty search
    await clients.searchInput().fill('zzz-nonexistent-999');
    await page.waitForTimeout(500);
    await expect(clients.emptyState()).toBeVisible({ timeout: 5000 });
  });
});
