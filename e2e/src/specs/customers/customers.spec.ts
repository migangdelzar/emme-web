import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { ClientsPage } from '@pages/ClientsPage';

const mockCustomers = [
  { id: 'c1', name: 'Valeria Arriaza', email: 'valeria@test.com', phone: '555-0101' },
  { id: 'c2', name: 'Elena Garcia', email: 'elena@test.com', phone: '555-0102' },
  { id: 'c3', name: 'Maria Jose', email: 'maria@test.com', phone: '555-0103' },
];

test.describe('Customers', { tag: [Tag.CLIENTS, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    await provider.seed({ customers: mockCustomers });
    const clients = new ClientsPage(authenticatedPage);
    await clients.goto();
    await expect(clients.header()).toBeVisible();
  });

  test('list renders and search works', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);

    await expect(clients.clientRow('Valeria Arriaza')).toBeVisible();
    await expect(clients.clientRow('Elena Garcia')).toBeVisible();
    await expect(clients.clientRow('Maria Jose')).toBeVisible();

    await clients.searchInput().fill('zzz-non-existent');
    await expect(clients.emptyState()).toBeVisible();
  });

  test('add dialog opens via URL param', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/#/clients?add=true');
    await expect(new ClientsPage(authenticatedPage).dialog()).toBeVisible();
  });

  test('creates a customer through the UI', { tag: [Tag.CRITICAL] }, async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.createCustomer('E2E Customer', '555-0199');
    await expect(clients.clientRow('E2E Customer')).toBeVisible();
  });
});
