import type { AppointmentApi } from '@emme/api';
import type { Appointment } from '@emme/domain';
import type { AppointmentFilters, AppointmentRepository } from '@emme/application';

export function createAppointmentRepository(api: AppointmentApi): AppointmentRepository {
  return {
    findById: (id) => api.getById(id),
    list: (filters?: AppointmentFilters) => api.list(filters),
    save: async (appointment: Appointment) => {
      if (appointment.status !== 'cancelled') {
        throw new Error('Only appointment cancellation is supported by this adapter');
      }
      return api.cancel(appointment.id);
    },
  };
}
