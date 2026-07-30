import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppProvider, useApp } from './AppContext';
import { AuthContext, type AuthContextValue } from '@/auth/useAuth';

vi.mock('@/services/cacheService', () => ({
  cacheService: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

const authContext: AuthContextValue = {
  status: 'signedOut',
  user: null,
  tenant: null,
  allTenants: [],
  profile: null,
  error: null,
  login: vi.fn(),
  selectTenant: vi.fn(),
  logout: vi.fn(),
};

function AppContextTestProviders({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={authContext}>
      <AppProvider>{children}</AppProvider>
    </AuthContext.Provider>
  );
}


describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides the default values properly', () => {
    const { result } = renderHook(() => useApp(), { wrapper: AppContextTestProviders });

    // Assuming tests run with mock, the initial setup should not crash
    expect(result.current.services).toHaveLength(0);
    expect(result.current.isFirstTime).toBe(true);
  });

});
