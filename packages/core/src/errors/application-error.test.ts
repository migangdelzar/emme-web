import { describe, expect, it } from 'vitest';

import { ApplicationError, AuthorizationError, type ErrorCode } from './application-error.js';

describe('application errors', () => {
  it('preserves a stable code and optional cause', () => {
    const cause = new Error('transport failed');
    const error = new ApplicationError('Request failed', 'REQUEST_FAILED', cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('REQUEST_FAILED');
    expect(error.cause).toBe(cause);
  });

  it('models authorization failures separately', () => {
    const error = new AuthorizationError('clients:read');

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.permission).toBe('clients:read');
  });

  it('keeps error codes constrained to the shared contract', () => {
    const code: ErrorCode = 'UNAUTHENTICATED';

    expect(code).toBe('UNAUTHENTICATED');
  });
});
