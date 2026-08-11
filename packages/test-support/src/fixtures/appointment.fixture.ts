import type { Appointment } from '@emme/api';

export function createAppointmentFixture(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'appointment-test',
    clientId: 'client-test',
    serviceId: 'service-test',
    date: '2026-01-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
    ...overrides,
  };
}
