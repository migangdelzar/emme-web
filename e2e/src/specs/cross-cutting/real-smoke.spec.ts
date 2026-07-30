import { test, expect } from '@playwright/test';
import { Tag } from '../../shared/tags';

test.describe('Smoke', { tag: [Tag.SMOKE, Tag.DASHBOARD, Tag.CRITICAL] }, () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /ingresar|Iniciar/i })).toBeVisible();
  });

  test('backend health endpoint reachable', async ({ page }) => {
    const resp = await page.request.get('http://localhost:8080/actuator/health');
    expect(resp.status()).toBe(200);
    expect((await resp.json()).status).toBe('UP');
  });
});
