import { describe, expect, it } from 'vitest';
import { clientRouteDefinitions } from './router.js';

describe('client route composition', () => {
  it('keeps the auth-only shell at its root path', () => {
    expect(clientRouteDefinitions.map((route) => route.path)).toEqual([
      '/',
    ]);
  });
});
