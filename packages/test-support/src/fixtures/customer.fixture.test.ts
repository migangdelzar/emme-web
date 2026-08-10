import { expect, it } from 'vitest';

import { createCustomerFixture } from './customer.fixture.js';

it('creates a customer fixture with stable defaults', () => {
  expect(createCustomerFixture({ name: 'Ada Lovelace' }).name).toBe('Ada Lovelace');
});
