import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { t } from '@emme/i18n';

const protectedRoutes = ['/dashboard', '/agenda', '/clients', '/services', '/finances', '/settings'];

test.describe('Shell Integrity', { tag: [Tag.SMOKE, Tag.CRITICAL] }, () => {
  test('all routes are accessible and keyboard-navigable', async ({ authenticatedPage }) => {
    const pageErrors: Error[] = [];
    authenticatedPage.on('pageerror', (error) => pageErrors.push(error));

    for (const route of protectedRoutes) {
      await authenticatedPage.goto(`/#${route}`);
      await expect(authenticatedPage.locator('main')).toBeVisible({ timeout: 10000 });
      await expect(authenticatedPage.locator('h1').first()).toBeVisible();

      const hasHorizontalOverflow = await authenticatedPage.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalOverflow, `${route} must not overflow horizontally`).toBe(false);

      await authenticatedPage.keyboard.press('Tab');
      await expect(authenticatedPage.locator(':focus-visible')).toBeVisible();
    }

    expect(pageErrors, 'must not emit uncaught browser errors').toEqual([]);
  });

  test('unauthenticated landing is accessible and protected routes redirect', async ({ unauthenticatedPage }) => {
    await unauthenticatedPage.goto('/');
    const landing = unauthenticatedPage.getByTestId('auth-landing').or(
      unauthenticatedPage.getByRole('button', { name: /ingresar|Iniciar|enter/i })
    );
    await expect(landing.first()).toBeVisible({ timeout: 10000 });
    await unauthenticatedPage.keyboard.press('Tab');
    await expect(unauthenticatedPage.locator(':focus-visible')).toBeVisible();

    for (const route of protectedRoutes) {
      await unauthenticatedPage.goto(`/#${route}`);
      await expect(unauthenticatedPage.getByRole('button', { name: /ingresar|Iniciar|enter/i })).toBeVisible({ timeout: 5000 });
    }
  });
});
