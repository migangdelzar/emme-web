import { describe, expect, it } from 'vitest';

import { mapAppointmentView } from './appointmentViewMapper';

describe('mapAppointmentView', () => {
  it('maps transport timestamps and normalized statuses to the application model', () => {
    expect(
      mapAppointmentView({
        id: 'appointment-1',
        customerName: 'Ada',
        clientId: 'customer-1',
        serviceId: 'service-1',
        startTime: '2026-07-31T09:00:00',
        endTime: '2026-07-31T10:00:00',
        status: 'confirmed',
      })
    ).toEqual({
      id: 'appointment-1',
      clientId: 'customer-1',
      serviceId: 'service-1',
      date: '2026-07-31',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
    });
  });

  it('accepts canonical split date and time fields', () => {
    expect(
      mapAppointmentView({
        id: 'appointment-2',
        customerName: 'Ada',
        date: '2026-07-31',
        clientId: 'customer-1',
        serviceId: 'service-1',
        startTime: '09:00',
        endTime: '10:00',
        status: 'CONFIRMED',
      })
    ).toMatchObject({
      date: '2026-07-31',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
    });
  });
});
