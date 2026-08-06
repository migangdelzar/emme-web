import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe('Navigation', { tag: [Tag.NAVIGATION, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/dashboard');
    await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
  });

  test('navigates all sections without errors', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const sections = [
      { name: 'Agenda', selector: () => authenticatedPage.locator('h1').first() },
      { name: 'Finanzas', selector: () => authenticatedPage.locator('h1').first() },
      { name: 'Clientes', selector: () => authenticatedPage.locator('h1').first() },
      { name: 'Servicios', selector: () => authenticatedPage.locator('h1').first() },
      { name: 'Configuración|Configuracion|Ajustes|Settings', selector: () => authenticatedPage.locator('h1').first() },
    ];

    for (const section of sections) {
      await authenticatedPage.getByRole('navigation').getByText(new RegExp(section.name, 'i')).first().click();
      await expect(section.selector()).toBeVisible({ timeout: 5000 });
    }

    // Rapid nav back to dashboard — no white screen
    await authenticatedPage.getByRole('navigation').getByText(/dashboard|inicio/i).first().click();
    await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({ timeout: 5000 });
  });
});
