import { afterEach, describe, expect, it } from 'bun:test';

import { provisionTestData } from './seed-data.js';

describe('provisionTestData', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('includes a provisioned artist when creating appointments', async () => {
    const appointments: Array<Record<string, unknown>> = [];
    const services = [
      { id: 'service-1', name: 'Service 1', basePrice: 100, durationMinutes: 30, category: 'Care', status: 'ACTIVE' },
      { id: 'service-2', name: 'Service 2', basePrice: 200, durationMinutes: 45, category: 'Care', status: 'ACTIVE' },
      { id: 'service-3', name: 'Service 3', basePrice: 300, durationMinutes: 60, category: 'Care', status: 'ACTIVE' },
    ];
    const customers = [
      { id: 'customer-1', name: 'Customer 1' },
      { id: 'customer-2', name: 'Customer 2' },
      { id: 'customer-3', name: 'Customer 3' },
    ];
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;

      if (method === 'GET' && url.endsWith('/api/customers')) return json(customers);
      if (method === 'GET' && url.endsWith('/api/services')) return json(services);
      if (method === 'GET' && url.endsWith('/api/artists')) return json([]);
      if (method === 'GET' && url.endsWith('/api/appointments')) return json([]);
      if (method === 'POST' && url.endsWith('/api/services')) return json(services[0], 201);
      if (method === 'POST' && url.endsWith('/api/artists')) return json({ id: 'artist-1', name: body.name }, 201);
      if (method === 'POST' && url.endsWith('/api/customers')) return json(customers[0], 201);
      if (method === 'POST' && url.endsWith('/api/appointments')) {
        appointments.push(body);
        return json({ id: `appointment-${appointments.length}`, customerId: body.customerId, serviceId: body.serviceId, startsAt: body.startsAt, endsAt: body.endsAt, status: 'CONFIRMED' }, 201);
      }
      throw new Error(`Unexpected ${method} ${url}`);
    };
    globalThis.fetch = fetchMock;

    await provisionTestData('token', 'e2e-studio');

    expect(appointments).toHaveLength(2);
    expect(appointments.every((appointment) => appointment.artistId === 'artist-1')).toBe(true);
    expect(appointments.every((appointment) => Date.parse(String(appointment.startsAt)) > Date.now())).toBe(true);
  });
});

const originalFetch = globalThis.fetch;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
