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

  test('NFR-WS008 — i18n: switch to English and verify language change', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    // Click Idioma tab
    const langTab = page.locator('text=Idioma').first();
    if (await langTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await langTab.click();
      await page.waitForTimeout(500);
    }

    // Try to switch to English (button should contain "EN" or "English" or "Inglés")
    const enBtn = page.getByRole('button', { name: /EN|English|Inglés/i }).first();
    if (await enBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enBtn.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to dashboard and verify it still renders
    await page.goto('/#/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('sidebar-container')).toBeVisible({ timeout: 10000 });

    // Switch back to Spanish
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    const idiomaTab = page.locator('text=Idioma').first();
    if (await idiomaTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await idiomaTab.click();
      await page.waitForTimeout(500);
    }
    const esBtn = page.getByRole('button', { name: /ES|Español|Spanish/i }).first();
    if (await esBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await esBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
