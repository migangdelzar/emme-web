import { test, expect } from '@playwright/test';
import { Tag } from '../../shared/tags';

test.describe('Smoke', { tag: [Tag.SMOKE, Tag.DASHBOARD, Tag.CRITICAL] }, () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole('button', { name: /ingresar|Iniciar/i })).toBeVisible({ timeout: 10000 });
  });

  test('backend health endpoint reachable', async ({ page }) => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');
    const apiUrl = process.env.E2E_API_URL || 'http://localhost:8081';
    const resp = await page.request.get(`${apiUrl}/actuator/health`);
    expect(resp.status()).toBe(200);
    expect((await resp.json()).status).toBe('UP');
  });
});
