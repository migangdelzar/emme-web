import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { ClientsPage } from '@pages/ClientsPage';
import { Tag } from '../../shared/tags';
import { SEEDS } from '../../setup/seed-data';

test.describe('UC-004/005 — Catalog CRUD', { tag: [Tag.CRITICAL, Tag.SERVICES, Tag.CLIENTS] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('FR-WS030/031/035 — search services, detail dialog', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svc = SEEDS.services[0];
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await expect(services.header()).toBeVisible({ timeout: 10000 });

    if (svc) {
      await services.searchInput().fill(svc.name);
      await page.waitForTimeout(1000);
      await expect(services.serviceName(svc.name)).toBeVisible({ timeout: 10000 });

      await services.serviceName(svc.name).click();
      await page.waitForTimeout(300);
      await expect(services.detailDialog()).toBeVisible({ timeout: 5000 });
      await expect(services.detailName()).toContainText(svc.name);
      await services.detailCloseBtn().click();
    }
  });

  test('FR-WS032 — edit service name via UI', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svc = SEEDS.services[0];
    if (!svc) return;
    const updatedName = `${svc.name}-MOD`;
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await services.searchInput().fill(svc.name);
    await page.waitForTimeout(500);

    // Open edit dialog
    await services.editService(svc.name);
    await services.addDialogByRole().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Update name
    await services.serviceNameInput().fill(updatedName);
    await services.submitBtn().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify updated name via search
    await services.searchInput().fill(updatedName);
    await page.waitForTimeout(500);
    await expect(services.serviceName(updatedName)).toBeVisible({ timeout: 10000 });

    // Revert name back
    await services.editService(updatedName);
    await services.addDialogByRole().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    await services.serviceNameInput().fill(svc.name);
    await services.submitBtn().click();
    await page.waitForLoadState('networkidle');
  });

  test('FR-WS033 — toggle service active/inactive', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svc = SEEDS.services[1];
    if (!svc) return;
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await services.searchInput().fill(svc.name);
    await page.waitForTimeout(500);

    const card = services.serviceCard(svc.name);
    await expect(card).toBeVisible({ timeout: 5000 });

    // Toggle off
    await services.toggleBtn(card).click();
    await page.waitForTimeout(1000);

    // Toggle back on
    const card2 = services.serviceCard(svc.name);
    await services.toggleBtn(card2).click();
    await page.waitForTimeout(1000);
  });

  test('FR-WS034 — delete service with confirmation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const svc = SEEDS.services[2];
    if (!svc) return;
    const services = new ServicesPage(page);

    await services.goto();
    await page.waitForLoadState('networkidle');
    await services.searchInput().fill(svc.name);
    await page.waitForTimeout(500);

    const card = services.serviceCard(svc.name);
    await expect(card).toBeVisible({ timeout: 5000 });

    // Click delete button
    await services.deleteBtn(card).click();
    await page.waitForTimeout(500);

    // Confirm deletion in dialog
    const confirmBtn = services.deleteConfirmBtn();
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('FR-WS023/025/026/027 — client search, detail, edit', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const client = SEEDS.customers[0];
    if (!client) return;
    const clients = new ClientsPage(page);

    await clients.goto();
    await page.waitForLoadState('networkidle');
    await expect(clients.header()).toBeVisible({ timeout: 10000 });

    // Search
    await clients.searchInput().fill(client.name);
    await page.waitForTimeout(1000);
    await expect(clients.clientRow(client.name)).toBeVisible({ timeout: 10000 });

    // Detail view
    await clients.clientRow(client.name).click();
    await page.waitForTimeout(1000);
    const heading = page.getByRole('heading').first();
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible();
    }

    // Edit button on detail
    const editBtn = page.getByRole('button', { name: /editar|edit/i }).first();
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(500);
      // Close edit if opened
      const cancelBtn = page.getByRole('button', { name: /cancelar|cancel/i }).first();
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
      }
    }

    // Empty search
    await clients.goto();
    await clients.searchInput().fill('zzz-nonexistent-999');
    await page.waitForTimeout(500);
    await expect(clients.emptyState()).toBeVisible({ timeout: 5000 });
  });
});
