import { test, expect } from '@playwright/test';
import { createE2eDataFactory } from '../../shared/factories/e2eDataFactory';

test('E2E data factory produces unique tenant-scoped records with stable markers', () => {
  const factory = createE2eDataFactory('worker-1-test-2');
  const customer = factory.customer();
  const service = factory.service();
  const appointment = factory.appointment('customer-created', 'service-created');

  expect(customer.name).toBe('E2E-worker-1-test-2 Customer');
  expect(customer.email).toBe('e2e-worker-1-test-2.customer@emme.test');
  expect(service.name).toBe('E2E-worker-1-test-2 Service');
  expect(appointment.clientId).toBe('customer-created');
  expect(appointment.serviceId).toBe('service-created');
  expect(appointment.startTime).toBe('10:00');
  expect(appointment.endTime).toBe('11:00');
});
