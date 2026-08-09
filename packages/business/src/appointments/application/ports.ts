import type { Appointment } from '../domain/appointment.types.js';

export interface AppointmentFilters {
  readonly date?: string;
  readonly status?: Appointment['status'];
  readonly tenantId?: string;
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  list(filters?: AppointmentFilters): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
}

export interface AvailabilityQuery {
  readonly date: string;
  readonly serviceId: string;
  readonly tenantId?: string;
}

export interface AvailabilitySlot {
  readonly startTime: string;
  readonly endTime: string;
}

export interface AvailabilityRepository {
  findAvailableSlots(query: AvailabilityQuery): Promise<AvailabilitySlot[]>;
}

export interface NotificationPort {
  appointmentChanged(appointment: Appointment): Promise<void>;
}

export interface AppointmentIdGenerator {
  next(): string;
}
