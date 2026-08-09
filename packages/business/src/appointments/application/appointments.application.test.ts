import { describe, expect, it } from 'vitest';

import {
  bookAppointment,
  cancelAppointment,
  findAvailableSlots,
  getAppointment,
  listAppointments,
  rescheduleAppointment,
} from './index.js';
import type {
  AppointmentIdGenerator,
  AppointmentRepository,
  AvailabilityRepository,
  NotificationPort,
} from './ports.js';
import type { Appointment } from '../domain/appointment.types.js';

const appointment: Appointment = {
  id: 'appointment-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  date: '2026-01-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed',
};

class FakeAppointments implements AppointmentRepository {
  records = [appointment];
  saved: Appointment[] = [];

  async findById(id: string): Promise<Appointment | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }

  async list(filters?: Parameters<AppointmentRepository['list']>[0]): Promise<Appointment[]> {
    return this.records.filter((record) => !filters?.date || record.date === filters.date);
  }

  async save(value: Appointment): Promise<Appointment> {
    this.saved.push(value);
    return value;
  }
}

class FakeAvailability implements AvailabilityRepository {
  calls: Parameters<AvailabilityRepository['findAvailableSlots']>[0][] = [];

  async findAvailableSlots(input: Parameters<AvailabilityRepository['findAvailableSlots']>[0]) {
    this.calls.push(input);
    return [{ startTime: '12:00', endTime: '13:00' }];
  }
}

class FakeNotifications implements NotificationPort {
  sent: Appointment[] = [];

  async appointmentChanged(value: Appointment): Promise<void> {
    this.sent.push(value);
  }
}

const ids: AppointmentIdGenerator = { next: () => 'appointment-2' };

describe('appointment application use cases', () => {
  it('lists appointments through the injected repository', async () => {
    const repository = new FakeAppointments();

    await expect(
      listAppointments({ appointments: repository })({ date: appointment.date })
    ).resolves.toEqual([appointment]);
  });

  it('gets an appointment and rejects a missing appointment', async () => {
    const repository = new FakeAppointments();

    await expect(
      getAppointment({ appointments: repository })({ appointmentId: appointment.id })
    ).resolves.toEqual(appointment);
    await expect(
      getAppointment({ appointments: repository })({ appointmentId: 'missing' })
    ).rejects.toThrow('Appointment not found');
  });

  it('cancels a cancellable appointment and notifies the injected port', async () => {
    const repository = new FakeAppointments();
    const notifications = new FakeNotifications();

    await expect(
      cancelAppointment({ appointments: repository, notifications })({
        appointmentId: appointment.id,
      })
    ).resolves.toMatchObject({ status: 'cancelled' });
    expect(notifications.sent[0]?.status).toBe('cancelled');
  });

  it('rejects booking when the requested time conflicts', async () => {
    const repository = new FakeAppointments();
    await expect(
      bookAppointment({ appointments: repository, ids })({
        clientId: 'client-2',
        serviceId: 'service-1',
        date: appointment.date,
        startTime: '10:30',
        endTime: '11:30',
      })
    ).rejects.toThrow('conflicts');
  });

  it('books a pending appointment when no conflict exists', async () => {
    const repository = new FakeAppointments();

    const result = await bookAppointment({ appointments: repository, ids })({
      clientId: 'client-2',
      serviceId: 'service-1',
      date: appointment.date,
      startTime: '11:00',
      endTime: '12:00',
    });

    expect(result.status).toBe('pending');
    expect(repository.saved[0]).toMatchObject({ clientId: 'client-2', status: 'pending' });
  });

  it('reschedules an active appointment after checking conflicts', async () => {
    const repository = new FakeAppointments();

    const result = await rescheduleAppointment({ appointments: repository })({
      appointmentId: appointment.id,
      date: appointment.date,
      startTime: '12:00',
      endTime: '13:00',
    });

    expect(result).toMatchObject({ startTime: '12:00', endTime: '13:00' });
  });

  it('delegates availability queries to the injected availability port', async () => {
    const availability = new FakeAvailability();

    await expect(
      findAvailableSlots({ availability })({
        date: appointment.date,
        serviceId: appointment.serviceId,
      })
    ).resolves.toEqual([{ startTime: '12:00', endTime: '13:00' }]);
    expect(availability.calls).toEqual([
      { date: appointment.date, serviceId: appointment.serviceId },
    ]);
  });
});
