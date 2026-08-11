import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AuthContext, type AuthContextValue } from '@emme/core';
import { AuthGate } from '../components/AuthGate.js';

const baseAuth: AuthContextValue = {
  status: 'ready',
  accessToken: 'token',
  user: null,
  tenant: null,
  allTenants: [],
  profile: null,
  error: null,
  login: async () => undefined,
  selectTenant: () => undefined,
  logout: () => undefined,
};

function renderGate(auth: Partial<AuthContextValue>, children = <span>private app</span>) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={{ ...baseAuth, ...auth }}>
      <AuthGate
        signedOutFallback={<span>app-specific login</span>}
        tenantRequiredFallback={<span>app-specific tenant selector</span>}
      >
        {children}
      </AuthGate>
    </AuthContext.Provider>
  );
}

describe('AuthGate', () => {
  it('shows a loading state while the session is being resolved', () => {
    expect(renderGate({ status: 'loading' })).toContain('Loading authentication');
  });

  it('shows the login screen when the user is signed out', () => {
    expect(renderGate({ status: 'signedOut' })).toContain('app-specific login');
  });

  it('shows tenant selection when a tenant is required', () => {
    expect(renderGate({ status: 'tenantRequired', allTenants: [] })).toContain(
      'app-specific tenant selector',
    );
  });

  it('renders private application content when authentication is ready', () => {
    expect(renderGate({ status: 'ready' })).toContain('private app');
  });
});
