import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { ServicesPage } from '@pages/ServicesPage';

const mockServices = [
  { id: 's1', name: 'Manicure Clasica', category: 'Manicura y Cuidado Natural', duration: 45, price: 350, isActive: true },
  { id: 's2', name: 'Manicure Rusa', category: 'Manicura y Cuidado Natural', duration: 90, price: 750, isActive: true },
  { id: 's3', name: 'Soft Gel Premium', category: 'Extensiones y Estructura', duration: 120, price: 1200, isActive: true },
];

test.describe('Services', { tag: [Tag.SERVICES, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    await provider.seed({ services: mockServices });
    const services = new ServicesPage(authenticatedPage);
    await services.goto();
    await expect(services.header()).toBeVisible();
  });

  test('catalog renders, search and filter work', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);

    await expect(services.activeCountBadge()).toBeVisible();
    await services.searchInput().fill('Manicure Clasica');
    await authenticatedPage.waitForTimeout(500);
    await expect(services.serviceName('Manicure Clasica').first()).toBeVisible();
    await services.searchInput().fill('');
    await authenticatedPage.waitForTimeout(500);

    await services.searchInput().fill('Rusa');
    await expect(services.serviceName('Manicure Rusa').first()).toBeVisible();
    await expect(services.serviceName('Manicure Clasica').first()).not.toBeVisible();
    await services.searchInput().fill('');

    const extChip = authenticatedPage.getByRole('button').filter({ hasText: 'Extensiones' });
    await expect(extChip.first()).toBeVisible();
    await extChip.first().click();
    await expect(services.serviceName('Soft Gel Premium').first()).toBeVisible();
    await expect(services.serviceName('Manicure Clasica').first()).not.toBeVisible();

    await services.searchInput().fill('zzz-non-existent');
    await expect(services.emptySearchMsg()).toBeVisible();
  });

  test('detail dialog opens and closes', async ({ authenticatedPage }) => {
    const services = new ServicesPage(authenticatedPage);
    await services.serviceName('Manicure Rusa').first().click();

    await expect(services.detailDialog()).toBeVisible();
    await expect(services.detailName()).toContainText('Manicure Rusa');
    await expect(services.detailDuration()).toBeVisible();
    await expect(services.detailPrice()).toBeVisible();

    await services.detailCloseBtn().click();
    await expect(services.detailDialog()).not.toBeVisible();
  });

  test('add dialog opens via URL param', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/services?add=true');
    const services = new ServicesPage(authenticatedPage);
    await expect(services.dialog()).toBeVisible();
    await expect(services.serviceNameInput()).toBeVisible();
    await expect(services.priceInput()).toBeVisible();
    await expect(services.submitBtn().first()).toBeVisible();
  });

  test('creates and updates a service through the UI', { tag: [Tag.CRITICAL] }, async ({ authenticatedPage }) => {
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
