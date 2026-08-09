import { describe, expect, it } from 'vitest';

import {
  AppointmentConflictError,
  AppointmentNotCancellableError,
  InvalidAppointmentTimeRangeError,
} from './appointment-errors.js';

describe('appointment errors', () => {
  it('exposes stable domain error codes', () => {
    expect(new AppointmentConflictError('appointment-1').code).toBe('APPOINTMENT_CONFLICT');
    expect(new AppointmentNotCancellableError('appointment-1').code).toBe(
      'APPOINTMENT_NOT_CANCELLABLE',
    );
    expect(new InvalidAppointmentTimeRangeError().code).toBe('INVALID_APPOINTMENT_TIME_RANGE');
  });
});
