import type { Appointment } from "@emme/domain";

export interface AppointmentFilters {
  date?: string;
  status?: Appointment["status"];
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  list(filters?: AppointmentFilters): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
}
