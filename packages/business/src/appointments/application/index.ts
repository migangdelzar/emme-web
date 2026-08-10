export {
  bookAppointment,
  cancelAppointment,
  findAvailableSlots,
  getAppointment,
  listAppointments,
  rescheduleAppointment,
  type BookAppointmentInput,
  type RescheduleAppointmentInput,
} from './use-cases.js';
export { listAppointments as listSalonAppointments } from './use-cases.js';
export type {
  AppointmentFilters,
  AppointmentIdGenerator,
  AppointmentRepository,
  AvailabilityRepository,
  AvailabilityQuery,
  AvailabilitySlot,
  NotificationPort,
} from './ports.js';
