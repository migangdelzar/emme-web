import type { BusinessProfile, CurrentUser, TenantMembership } from "@emme/api";

export type AuthStatus = "loading" | "signedOut" | "tenantRequired" | "ready";

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
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
