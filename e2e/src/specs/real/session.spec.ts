import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe('Session Management (Real)', { tag: [Tag.AUTH, Tag.CRITICAL, Tag.HAPPY_PATH] }, () => {
  test.beforeAll(() => {
    test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');
  });

  test('dashboard loads after OAuth2 login', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/dashboard');
    await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({ timeout: 15000 });
  });

  test('access token exists in browser storage', async ({ authenticatedPage }) => {
    const token = await authenticatedPage.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  });

  test('tenant membership is present', async ({ authenticatedPage }) => {
    const profile = await authenticatedPage.evaluate(() => localStorage.getItem('emmenails_profile'));
    expect(profile).toBeTruthy();
    const parsed = JSON.parse(profile!);
    expect(parsed.memberships).toBeTruthy();
    expect(parsed.memberships.length).toBeGreaterThanOrEqual(1);
  });
});
