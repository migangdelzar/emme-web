import type { CreateAppointment, CreateClient, CreateService } from '@emme/api';

export interface E2eDataFactory {
  customer(): CreateClient;
  service(): CreateService;
  appointment(customerId: string, serviceId: string): CreateAppointment;
}

function normalizeRunId(runId: string): string {
  const normalized = runId.trim().replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '');
  if (!normalized) throw new Error('E2E run id must contain at least one letter or number.');
  return normalized;
}

function nextTestDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function createE2eDataFactory(runId: string): E2eDataFactory {
  const marker = `E2E-${normalizeRunId(runId)}`;

  return {
    customer: () => ({
      name: `${marker} Customer`,
      phone: `555-${normalizeRunId(runId).replace(/[^0-9]/g, '').slice(-4).padStart(4, '0')}`,
      email: `e2e-${normalizeRunId(runId).toLowerCase()}.customer@emme.test`,
    }),
    service: () => ({
      name: `${marker} Service`,
      price: 500,
      duration: 60,
      category: 'E2E',
      description: `${marker} deterministic service`,
    }),
    appointment: (customerId, serviceId) => ({
      clientId: customerId,
      serviceId,
      date: nextTestDate(),
      startTime: '10:00',
      endTime: '11:00',
      status: 'pending',
      notes: `${marker} appointment`,
    }),
  };
}
