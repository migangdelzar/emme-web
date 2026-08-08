import { describe, expect, it } from 'vitest';
import { ValidationError, type ValidationIssue } from './validation-error.js';

describe('ValidationError', () => {
  it('preserves structured validation issues and exposes a stable message', () => {
    const issues: ValidationIssue[] = [
      { path: ['email'], code: 'invalid_email', message: 'Enter a valid email address.' },
    ];

    const error = new ValidationError(issues);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Validation failed');
    expect(error.issues).toEqual(issues);
  });
});
