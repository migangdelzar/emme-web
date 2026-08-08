import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthState, AuthContextValue } from './auth.types.js';
import type { CurrentUser } from '@emme/api';
import { AuthProvider as CoreAuthProvider } from './auth-provider.js';
import { useApi } from '../runtime/use-api.js';

export interface SessionTokenStorage {
  get(): { accessToken: string | null; refreshToken: string | null };
  set(tokens: { accessToken: string; refreshToken?: string }): void;
  clear(): void;
}

export interface SessionTenantStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  tokenStorage: SessionTokenStorage;
  tenantStorage: SessionTenantStorage;
}

export function SessionProvider({ children, tokenStorage, tenantStorage }: SessionProviderProps) {
  const api = useApi();
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    tenant: null,
    allTenants: [],
    profile: null,
    error: null,
  });

  // Check session on mount: try JWT token first, fall back to session cookie
  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const token = tokenStorage.get().accessToken;
        // No token → user is not authenticated; skip /api/me call
        if (!token) {
          if (!cancelled) setState((s) => ({ ...s, status: 'signedOut' }));
          return;
        }
        const user: CurrentUser = await api.auth.currentUser();
        if (!cancelled) {
          const firstMembership = user.memberships?.[0];
          if (firstMembership) {
            tenantStorage.set('tenant_slug', firstMembership.tenantSlug);
          }
          setState((s) => ({
            ...s,
            status: 'ready',
            user,
            allTenants: user.memberships ?? [],
            tenant: firstMembership ?? null,
          }));
        }
      } catch {
        tokenStorage.clear();
        if (!cancelled) setState((s) => ({ ...s, status: 'signedOut' }));
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [api, tenantStorage, tokenStorage]);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const data = await api.auth.login({ email, password });
        const token = data.accessToken;
        const user: CurrentUser = data.user; // login response already has full user data

        // Store token and tenant for subsequent API calls
        tokenStorage.set({ accessToken: token, refreshToken: data.refreshToken });
        const firstMembership = user.memberships?.[0];
        if (firstMembership) {
          tenantStorage.set('tenant_slug', firstMembership.tenantSlug);
        }

        setState((s) => ({
          ...s,
          status: 'ready',
          user,
          allTenants: user.memberships ?? [],
          tenant: user.memberships?.[0] ?? null,
          error: null,
        }));
      } catch {
        setState((s) => ({ ...s, status: 'signedOut', error: 'Error de conexión' }));
      }
    },
    [api, tenantStorage, tokenStorage]
  );

  const selectTenant = useCallback(
    (slug: string) => {
      setState((s) => {
        const tenant = s.allTenants.find((t) => t.tenantSlug === slug) ?? null;
        if (tenant) {
          tenantStorage.set('tenant_slug', slug);
        }
        return { ...s, tenant, status: 'ready', error: null };
      });
    },
    [tenantStorage]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    tenantStorage.remove('tenant_slug');
    setState((s) => ({ ...s, status: 'signedOut', user: null, tenant: null, allTenants: [] }));
    window.location.href = '/';
  }, [tenantStorage, tokenStorage]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      selectTenant,
      logout,
    }),
    [state, login, selectTenant, logout]
  );

  return <CoreAuthProvider value={value}>{children}</CoreAuthProvider>;
}
