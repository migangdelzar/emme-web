import { test, expect } from '@fixtures/testWithUser';
import { FinancesPage } from '@pages/FinancesPage';
import { Tag } from '../../shared/tags';

test.describe('Finances Page', { tag: [Tag.FINANCES, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const finances = new FinancesPage(authenticatedPage);
    await finances.goto();
    await expect(finances.header()).toBeVisible({ timeout: 10000 });
  });

  test('finances header renders', async ({ authenticatedPage }) => {
    const finances = new FinancesPage(authenticatedPage);
    await expect(finances.header()).toBeVisible();
  });
});
