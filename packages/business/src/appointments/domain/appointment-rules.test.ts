import { describe, expect, it } from 'vitest';

import {
  canCancelAppointment,
  canRescheduleAppointment,
  hasAppointmentConflict,
} from './appointment.rules.js';
import type { Appointment } from './appointment.types.js';

const appointment: Appointment = {
  id: 'appointment-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  date: '2026-01-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'pending',
};

describe('appointment rules', () => {
  it('allows cancellation only for pending or confirmed appointments', () => {
    expect(canCancelAppointment({ ...appointment, status: 'pending' })).toBe(true);
    expect(canCancelAppointment({ ...appointment, status: 'confirmed' })).toBe(true);
    expect(canCancelAppointment({ ...appointment, status: 'completed' })).toBe(false);
    expect(canCancelAppointment({ ...appointment, status: 'cancelled' })).toBe(false);
  });

  it('allows rescheduling only for active appointments', () => {
    expect(canRescheduleAppointment(appointment)).toBe(true);
    expect(canRescheduleAppointment({ ...appointment, status: 'completed' })).toBe(false);
  });

  it('detects overlapping appointments on the same date', () => {
    const overlapping = {
      ...appointment,
      id: 'appointment-2',
      startTime: '10:30',
      endTime: '11:30',
    };
    const separate = { ...appointment, id: 'appointment-3', startTime: '11:00', endTime: '12:00' };

    expect(hasAppointmentConflict(appointment, overlapping)).toBe(true);
    expect(hasAppointmentConflict(appointment, separate)).toBe(false);
  });
});
