import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { ClientsPage } from '@pages/ClientsPage';
import { t } from '@emme/i18n';

const mockCustomers = [
  { id: 'c1', name: 'Valeria Arriaza', email: 'valeria@test.com', phone: '555-0101' },
  { id: 'c2', name: 'Elena Garcia', email: 'elena@test.com', phone: '555-0102' },
  { id: 'c3', name: 'Maria Jose', email: 'maria@test.com', phone: '555-0103' },
];

test.describe('Customers Page', { tag: [Tag.CLIENTS, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    await provider.seed({ customers: mockCustomers });
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
  });

  test('customers heading renders', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await expect(clients.header()).toBeVisible();
  });

  test('customer list renders items', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await expect(clients.clientRow('Valeria Arriaza')).toBeVisible();
    await expect(clients.clientRow('Elena Garcia')).toBeVisible();
    await expect(clients.clientRow('Maria Jose')).toBeVisible();
  });

  test('add client via URL param opens dialog', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/clients?add=true');
    await expect(new ClientsPage(authenticatedPage).dialog()).toBeVisible();
  });

  test('empty state shows when no clients', { tag: [Tag.EMPTY_STATE] }, async ({ authenticatedPage, provider }) => {
    await provider.seed({ customers: [] });
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
    const countText = authenticatedPage.getByText(t('clients.empty'));
    await expect(countText).toBeVisible();
  });
});
