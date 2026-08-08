import { describe, expect, it } from 'vitest';
import type { AppointmentApi } from '@emme/api';
import { createAppointmentRepository } from './appointment-repository.adapter.js';

describe('createAppointmentRepository', () => {
  it('maps appointment list filters to the API capability', async () => {
    const api = new FakeAppointmentApi();
    const repository = createAppointmentRepository(api);

    await expect(repository.list({ date: '2026-08-08' })).resolves.toEqual([]);
    expect(api.listedWith).toEqual({ date: '2026-08-08' });
  });

  it('maps a cancelled appointment save to the cancel operation', async () => {
    const api = new FakeAppointmentApi();
    const repository = createAppointmentRepository(api);
    const appointment = {
      id: 'appointment-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      date: '2026-08-08',
      startTime: '10:00',
      endTime: '11:00',
      status: 'cancelled' as const,
    };

    await expect(repository.save(appointment)).resolves.toEqual(appointment);
    expect(api.cancelledId).toBe('appointment-1');
  });
});

class FakeAppointmentApi implements AppointmentApi {
  listedWith: { date?: string } | undefined;
  cancelledId: string | undefined;

  private readonly appointment = {
    id: 'appointment-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    date: '2026-08-08',
    startTime: '10:00',
    endTime: '11:00',
    status: 'cancelled' as const,
  };

  async list(params?: { date?: string }) {
    this.listedWith = params;
    return [];
  }

  async create(_data: Parameters<AppointmentApi['create']>[0]) {
    return this.appointment;
  }

  async getById(_id: string) {
    return this.appointment;
  }

  async cancel(id: string) {
    this.cancelledId = id;
    return {
      id,
      clientId: 'client-1',
      serviceId: 'service-1',
      date: '2026-08-08',
      startTime: '10:00',
      endTime: '11:00',
      status: 'cancelled' as const,
    };
  }

  async confirm(_id: string) { return this.appointment; }
  async start(_id: string) { return this.appointment; }
  async complete(_id: string) { return this.appointment; }
  async markNoShow(_id: string) { return this.appointment; }
  async reschedule(_id: string, _newStartsAt: string, _newEndsAt: string) { return this.appointment; }
}
