import { getRuntimeConfig } from '@/config/runtimeConfig';
import { ApiHttpError } from '@emme/api-client';
import type { HttpClient } from '@emme/api-client';

async function getToken(): Promise<string | null> {
  // localStorage fallback (used in E2E tests and dev without Keycloak)
  try {
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) return storedToken;
    }
  } catch {
    /* not in browser */
  }

  return null;
}

async function request<T>(
  path: string,
  init?: RequestInit & { params?: Record<string, string> },
): Promise<T> {
  const config = getRuntimeConfig();
  const baseUrl = config.apiBaseUrl.replace(/\/$/, '');

  const url = new URL(`${baseUrl}${path}`);
  if (init?.params) {
    for (const [key, value] of Object.entries(init.params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const token = await getToken();
  const tenantSlug = typeof localStorage !== 'undefined'
    ? localStorage.getItem('tenant_slug')
    : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(!(init?.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantSlug ? { 'X-Emme-Tenant-Slug': tenantSlug } : {}),
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };

  const res = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiHttpError(
      body.detail || body.message || `HTTP ${res.status}`,
      res.status,
      body,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api: HttpClient = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
