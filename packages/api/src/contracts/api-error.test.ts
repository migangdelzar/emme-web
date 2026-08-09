import { describe, expect, it } from 'vitest';

import { normalizeApiError } from './api-error.js';

describe('normalizeApiError', () => {
  it('preserves recognized backend error codes and safe messages', () => {
    const error = normalizeApiError({ code: 'FORBIDDEN', message: 'Not allowed' });

    expect(error).toEqual({ code: 'FORBIDDEN', message: 'Not allowed' });
  });

  it('normalizes malformed payloads without exposing raw values', () => {
    const error = normalizeApiError({ secret: 'private' });

    expect(error.code).toBe('UNKNOWN');
    expect(error.message).toBe('Request failed');
    expect(error.message).not.toContain('private');
  });
});
