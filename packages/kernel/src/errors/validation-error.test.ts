import { describe, expect, it } from 'vitest';

import { ValidationError, type ValidationIssue } from './validation-error.js';

describe('ValidationError', () => {
  it('preserves structured issues and a stable message', () => {
    const issues: readonly ValidationIssue[] = [
      { path: ['email'], code: 'invalid_email', message: 'Enter a valid email address.' },
    ];
    const error = new ValidationError(issues);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.code).toBe('validation.failed');
    expect(error.message).toBe('Validation failed');
    expect(error.issues).toEqual(issues);
  });
});
