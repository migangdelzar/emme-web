import { expect, it } from 'vitest';

import { createTenantFixture } from './tenant.fixture.js';

it('creates a tenant fixture with override support', () => {
  expect(createTenantFixture({ slug: 'north' }).slug).toBe('north');
});
