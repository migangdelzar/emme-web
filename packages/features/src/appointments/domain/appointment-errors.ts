import { DomainError } from '@emme/kernel';

export class AppointmentConflictError extends DomainError {
  constructor(appointmentId: string) {
    super('APPOINTMENT_CONFLICT', `Appointment ${appointmentId} conflicts with an existing appointment`);
  }
}

export class AppointmentNotCancellableError extends DomainError {
  constructor(appointmentId: string) {
    super('APPOINTMENT_NOT_CANCELLABLE', `Appointment ${appointmentId} cannot be cancelled`);
  }
}

export class InvalidAppointmentTimeRangeError extends DomainError {
  constructor() {
    super('INVALID_APPOINTMENT_TIME_RANGE', 'Appointment start time must be before its end time');
  }
}

export class AppointmentTenantMismatchError extends DomainError {
  constructor(tenantId: string) {
    super('APPOINTMENT_TENANT_MISMATCH', `Appointment does not belong to tenant ${tenantId}`);
  }
}

export class AppointmentNotFoundError extends DomainError {
  constructor(appointmentId: string) {
    super('APPOINTMENT_NOT_FOUND', `Appointment not found: ${appointmentId}`);
  }
}
