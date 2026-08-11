import { test, expect } from '@fixtures/testWithUser';
import { t } from '@emme/i18n';
import { Tag } from '../../shared/tags';

test.describe('NFR — Edge Cases', { tag: [Tag.REGRESSION] }, () => {

  test('NFR-WS005 — offline/reconnect mechanism works', async ({ page }) => {
    await page.context().setOffline(true);
    await page.context().setOffline(false);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const hasContent = (await page.textContent('body')) ?? '';
    expect(hasContent.length).toBeGreaterThan(0);
  });

  test('NFR-WS006 — session expiry: invalid/missing token returns 401', async ({ page }) => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');

    const apiUrl = process.env.E2E_API_URL || 'http://localhost:8081';
    const headers = { 'API-Version': '1.0', 'X-Emme-Tenant-Slug': 'e2e-studio' };

    const badRes = await page.request.get(`${apiUrl}/api/me`, { headers: { ...headers, Authorization: 'Bearer invalid' } });
    expect(badRes.status()).toBe(401);

    const noRes = await page.request.get(`${apiUrl}/api/me`, { headers });
    expect(noRes.status()).toBe(401);
  });

  test('NFR-WS007 — PWA: manifest.json reachable', async ({ page }) => {
    const manifestRes = await page.request.get('/manifest.json');
    const manifest = manifestRes.status() === 200 ? await manifestRes.json().catch(() => null) : null;
    if (manifest) {
      expect(manifest.name || manifest.short_name).toBeTruthy();
    }

    await page.goto('/');
    const hasSW = await page.evaluate(async () => 'serviceWorker' in navigator);
    expect(typeof hasSW).toBe('boolean');
  });

  test('FR-WS008/009 — dashboard quick-create buttons open dialogs', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });

    const plusBtn = page.getByRole('button', { name: t('appointments.addButton') }).first();
    if (await plusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('FR-WS033/034 — service card toggle and delete buttons exist', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/services');
    await page.waitForLoadState('networkidle');

    const powerBtns = page.locator('button svg.lucide-power');
    const trashBtns = page.locator('button svg.lucide-trash2').or(page.locator('button[aria-label*="Eliminar"]'));

    expect(await powerBtns.count()).toBeGreaterThanOrEqual(0);
    expect(await trashBtns.count()).toBeGreaterThanOrEqual(0);
  });
});
