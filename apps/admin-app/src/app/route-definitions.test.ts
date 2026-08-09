import { describe, expect, it } from 'vitest';
import { platformRouteDefinitions } from './router.js';

describe('platform-admin route composition', () => {
  it('keeps the auth-only shell at its root path', () => {
    expect(platformRouteDefinitions.map((route) => route.path)).toEqual([
      '/',
    ]);
  });
});
