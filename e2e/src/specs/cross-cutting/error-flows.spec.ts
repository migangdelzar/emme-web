import { test, expect } from '@fixtures/testWithUser';
import { LoginPage } from '@pages/LoginPage';
import { Tag } from '../../shared/tags';

test.describe(
  'Error Flows - Unauthenticated',
  { tag: [Tag.AUTH, Tag.REGRESSION, Tag.ERROR_STATE] },
  () => {
    test('all protected sections redirect to landing when unauthenticated', async ({
      unauthenticatedPage,
    }) => {
      const protectedRoutes = ['/dashboard', '/agenda', '/finances', '/clients', '/services'];

      for (const route of protectedRoutes) {
        await unauthenticatedPage.goto(`/#${route}`);
        const login = new LoginPage(unauthenticatedPage);
        await expect(login.landingBtn()).toBeVisible({ timeout: 5000 });
      }
    });
  }
);
