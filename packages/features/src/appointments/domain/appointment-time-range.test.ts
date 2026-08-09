import { describe, expect, it } from 'vitest';

import { InvalidAppointmentTimeRangeError } from './appointment-errors.js';
import { createAppointmentTimeRange } from './appointment-time-range.js';

describe('createAppointmentTimeRange', () => {
  it('accepts an ordered HH:mm range', () => {
    expect(createAppointmentTimeRange('10:00', '11:30')).toEqual({
      startTime: '10:00',
      endTime: '11:30',
    });
  });

  it('rejects a range that is not ordered', () => {
    expect(() => createAppointmentTimeRange('11:30', '10:00')).toThrow(
      InvalidAppointmentTimeRangeError,
    );
  });

  it('rejects malformed time values', () => {
    expect(() => createAppointmentTimeRange('9:00', '10:00')).toThrow(
      InvalidAppointmentTimeRangeError,
    );
  });
});
