import type { Appointment } from "@emme/domain";

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  save(appointment: Appointment): Promise<Appointment>;
}
