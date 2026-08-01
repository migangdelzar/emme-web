import { describe, expect, it } from 'vitest';

import { createAppointmentApi } from './appointments.js';
import { createClientApi } from './clients.js';
import { createServiceApi } from './services.js';

describe('contract API adapters', () => {
  it('maps the canonical appointment response without leaking transport fields', async () => {
    const api = createAppointmentApi(new FakeHttpClient([
      {
        id: 'appointment-1',
        customerId: 'customer-1',
        serviceId: 'service-1',
        startsAt: '2026-07-31T09:00:00Z',
        endsAt: '2026-07-31T10:00:00Z',
        status: 'CONFIRMED',
      },
    ]));

    await expect(api.list()).resolves.toEqual([{
      id: 'appointment-1',
      clientId: 'customer-1',
      serviceId: 'service-1',
      date: '2026-07-31',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
      notes: undefined,
    }]);
  });

  it('accepts legacy service aliases while producing one view model', async () => {
    const api = createServiceApi(new FakeHttpClient([
      { id: 'service-1', name: 'Gel', price: 500, duration: 60, isActive: true },
    ]));

    await expect(api.list()).resolves.toEqual([{
      id: 'service-1',
      name: 'Gel',
      price: 500,
      duration: 60,
      category: '',
      isActive: true,
      description: undefined,
    }]);
  });

  it('fails closed for malformed customer payloads', async () => {
    const api = createClientApi(new FakeHttpClient([{ name: 'Missing id' }]));

    await expect(api.list()).rejects.toThrow('Invalid customer response: id must be a string');
  });
});

class FakeHttpClient {
  public constructor(private readonly response: unknown) {}

  get<T>(_path: string): Promise<T> {
    return Promise.resolve(this.response as T);
  }

  post<T>(_path: string, _body?: unknown): Promise<T> {
    return Promise.resolve(this.response as T);
  }

  put<T>(_path: string, _body?: unknown): Promise<T> {
    return Promise.resolve(this.response as T);
  }

  patch<T>(_path: string, _body?: unknown): Promise<T> {
    return Promise.resolve(this.response as T);
  }

  delete<T>(_path: string): Promise<T> {
    return Promise.resolve(undefined as T);
  }
}
