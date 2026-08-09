import { describe, expect, it } from 'vitest';
import { canDisconnect, createIdempotencyKey } from './index.js';
describe('integrations domain', () => { it('requires idempotency keys and only disconnects active connections', () => { expect(createIdempotencyKey('sync-1')).toBe('sync-1'); expect(() => createIdempotencyKey('')).toThrow(); expect(canDisconnect({ id: 'c', tenantId: 't', provider: 'google-calendar', accountEmail: 'a', connected: true })).toBe(true); }); });
