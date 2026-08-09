import type { ApiRequest } from './api-request.js';
import type { ApiResponse } from './api-response.js';

export interface ApiTransport {
  readonly requests: ApiRequest[];
  send<TData>(request: ApiRequest): Promise<ApiResponse<TData>>;
}

export interface ApiTenantContext {
  readonly id: string;
}

export interface ApiClientOptions {
  readonly transport: ApiTransport;
  readonly tenant?: ApiTenantContext;
}

export interface ApiClient {
  request<TData>(request: ApiRequest): Promise<ApiResponse<TData>>;
}

export function createApiClient({ transport, tenant }: ApiClientOptions): ApiClient {
  return {
    request: <TData>(request: ApiRequest): Promise<ApiResponse<TData>> => {
      const headers = {
        ...request.headers,
        ...(tenant ? { 'X-Tenant-Id': tenant.id } : {}),
      };

      return transport.send<TData>({ ...request, headers });
    },
  };
}
