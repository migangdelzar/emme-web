import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe('OAuth2 Login Flow', { tag: [Tag.AUTH, Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test('login form appears after clicking enter', async ({ page }) => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires Keycloak + backend');

    await page.goto('/');
    await page.getByRole('button', { name: /ingresar|Iniciar/i }).click();
    await expect(page.getByPlaceholder(/email|usuario/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Iniciar|Ingresar/i })).toBeVisible();
  });
});
