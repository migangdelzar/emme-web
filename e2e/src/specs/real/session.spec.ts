import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';

test.describe(
  'Session Management (Real)',
  { tag: [Tag.AUTH, Tag.CRITICAL, Tag.HAPPY_PATH] },
  () => {
    test.beforeAll(() => {
      test.skip(process.env.E2E_MODE !== 'real', 'Real-only: requires backend');
    });

    test('dashboard loads after OAuth2 login', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/#/dashboard');
      await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({
        timeout: 15000,
      });
    });

    test('authenticated owner sees the tenant-scoped application shell', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/#/dashboard');
      await expect(authenticatedPage.getByTestId('sidebar-container')).toBeVisible({
        timeout: 15000,
      });
      await expect(authenticatedPage.getByTestId('dashboard-greeting')).toBeVisible();
    });
  }
);
