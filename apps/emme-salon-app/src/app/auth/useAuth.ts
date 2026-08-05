import { createContext, useContext } from 'react';
import type { BusinessProfile, CurrentUser, TenantMembership } from '@emme/contracts';

export type AuthStatus = 'loading' | 'signedOut' | 'tenantRequired' | 'ready';

export interface AuthState {
  status: AuthStatus;
  user: CurrentUser | null;
  tenant: TenantMembership | null;
  allTenants: TenantMembership[];
  profile: BusinessProfile | null;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  selectTenant: (slug: string) => void;
  logout: () => void;
}

export type AuthContextValue = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
