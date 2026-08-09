import { describe, expect, it } from 'vitest';
import { mapConnectionPayload } from './index.js';

const payload = {
  id: 'connection-1',
  tenantId: 'tenant-1',
  provider: 'google-calendar',
  accountEmail: 'owner@example.com',
  connected: true,
};

describe('mapConnectionPayload', () => {
  it('rejects unknown providers', () => {
    expect(() => mapConnectionPayload({ ...payload, provider: 'unknown' })).toThrow(/provider/i);
  });
});
