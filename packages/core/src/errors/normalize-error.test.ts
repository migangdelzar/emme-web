import { describe, expect, it } from 'vitest';

import { ApplicationError } from './application-error.js';
import { normalizeError } from './normalize-error.js';

describe('normalizeError', () => {
  it('preserves diagnostic codes for known application errors', () => {
    const error = new ApplicationError('Forbidden', 'FORBIDDEN');

    expect(normalizeError(error)).toBe(error);
    expect(normalizeError(error).code).toBe('FORBIDDEN');
  });

  it('returns a safe unknown application error for arbitrary values', () => {
    const error = normalizeError({ secret: 'must not escape' });

    expect(error.code).toBe('UNKNOWN');
    expect(error.message).toBe('An unexpected error occurred');
    expect(error.message).not.toContain('secret');
  });
});
