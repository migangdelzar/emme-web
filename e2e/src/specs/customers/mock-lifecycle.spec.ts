import { test, expect } from '@fixtures/testWithUser';
import { ClientsPage } from '@pages/ClientsPage';
import { Tag } from '../../shared/tags';

test.describe('Mock tenant-owner customer lifecycle', { tag: [Tag.CLIENTS, Tag.CRITICAL] }, () => {
  test('creates a customer through the visible UI', async ({ authenticatedPage }) => {
    const clients = new ClientsPage(authenticatedPage);
    await clients.createCustomer('E2E Customer', '555-0199');
    await expect(clients.clientRow('E2E Customer')).toBeVisible();
  });
});
