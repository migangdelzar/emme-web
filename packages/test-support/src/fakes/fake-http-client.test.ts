import { describe, expect, it } from 'vitest';

import { FakeHttpClient } from './fake-http-client.js';

describe('FakeHttpClient', () => {
  it('returns queued responses in request order and records requests', async () => {
    const http = new FakeHttpClient();
    http.enqueue({ id: 'service-1' });

    await expect(http.get<{ id: string }>('/services')).resolves.toEqual({ id: 'service-1' });
    expect(http.requests[0]).toMatchObject({ method: 'GET', path: '/services' });
  });

  it('rejects requests with the injected error', async () => {
    const http = new FakeHttpClient();
    http.error = new Error('offline');

    await expect(http.get('/services')).rejects.toThrow('offline');
  });
});
