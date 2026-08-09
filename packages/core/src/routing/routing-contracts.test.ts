import { describe, expect, it } from 'vitest';

import { defineModule, defineRoute } from './routing-contracts.js';

describe('routing contracts', () => {
  it('defines typed routes and modules without constructing a router', () => {
    const route = defineRoute({ key: 'appointments', path: '/appointments' });
    const module = defineModule({ key: 'appointments', routes: [route] });

    expect(route.path).toBe('/appointments');
    expect(module.routes).toEqual([route]);
  });
});
