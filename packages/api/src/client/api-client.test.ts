import { describe, expect, it } from 'vitest';

import { createApiClient, type ApiRequest, type ApiResponse, type ApiTransport } from './index.js';

describe('ApiClient', () => {
  it('requires a tenant context for tenant-scoped requests', async () => {
    const fakeTransport: ApiTransport = {
      requests: [],
      async send<TData>(request: ApiRequest): Promise<ApiResponse<TData>> {
        this.requests.push(request);
        return { status: 200, data: { ok: true } as TData, headers: {} };
      },
    };
    const client = createApiClient({ transport: fakeTransport, tenant: { id: 'tenant-1' } });

    await client.request({ method: 'GET', path: '/appointments' });

    expect(fakeTransport.requests[0]?.headers?.['X-Tenant-Id']).toBe('tenant-1');
  });

  it('preserves typed response data', async () => {
    const fakeTransport: ApiTransport = {
      requests: [],
      async send<TData>(request: ApiRequest): Promise<ApiResponse<TData>> {
        this.requests.push(request);
        return { status: 200, data: { id: 'appointment-1' } as TData, headers: {} };
      },
    };

    const response = await createApiClient({ transport: fakeTransport }).request<{ id: string }>({
      method: 'GET',
      path: '/appointments/appointment-1',
    });

    expect(response.data.id).toBe('appointment-1');
  });
});
