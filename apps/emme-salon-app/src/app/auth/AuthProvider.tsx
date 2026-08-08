import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthState, AuthContextValue } from './useAuth';
import { API_VERSION, type CurrentUser } from '@emme/api';
import { createBrowserTokenStorage } from '@emme/infrastructure';
import { AuthProvider as CoreAuthProvider } from '@emme/core';

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const tokenStorage = useMemo(() => createBrowserTokenStorage(), []);
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
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'API-Version': API_VERSION,
        };

        const res = await fetch('/api/me', { headers });
        if (!res.ok) {
          if (token) {
            tokenStorage.clear();
          }
          if (!cancelled) setState((s) => ({ ...s, status: 'signedOut' }));
          return;
        }
        const user: CurrentUser = await res.json();
        if (!cancelled) {
          const firstMembership = user.memberships?.[0];
          if (firstMembership) {
            localStorage.setItem('tenant_slug', firstMembership.tenantSlug);
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
        if (!cancelled) setState((s) => ({ ...s, status: 'signedOut' }));
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [tokenStorage]);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'API-Version': API_VERSION },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Credenciales inválidas' }));
          setState((s) => ({ ...s, status: 'signedOut', error: err.error }));
          return;
        }
        const data = await res.json();
        const token = data.accessToken;
        const user: CurrentUser = data.user; // login response already has full user data

        // Store token and tenant for subsequent API calls
        tokenStorage.set({ accessToken: token, refreshToken: data.refreshToken });
        const firstMembership = user.memberships?.[0];
        if (firstMembership) {
          localStorage.setItem('tenant_slug', firstMembership.tenantSlug);
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
    [tokenStorage]
  );

  const selectTenant = useCallback((slug: string) => {
    setState((s) => {
      const tenant = s.allTenants.find((t) => t.tenantSlug === slug) ?? null;
      if (tenant) {
        localStorage.setItem('tenant_slug', slug);
      }
      return { ...s, tenant, status: 'ready', error: null };
    });
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    localStorage.removeItem('tenant_slug');
    setState((s) => ({ ...s, status: 'signedOut', user: null, tenant: null, allTenants: [] }));
    window.location.href = '/';
  }, [tokenStorage]);

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
