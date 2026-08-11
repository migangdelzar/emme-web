import { describe, expect, it } from 'vitest';
import { listSalonAppointments } from './list-salon-appointments.js';
import type { AppointmentRepository } from '../ports/appointment-repository.js';
import type { Appointment } from '../../domain/index.js';

describe('listSalonAppointments', () => {
  it('passes salon filters to the appointment repository', async () => {
    const repository = new FakeAppointmentRepository();
    const result = await listSalonAppointments({ appointments: repository })({ date: '2026-08-08' });

    expect(repository.filters).toEqual({ date: '2026-08-08' });
    expect(result).toEqual([]);
  });
});

class FakeAppointmentRepository implements AppointmentRepository {
  filters: Parameters<AppointmentRepository['list']>[0] = undefined;

  async findById(): Promise<Appointment | null> {
    return null;
  }

  async list(filters?: Parameters<AppointmentRepository['list']>[0]): Promise<Appointment[]> {
    this.filters = filters;
    return [];
  }

  async save(value: Appointment): Promise<Appointment> {
    return value;
  }
}
