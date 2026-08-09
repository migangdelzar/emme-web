import type { AppointmentApi } from '@emme/api';
import type { AppointmentRepository, AppointmentFilters } from '../application/ports.js';
import type { Appointment } from '../domain/appointment.types.js';

export function createAppointmentRepository(api: AppointmentApi): AppointmentRepository {
  return {
    findById: (id) => api.getById(id),
    list: (filters?: AppointmentFilters) =>
      api.list(filters?.date ? { date: filters.date } : undefined),
    save: async (appointment: Appointment): Promise<Appointment> => {
      if (appointment.status !== 'cancelled') {
        throw new Error('Only appointment cancellation is supported by this adapter');
      }
      return api.cancel(appointment.id);
    },
  };
}
