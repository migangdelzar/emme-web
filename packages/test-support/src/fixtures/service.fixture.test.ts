import { expect, it } from 'vitest';

import { createServiceFixture } from './service.fixture.js';

it('creates a service fixture with stable defaults', () => {
  expect(createServiceFixture({ price: 500 }).price).toBe(500);
});
