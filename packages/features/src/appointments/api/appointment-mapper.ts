import {
  asRecord,
  firstStringField,
  optionalStringField,
  stringField,
} from '@emme/api';
import type { Appointment, AppointmentStatus } from '../domain/appointment.types.js';

const STATUS_MAP: Readonly<Record<string, AppointmentStatus>> = {
  PENDING: 'pending',
  SCHEDULED: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

function mapStatus(value: string): AppointmentStatus {
  const status = STATUS_MAP[value.toUpperCase()];
  if (!status) throw new Error(`Invalid appointment status: ${value}`);
  return status;
}

function splitTimestamp(value: string): { date: string; time: string } {
  const [date, time] = value.split('T');
  return { date: date ?? '', time: time?.slice(0, 5) ?? '' };
}

export function mapAppointmentPayload(payload: unknown): Appointment {
  const raw = asRecord(payload, 'appointment');
  const startsAt = optionalStringField(raw, 'startsAt');
  const endsAt = optionalStringField(raw, 'endsAt');
  const start = startsAt ? splitTimestamp(startsAt) : undefined;
  const end = endsAt ? splitTimestamp(endsAt) : undefined;
  const date = optionalStringField(raw, 'date') ?? start?.date;

  const appointment: Appointment = {
    id: stringField(raw, 'id', 'appointment'),
    clientId: firstStringField(raw, ['customerId', 'clientId']),
    serviceId: stringField(raw, 'serviceId', 'appointment'),
    date: date ?? '',
    startTime: start?.time ?? stringField(raw, 'startTime', 'appointment'),
    endTime: end?.time ?? stringField(raw, 'endTime', 'appointment'),
    status: mapStatus(stringField(raw, 'status', 'appointment')),
    ...(optionalStringField(raw, 'tenantId')
      ? { tenantId: optionalStringField(raw, 'tenantId') }
      : {}),
    ...(optionalStringField(raw, 'customerName')
      ? { customerName: optionalStringField(raw, 'customerName') }
      : {}),
    ...(optionalStringField(raw, 'notes') ? { notes: optionalStringField(raw, 'notes') } : {}),
  };

  if (!appointment.clientId) throw new Error('Invalid appointment response: clientId is required');
  if (!appointment.date) throw new Error('Invalid appointment response: date is required');
  return appointment;
}
