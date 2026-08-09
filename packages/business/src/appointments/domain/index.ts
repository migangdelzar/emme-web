export type { AppointmentStatus } from "./appointment-status.js";
export type { Appointment } from "./appointment.types.js";
export { canCancelAppointment } from "./appointment.rules.js";
export {
  canRescheduleAppointment,
  hasAppointmentConflict,
} from './appointment.rules.js';
export {
  AppointmentConflictError,
  AppointmentNotCancellableError,
  AppointmentNotFoundError,
  AppointmentTenantMismatchError,
  InvalidAppointmentTimeRangeError,
} from './appointment-errors.js';
export { createAppointmentTimeRange, type AppointmentTimeRange } from './appointment-time-range.js';
export { assertAppointmentTenant, type AppointmentTenantIdentity } from './appointment-tenant.js';
