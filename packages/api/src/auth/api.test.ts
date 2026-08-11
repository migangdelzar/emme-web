import { describe, expect, it } from 'vitest';

import { createAuthApi } from './api.js';

describe('createAuthApi', () => {
  it('loads the current user through the session route', async () => {
    const http = new FakeHttpClient({
      userId: 'user-1',
      email: 'owner@example.com',
      displayName: 'Owner',
      memberships: [],
      profile: null,
    });
    const api = createAuthApi(http);

    await expect(api.currentUser()).resolves.toEqual(http.response);
    expect(http.calls).toEqual([{ method: 'GET', path: '/api/me' }]);
  });

  it('sends login credentials through the auth route', async () => {
    const http = new FakeHttpClient({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: {
        userId: 'user-1',
        email: 'owner@example.com',
        displayName: 'Owner',
        memberships: [],
        profile: null,
      },
    });
    const api = createAuthApi(http);

    await expect(api.login({ email: 'owner@example.com', password: 'secret' })).resolves.toEqual(
      http.response
    );
    expect(http.calls).toEqual([
      {
        method: 'POST',
        path: '/api/auth/login',
        body: { email: 'owner@example.com', password: 'secret' },
      },
    ]);
  });
});

class FakeHttpClient {
  readonly calls: Array<Record<string, unknown>> = [];

  constructor(readonly response: unknown) {}

  async get<T>(path: string): Promise<T> {
    this.calls.push({ method: 'GET', path });
    return this.response as T;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    this.calls.push({ method: 'POST', path, body });
    return this.response as T;
  }

  async put<T>(): Promise<T> {
    return this.response as T;
  }

  async patch<T>(): Promise<T> {
    return this.response as T;
  }

  async delete<T>(): Promise<T> {
    return this.response as T;
  }
}
