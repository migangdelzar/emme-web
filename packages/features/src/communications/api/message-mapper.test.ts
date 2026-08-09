import { describe, expect, it } from 'vitest';
import { mapMessagePayload } from './index.js';

const payload = {
  id: 'message-1',
  conversationId: 'conversation-1',
  role: 'user',
  channel: 'web',
  content: 'Hello',
  createdAt: '2026-01-01T10:00:00Z',
};

describe('mapMessagePayload', () => {
  it('rejects unknown roles and channels', () => {
    expect(() => mapMessagePayload({ ...payload, role: 'unknown' })).toThrow(/role/i);
    expect(() => mapMessagePayload({ ...payload, channel: 'unknown' })).toThrow(/channel/i);
  });
});
