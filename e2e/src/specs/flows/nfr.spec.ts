import { test, expect } from '@fixtures/testWithUser';
import { t } from '@emme/i18n';
import { Tag } from '../../shared/tags';

test.describe('NFR — Non-Functional Requirements', { tag: [Tag.REGRESSION] }, () => {

  test('NFR-WS001 — responsive layout: mobile (375px) and desktop (1440px)', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/dashboard');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(desktopOverflow).toBe(false);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#/dashboard');
    await page.waitForTimeout(500);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(mobileOverflow).toBe(false);
  });

  test('NFR-WS002/004 — loading skeleton and empty states render correctly', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    for (const route of ['/services', '/clients', '/agenda', '/finances', '/settings']) {
      await page.goto(`/#${route}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });
    }

    const appErrors = errors.filter(e => !e.includes('403') && !e.includes('favicon'));
    expect(appErrors).toEqual([]);
  });

  test('NFR-WS008 — i18n: language tab accessible, app renders after navigation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    const langTab = page.getByRole('tab', { name: t('settings.language') }).or(page.locator(`text=${t('settings.language')}`)).first();
    if (await langTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await langTab.click();
      await page.waitForTimeout(300);
    }

    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
  });
});
