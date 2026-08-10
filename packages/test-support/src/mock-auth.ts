import type { AuthContextValue } from '@emme/core';

export function createFakeAuthState(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    status: 'signedOut',
    accessToken: null,
    user: null,
    tenant: null,
    allTenants: [],
    profile: null,
    error: null,
    login: async () => undefined,
    selectTenant: () => undefined,
    logout: () => undefined,
    ...overrides,
  };
}
