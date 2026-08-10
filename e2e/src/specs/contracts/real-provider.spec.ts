import { test, expect } from '@playwright/test';
import { RealProvider } from '@providers/RealProvider';

const user = {
  userId: 'e2e-user-1',
  tenantId: 'e2e-tenant-1',
  memberships: [{ tenantId: 'e2e-tenant-1', tenantName: 'E2E Studio', tenantSlug: 'e2e-studio', role: 'OWNER' as const }],
  name: 'E2E User 1',
  email: 'e2e-1@emme.app',
};

function responseFor(pathname: string, method: string): Record<string, unknown> {
  if (method === 'POST' && pathname === '/api/customers') return { id: 'customer-created', name: 'Run Customer', phone: '555-0100' };
  if (method === 'POST' && pathname === '/api/services') return { id: 'service-created', name: 'Run Service', basePrice: 500, durationMinutes: 60, category: 'Test', isActive: true };
  if (method === 'POST' && pathname === '/api/appointments') return { id: 'appointment-created', customerId: 'customer-created', serviceId: 'service-created', startsAt: '2026-08-10T10:00:00', endsAt: '2026-08-10T11:00:00', status: 'SCHEDULED' };
  if (method === 'POST' && pathname.endsWith('/cancel')) return { id: pathname.split('/')[3], status: 'CANCELLED' };
  return {};
}

test.describe('RealProvider', () => {
  test('seeds through typed APIs and cleans dependent records first', async () => {
    const calls: Array<{ method: string; path: string; headers: Headers }> = [];
    const fetcher: typeof fetch = async (input, init) => {
      const url = new URL(input.toString());
      calls.push({ method: init?.method ?? 'GET', path: url.pathname, headers: new Headers(init?.headers) });
      return new Response(JSON.stringify(responseFor(url.pathname, init?.method ?? 'GET')), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const provider = new RealProvider({ baseUrl: 'https://api.test', fetcher });
    provider.setToken('test-token');
    await provider.setup(undefined as never, user);

    await provider.seed({
      customers: [{ id: 'customer-source', name: 'Run Customer', phone: '555-0100' }],
      services: [{ id: 'service-source', name: 'Run Service', price: 500, duration: 60, category: 'Test', isActive: true }],
      appointments: [{ id: 'appointment-source', clientId: 'customer-source', serviceId: 'service-source', date: '2026-08-10', startTime: '10:00', endTime: '11:00', status: 'pending' }],
    });
    await provider.teardown();

    expect(calls.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'POST /api/customers',
      'POST /api/services',
      'POST /api/appointments',
      'POST /api/appointments/appointment-created/cancel',
      'POST /api/customers/customer-created/retire',
      'POST /api/services/service-created/retire',
    ]);
    expect(calls[0]?.headers.get('API-Version')).toBe('1.0');
    expect(calls[0]?.headers.get('Authorization')).toBe('Bearer test-token');
    expect(calls[0]?.headers.get('X-Emme-Tenant-Slug')).toBe('e2e-studio');
  });

  test('rejects setup without a configured base URL or browser token', async () => {
    const provider = new RealProvider({ baseUrl: 'https://api.test', fetcher: fetch });
    await expect(provider.setup(undefined as never, user)).rejects.toThrow('authenticated browser token');
  });

  test('surfaces cleanup failures instead of silently swallowing them', async () => {
    const fetcher: typeof fetch = async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path === '/api/customers') {
        return new Response(JSON.stringify({ id: 'customer-created', name: 'Run Customer', phone: '555-0100' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ detail: 'failure' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    };
    const provider = new RealProvider({ baseUrl: 'https://api.test', fetcher });
    provider.setToken('test-token');
    await provider.setup(undefined as never, user);

    await provider.seed({
      customers: [{ id: 'customer-source', name: 'Run Customer', phone: '555-0100' }],
    });
    await expect(provider.teardown()).rejects.toThrow('cleanup failed');
  });
});
