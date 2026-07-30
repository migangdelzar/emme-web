import type { Appointment } from '@emme/contracts';

const todayStr = () => new Date().toISOString().split('T')[0];

export const makeAppointment = (overrides?: Partial<Appointment>): Appointment => ({
  id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  clientId: 'cust-1',
  serviceId: 'svc-1',
  date: todayStr(),
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed',
  ...overrides,
});

export const makeAppointments = (count: number, overrides?: Partial<Appointment>): Appointment[] =>
  Array.from({ length: count }, (_, i) =>
    makeAppointment({
      id: `apt-${i + 1}`,
      startTime: `${10 + i}:00`,
      endTime: `${11 + i}:00`,
      ...overrides,
    })
  );

export const appointmentCatalog = {
  empty: [] as Appointment[],
  single: [makeAppointment()],
  busyDay: makeAppointments(8),
};
