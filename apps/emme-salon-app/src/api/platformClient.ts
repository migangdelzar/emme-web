import { createApiClient, type ApiClient, type ApiClientOptions } from '@emme/infrastructure';

import type { RuntimeConfig } from '../app/config/runtimeConfig';

export interface PlatformClientOptions {
  runtimeConfig: RuntimeConfig;
  getAccessToken?: ApiClientOptions['getAccessToken'];
  getTenantSlug?: ApiClientOptions['getTenantSlug'];
  fetcher?: ApiClientOptions['fetcher'];
}

export function createPlatformClient(options: PlatformClientOptions): ApiClient {
  return createApiClient({
    baseUrl: options.runtimeConfig.apiBaseUrl,
    getAccessToken: options.getAccessToken,
    getTenantSlug: options.getTenantSlug,
    fetcher: options.fetcher,
  });
}
