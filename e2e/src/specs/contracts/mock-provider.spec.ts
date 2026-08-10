import { test, expect } from '@playwright/test';
import { MockProvider } from '@providers/MockProvider';

test('mock provider instances keep seeded records isolated', async () => {
  const first = new MockProvider();
  const second = new MockProvider();

  await first.seed({
    customers: [{ id: 'first-customer', name: 'First', email: 'first@example.test', phone: '1' }],
  });

  expect(await first.loadClients()).toHaveLength(1);
  expect(await second.loadClients()).toHaveLength(0);

  await first.teardown();
  await second.teardown();
});
