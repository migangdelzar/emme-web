import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { SettingsPage } from '@pages/SettingsPage';

test.describe('Settings Page', { tag: [Tag.SETTINGS, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const settings = new SettingsPage(authenticatedPage);
    await settings.goto();
    await expect(settings.header()).toBeVisible();
  });

  test('settings header renders', async ({ authenticatedPage }) => {
    const settings = new SettingsPage(authenticatedPage);
    await expect(settings.header()).toBeVisible();
  });
});
