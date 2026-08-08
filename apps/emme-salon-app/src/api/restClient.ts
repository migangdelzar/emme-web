import { createBrowserTokenStorage, createHttpClient } from '@emme/infrastructure';
import type { HttpClient } from '@emme/infrastructure';

import { getRuntimeConfig } from '@/app/config/runtimeConfig';

async function getToken(): Promise<string | null> {
  try {
    return typeof window === 'undefined' ? null : createBrowserTokenStorage().get().accessToken;
  } catch {
    return null;
  }
}

function getTenantSlug(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem('tenant_slug');
  } catch {
    return null;
  }
}

let client: HttpClient | undefined;

function getClient(): HttpClient {
  client ??= createHttpClient({
    baseUrl: getRuntimeConfig().apiBaseUrl,
    getAccessToken: getToken,
    getTenantSlug,
  });
  return client;
}

/** Shared application transport. Domain hooks depend on this port, not fetch. */
export const api: HttpClient = {
  get: <T>(path: string, params?: Record<string, string>) => getClient().get<T>(path, params),
  post: <T>(path: string, body?: unknown) => getClient().post<T>(path, body),
  put: <T>(path: string, body?: unknown) => getClient().put<T>(path, body),
  patch: <T>(path: string, body?: unknown) => getClient().patch<T>(path, body),
  delete: <T>(path: string) => getClient().delete<T>(path),
};
