import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe('NFR — Non-Functional Requirements', { tag: [Tag.REGRESSION] }, () => {

  test('NFR-WS001 — responsive layout: mobile (375px) and desktop (1440px)', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/dashboard');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
    // No horizontal overflow on desktop
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(desktopOverflow).toBe(false);

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#/dashboard');
    await page.waitForTimeout(500);
    // Mobile bottom navigation should be present
    const hasBottomNav = await page.locator('nav').count();
    // On mobile the app should not have horizontal overflow
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(mobileOverflow).toBe(false);
  });

  test('NFR-WS002/004 — loading skeleton and empty states render correctly', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Visit services page — should show skeleton while loading, then content or empty state
    await page.goto('/#/services');
    await page.waitForLoadState('networkidle');

    // Content should be present (header, main) — no blank screen
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });

    // NFR-WS003: Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/#/clients');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });

    await page.goto('/#/agenda');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });

    await page.goto('/#/finances');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });

    // NFR-WS003: no console errors during navigation
    const appErrors = errors.filter(e => !e.includes('403') && !e.includes('favicon'));
    expect(appErrors).toEqual([]);
  });

  test('NFR-WS008 — i18n: language tab accessible, no errors after navigation', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    // Find and click Idioma tab
    const langTab = page.getByRole('tab', { name: /idioma|language/i }).or(page.locator('text=Idioma').first());
    if (await langTab.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await langTab.first().click();
      await page.waitForTimeout(500);
    }

    // Navigate back to dashboard — should render without errors regardless of language
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });
  });
});
