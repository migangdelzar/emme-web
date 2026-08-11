import { describe, expect, it } from 'vitest';
import { createApi } from './create-api.js';

describe('createApi', () => {
  it('composes capability APIs over one injected HTTP port', async () => {
    const api = createApi(new FakeHttpClient());

    expect(api.auth).toBeDefined();
    await expect(api.clients.list()).resolves.toEqual([]);
    await expect(api.appointments.list()).resolves.toEqual([]);
    await expect(api.services.list()).resolves.toEqual([]);
    expect(api.calendarSync).toBeDefined();
    expect(api.googleOAuth).toBeDefined();
    expect(api.googleSheets).toBeDefined();
    expect(api.businessConfig).toBeDefined();
  });
});

class FakeHttpClient {
  async get<T>(): Promise<T> {
    return [] as T;
  }

  async post<T>(): Promise<T> {
    return undefined as T;
  }

  async put<T>(): Promise<T> {
    return undefined as T;
  }

  async patch<T>(): Promise<T> {
    return undefined as T;
  }

  async delete<T>(): Promise<T> {
    return undefined as T;
  }
}
