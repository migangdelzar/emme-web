import { describe, expect, expectTypeOf, it } from 'vitest';

import { DomainError } from './domain-error.js';

describe('DomainError', () => {
  it('preserves a stable code and safe message', () => {
    const error = new DomainError('appointment.conflict', 'Appointment conflicts');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('appointment.conflict');
    expect(error.message).toBe('Appointment conflicts');
    expect(error.name).toBe('DomainError');
  });

  it('exposes its code as a readonly string', () => {
    const error = new DomainError('appointment.conflict', 'Appointment conflicts');

    expectTypeOf(error.code).toEqualTypeOf<string>();
  });
});
