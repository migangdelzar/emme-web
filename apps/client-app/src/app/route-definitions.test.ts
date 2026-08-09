import { describe, expect, it } from 'vitest';
import { clientRouteDefinitions } from './router.js';

describe('client route composition', () => {
  it('keeps client workflows under stable public paths', () => {
    expect(clientRouteDefinitions.map((route) => route.path)).toEqual([
      '/',
      '/discover',
      '/book',
      '/appointments',
      '/profile',
      '/messages',
    ]);
  });
});
