import { InvalidAppointmentTimeRangeError } from './appointment-errors.js';

export interface AppointmentTimeRange {
  readonly startTime: string;
  readonly endTime: string;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function createAppointmentTimeRange(
  startTime: string,
  endTime: string
): AppointmentTimeRange {
  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime) || startTime >= endTime) {
    throw new InvalidAppointmentTimeRangeError();
  }

  return { startTime, endTime };
}
