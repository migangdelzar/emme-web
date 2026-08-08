import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './auth-provider.js';
import { useAuth } from './use-auth.js';
import type { AuthContextValue } from './auth.types.js';

function AuthProbe(): ReactNode {
  const { status, tenant } = useAuth();
  return createElement('output', null, `${status}:${tenant?.tenantSlug ?? 'none'}`);
}

describe('AuthProvider', () => {
  it('exposes the injected auth state and actions through useAuth', () => {
    const value: AuthContextValue = {
      status: 'ready',
      user: null,
      tenant: { tenantId: 'tenant-1', tenantSlug: 'studio', tenantName: 'Studio', displayName: 'Studio', role: 'OWNER', status: 'ACTIVE', permissions: [] },
      allTenants: [],
      profile: null,
      error: null,
      login: async () => undefined,
      selectTenant: () => undefined,
      logout: () => undefined,
    };

    const markup = renderToStaticMarkup(
      createElement(AuthProvider, { value }, createElement(AuthProbe)),
    );

    expect(markup).toBe('<output>ready:studio</output>');
  });
});
