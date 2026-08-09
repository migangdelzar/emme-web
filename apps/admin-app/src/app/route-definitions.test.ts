import { describe, expect, it } from 'vitest';
import { platformRouteDefinitions } from './router.js';

describe('platform-admin route composition', () => {
  it('keeps administrative workflows under explicit paths', () => {
    expect(platformRouteDefinitions.map((route) => route.path)).toEqual([
      '/',
      '/tenants',
      '/memberships',
      '/audit',
      '/subscriptions',
    ]);
  });
});
