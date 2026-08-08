import type { Appointment } from '@emme/domain';
import type { AppointmentFilters, AppointmentRepository } from '../ports/appointment-repository.js';

interface ListSalonAppointmentsDependencies {
  appointments: AppointmentRepository;
}

export function listSalonAppointments(
  dependencies: ListSalonAppointmentsDependencies,
) {
  return (filters?: AppointmentFilters): Promise<Appointment[]> =>
    dependencies.appointments.list(filters);
}
