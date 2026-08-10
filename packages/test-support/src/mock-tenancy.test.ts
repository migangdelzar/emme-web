import { describe, expect, it } from 'vitest';

import { createFakeTenant } from './mock-tenancy.js';

describe('createFakeTenant', () => {
  it('returns a fresh tenant with deterministic defaults', () => {
    const first = createFakeTenant();
    const second = createFakeTenant();

    expect(first).toEqual({ id: 'tenant-test', slug: 'test-salon', name: 'Test Salon' });
    expect(first).not.toBe(second);
  });

  it('supports per-test overrides', () => {
    expect(createFakeTenant({ slug: 'downtown', name: 'Downtown Salon' })).toEqual({
      id: 'tenant-test',
      slug: 'downtown',
      name: 'Downtown Salon',
    });
  });
});
