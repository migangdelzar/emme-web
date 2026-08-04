import { createPlatformClient } from './platformClient';
import { getRuntimeConfig } from '@/config/runtimeConfig';
import type { ApiClient } from '@emme/api-client';

let clientInstance: ApiClient | null = null;
let lastGetAccessToken: unknown = undefined;
let lastGetTenantSlug: unknown = undefined;

export function getApiClient(
  getAccessToken?: () => Promise<string | null> | string | null,
  getTenantSlug?: () => string | null
): ApiClient {
  const functionsChanged =
    getAccessToken !== lastGetAccessToken || getTenantSlug !== lastGetTenantSlug;

  if (!clientInstance || (functionsChanged && (getAccessToken || getTenantSlug))) {
    clientInstance = createPlatformClient({
      runtimeConfig: getRuntimeConfig(),
      getAccessToken,
      getTenantSlug,
    });
    lastGetAccessToken = getAccessToken;
    lastGetTenantSlug = getTenantSlug;
  }
  return clientInstance;
}

export function resetApiClient(): void {
  clientInstance = null;
  lastGetAccessToken = undefined;
  lastGetTenantSlug = undefined;
}
