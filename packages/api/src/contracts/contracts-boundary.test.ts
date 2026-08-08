import { describe, expect, it } from 'vitest';

import type { AppointmentDto } from './appointments/appointment.dto.js';
import type { CreateClientRequest, UpdateClientRequest } from './clients/client.requests.js';
import type { ClientDto } from './clients/client.dto.js';
import type { AuthUserDto } from './auth/user.dto.js';
import type { HealthDto } from './common/health.dto.js';

describe('@emme/api contract boundary', () => {
  it('exposes backend-shaped DTOs and request types from contracts', () => {
    const client: ClientDto = { id: 'client-1', name: 'Ada', phone: '555' };
    const create: CreateClientRequest = { name: 'Ada', phone: '555' };
    const update: UpdateClientRequest = { email: 'ada@example.com' };
    const appointment: AppointmentDto = {
      id: 'appointment-1',
      customerId: 'client-1',
      serviceId: 'service-1',
      startsAt: '2026-08-08T09:00:00Z',
      endsAt: '2026-08-08T10:00:00Z',
      status: 'CONFIRMED',
    };
    const user: AuthUserDto = { userId: 'user-1', email: 'ada@example.com', displayName: 'Ada' };
    const health: HealthDto = { status: 'UP' };

    expect({ client, create, update, appointment, user, health }).toBeDefined();
  });
});
