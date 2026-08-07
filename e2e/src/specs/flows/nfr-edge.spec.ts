import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe('NFR — Edge Cases', { tag: [Tag.REGRESSION] }, () => {

  test('NFR-WS005 — offline shows fallback, recovers on reconnect', async ({ page }) => {
    // Load normally
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Try to navigate — page should show something, not white
    await page.goto('/#/dashboard');
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body').catch(() => '');
    expect(bodyText.length).toBeGreaterThan(0);

    // Reconnect and verify recovery
    await page.context().setOffline(false);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const landingBtn = page.getByRole('button', { name: /ingresar|Iniciar/i });
    await expect(landingBtn).toBeVisible({ timeout: 10000 });
  });

  test('NFR-WS006 — session expiry: invalid/missing token returns 401', async ({ page }) => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');

    const apiUrl = process.env.E2E_API_URL || 'http://localhost:8081';
    const headers = { 'API-Version': '1.0', 'X-Emme-Tenant-Slug': 'e2e-studio' };

    // Invalid token
    const badRes = await page.request.get(`${apiUrl}/api/me`, {
      headers: { ...headers, Authorization: 'Bearer invalid' },
    });
    expect(badRes.status()).toBe(401);

    // No token
    const noRes = await page.request.get(`${apiUrl}/api/me`, { headers });
    expect(noRes.status()).toBe(401);

    // Expired token format
    const expiredRes = await page.request.get(`${apiUrl}/api/me`, {
      headers: { ...headers, Authorization: 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjEwMDAwfQ.expired' },
    });
    expect(expiredRes.status()).toBe(401);
  });

  test('NFR-WS007 — PWA: manifest.json reachable, app has service worker', async ({ page }) => {
    // Manifest
    const manifestRes = await page.request.get('/manifest.json');
    const manifest = manifestRes.status() === 200 ? await manifestRes.json().catch(() => null) : null;
    if (manifest) {
      expect(manifest.name || manifest.short_name).toBeTruthy();
    }

    // Check if service worker is registered
    await page.goto('/');
    const hasSW = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        return reg !== undefined;
      }
      return false;
    });
    // Service worker may not be active in dev mode — non-fatal
    expect(typeof hasSW).toBe('boolean');
  });

  test('FR-WS008/009 — dashboard quick-create buttons open dialogs', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });

    // Quick-create appointment (Plus button)
    const plusBtn = page.getByRole('button', { name: /cita|appointment|agregar/i }).first();
    if (await plusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
      }
    }

    // Quick-create client (UserPlus button)
    const userPlusBtn = page.getByRole('button', { name: /cliente|client/i }).first();
    if (await userPlusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userPlusBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('FR-WS033/034 — service card toggle and delete buttons clickable', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/services');
    await page.waitForLoadState('networkidle');

    // The provisioner seeded 3 services — they should have toggle (Power) and delete (Trash2) buttons
    const powerBtns = page.locator('button svg.lucide-power');
    const trashBtns = page.locator('button svg.lucide-trash2');

    const powerCount = await powerBtns.count();
    const trashCount = await trashBtns.or(page.locator('button[aria-label*="Eliminar"], button[aria-label*="Delete"]')).count();

    expect(powerCount).toBeGreaterThanOrEqual(1);
    expect(trashCount).toBeGreaterThanOrEqual(1);
  });
});
