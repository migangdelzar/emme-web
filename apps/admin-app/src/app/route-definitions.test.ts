import { describe, expect, it } from 'vitest';
import { adminRouteDefinitions } from './router.js';

describe('admin route composition', () => {
  it('keeps the auth-only shell at its root path', () => {
    expect(adminRouteDefinitions.map((route) => route.path)).toEqual([
      '/',
    ]);
  });
});
