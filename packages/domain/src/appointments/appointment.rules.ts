import type { Appointment } from "./appointment.types.js";

export function canCancelAppointment(appointment: Appointment): boolean {
  return appointment.status === "pending" || appointment.status === "confirmed";
}
