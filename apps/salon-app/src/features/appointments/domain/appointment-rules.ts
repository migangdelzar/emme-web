import type { Appointment } from './appointment.types.js';

export function canCancelAppointment(appointment: Appointment): boolean {
  return appointment.status === 'pending' || appointment.status === 'confirmed';
}

export function canRescheduleAppointment(appointment: Appointment): boolean {
  return appointment.status === 'pending' || appointment.status === 'confirmed';
}

export function hasAppointmentConflict(first: Appointment, second: Appointment): boolean {
  if (first.date !== second.date || first.id === second.id) return false;

  return first.startTime < second.endTime && second.startTime < first.endTime;
}
