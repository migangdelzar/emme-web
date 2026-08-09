import { describe, expect, it } from 'vitest';

import type { AppointmentApi } from '@emme/api';
import { createAppointmentRepository } from './appointment-repository.js';

describe('createAppointmentRepository', () => {
  it('delegates list and cancellation to the API port', async () => {
    const api = new FakeAppointmentApi();
    const repository = createAppointmentRepository(api);

    await repository.list({ date: '2026-01-15' });
    await repository.save({
      id: 'appointment-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      date: '2026-01-15',
      startTime: '10:00',
      endTime: '11:00',
      status: 'cancelled',
    });

    expect(api.date).toBe('2026-01-15');
    expect(api.cancelled).toBe('appointment-1');
  });
});

class FakeAppointmentApi implements AppointmentApi {
  date: string | undefined;
  cancelled: string | undefined;
  private readonly value = {
    id: 'appointment-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    date: '2026-01-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'cancelled' as const,
  };

  async list(params?: { date?: string }) {
    this.date = params?.date;
    return [this.value];
  }
  async create() { return this.value; }
  async getById() { return this.value; }
  async cancel(id: string) { this.cancelled = id; return this.value; }
  async confirm() { return this.value; }
  async start() { return this.value; }
  async complete() { return this.value; }
  async markNoShow() { return this.value; }
  async reschedule() { return this.value; }
}
