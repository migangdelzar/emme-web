import {
  AppointmentConflictError,
  AppointmentNotCancellableError,
  AppointmentNotFoundError,
  canCancelAppointment,
  canRescheduleAppointment,
  createAppointmentTimeRange,
  hasAppointmentConflict,
} from '../domain/index.js';
import type { Appointment } from '../domain/appointment.types.js';
import type {
  AppointmentFilters,
  AppointmentIdGenerator,
  AppointmentRepository,
  AvailabilityRepository,
  AvailabilityQuery,
  NotificationPort,
} from './ports.js';

interface AppointmentDependencies {
  readonly appointments: AppointmentRepository;
  readonly notifications?: NotificationPort;
}

interface BookAppointmentDependencies extends AppointmentDependencies {
  readonly ids: AppointmentIdGenerator;
}

export interface BookAppointmentInput {
  readonly clientId: string;
  readonly serviceId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly tenantId?: string;
  readonly notes?: string;
}

export function listAppointments(dependencies: AppointmentDependencies) {
  return (filters?: AppointmentFilters): Promise<Appointment[]> => dependencies.appointments.list(filters);
}

export function getAppointment(dependencies: AppointmentDependencies) {
  return async ({ appointmentId }: { readonly appointmentId: string }): Promise<Appointment> => {
    const appointment = await dependencies.appointments.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundError(appointmentId);
    return appointment;
  };
}

export function cancelAppointment(dependencies: AppointmentDependencies) {
  return async ({ appointmentId }: { readonly appointmentId: string }): Promise<Appointment> => {
    const appointment = await getAppointment(dependencies)({ appointmentId });
    if (!canCancelAppointment(appointment)) throw new AppointmentNotCancellableError(appointmentId);

    const cancelled = await dependencies.appointments.save({ ...appointment, status: 'cancelled' });
    await dependencies.notifications?.appointmentChanged(cancelled);
    return cancelled;
  };
}

export function bookAppointment(dependencies: BookAppointmentDependencies) {
  return async (input: BookAppointmentInput): Promise<Appointment> => {
    const range = createAppointmentTimeRange(input.startTime, input.endTime);
    const existing = await dependencies.appointments.list({ date: input.date, tenantId: input.tenantId });
    const candidate: Appointment = {
      id: dependencies.ids.next(),
      clientId: input.clientId,
      serviceId: input.serviceId,
      date: input.date,
      startTime: range.startTime,
      endTime: range.endTime,
      status: 'pending',
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    };

    if (existing.some((appointment) => hasAppointmentConflict(candidate, appointment))) {
      throw new AppointmentConflictError(candidate.id);
    }

    const booked = await dependencies.appointments.save(candidate);
    await dependencies.notifications?.appointmentChanged(booked);
    return booked;
  };
}

export interface RescheduleAppointmentInput {
  readonly appointmentId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}

export function rescheduleAppointment(dependencies: AppointmentDependencies) {
  return async (input: RescheduleAppointmentInput): Promise<Appointment> => {
    const appointment = await getAppointment(dependencies)({ appointmentId: input.appointmentId });
    if (!canRescheduleAppointment(appointment)) {
      throw new AppointmentNotCancellableError(input.appointmentId);
    }
    const range = createAppointmentTimeRange(input.startTime, input.endTime);
    const candidate = { ...appointment, date: input.date, ...range };
    const existing = await dependencies.appointments.list({ date: input.date });
    if (existing.some((other) => hasAppointmentConflict(candidate, other))) {
      throw new AppointmentConflictError(input.appointmentId);
    }
    const saved = await dependencies.appointments.save(candidate);
    await dependencies.notifications?.appointmentChanged(saved);
    return saved;
  };
}

export function findAvailableSlots(dependencies: { readonly availability: AvailabilityRepository }) {
  return (query: AvailabilityQuery) => dependencies.availability.findAvailableSlots(query);
}
