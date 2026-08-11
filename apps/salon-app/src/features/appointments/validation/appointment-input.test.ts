import { describe, expect, it } from 'vitest';

import { validateAppointmentInput } from './appointment-input.js';

describe('validateAppointmentInput', () => {
  it('returns no issues for a valid booking input', () => {
    expect(
      validateAppointmentInput({
        clientId: 'client-1',
        serviceId: 'service-1',
        date: '2026-01-15',
        startTime: '10:00',
        endTime: '11:00',
      })
    ).toEqual([]);
  });

  it('reports missing identifiers and invalid time ordering', () => {
    expect(
      validateAppointmentInput({
        clientId: '',
        serviceId: '',
        date: '2026-01-15',
        startTime: '11:00',
        endTime: '10:00',
      })
    ).toEqual(
      expect.arrayContaining([
        { field: 'clientId', message: 'Client is required' },
        { field: 'serviceId', message: 'Service is required' },
        { field: 'endTime', message: 'End time must be after start time' },
      ])
    );
  });
});
