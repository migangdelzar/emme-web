export {
  canCancelAppointment,
  canRescheduleAppointment,
  hasAppointmentConflict,
} from './appointment-rules.js';
export {
  AppointmentConflictError,
  AppointmentNotCancellableError,
  AppointmentNotFoundError,
  AppointmentTenantMismatchError,
  InvalidAppointmentTimeRangeError,
} from './appointment-errors.js';
export { createAppointmentTimeRange, type AppointmentTimeRange } from './appointment-time-range.js';
export { assertAppointmentTenant, type AppointmentTenantIdentity } from './appointment-tenant.js';
export type { Appointment, AppointmentStatus } from './appointment.types.js';
