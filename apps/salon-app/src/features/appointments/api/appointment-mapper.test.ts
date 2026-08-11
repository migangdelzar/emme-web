import { describe, expect, it } from 'vitest';

import { mapAppointmentPayload } from './appointment-mapper.js';

describe('mapAppointmentPayload', () => {
  it('maps customerId and ISO timestamps to the feature model', () => {
    expect(
      mapAppointmentPayload({
        id: 'appointment-1',
        customerId: 'customer-1',
        serviceId: 'service-1',
        startsAt: '2026-01-15T10:00:00Z',
        endsAt: '2026-01-15T11:00:00Z',
        status: 'SCHEDULED',
      })
    ).toMatchObject({
      id: 'appointment-1',
      clientId: 'customer-1',
      date: '2026-01-15',
      startTime: '10:00',
      endTime: '11:00',
      status: 'pending',
    });
  });

  it('accepts clientId and canonical split fields', () => {
    expect(
      mapAppointmentPayload({
        id: 'appointment-2',
        clientId: 'client-1',
        serviceId: 'service-1',
        date: '2026-01-15',
        startTime: '10:00',
        endTime: '11:00',
        status: 'CONFIRMED',
      }).status
    ).toBe('confirmed');
  });

  it('rejects malformed payloads instead of inventing identifiers', () => {
    expect(() => mapAppointmentPayload({ status: 'CONFIRMED' })).toThrow(/appointment.*id/i);
    expect(() =>
      mapAppointmentPayload({
        id: 'appointment-1',
        customerId: 'client-1',
        serviceId: 'service-1',
        date: '2026-01-15',
        startTime: '10:00',
        endTime: '11:00',
        status: 'UNKNOWN',
      })
    ).toThrow(/status/i);
  });
});
