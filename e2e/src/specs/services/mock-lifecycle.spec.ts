import { test, expect } from '@fixtures/testWithUser';
import { ServicesPage } from '@pages/ServicesPage';
import { Tag } from '../../shared/tags';

test.describe('Mock tenant-owner service lifecycle', { tag: [Tag.SERVICES, Tag.CRITICAL] }, () => {
  test('creates and updates a service through the visible UI', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await authenticatedPage.goto('/#/services?add=true');
    await expect(services.dialog()).toBeVisible();
    await services.serviceNameInput().fill('E2E Service');
    await services.priceInput().fill('650');
    await services.durationInput().fill('60');
    await services.submitBtn().click();
    await expect(services.serviceName('E2E Service')).toBeVisible();

    await services.editService('E2E Service');
    await services.serviceNameInput().fill('E2E Updated Service');
    await services.submitBtn().click();
    await expect(services.serviceName('E2E Updated Service')).toBeVisible();
  });
});
