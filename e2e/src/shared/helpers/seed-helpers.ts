import type { ApiProvider } from '@providers/ApiProvider';

const PFX = 'E2E';

interface TestService { name: string; id: string; price: number; duration: number; }
interface TestClient { name: string; id: string; phone: string; }
interface TestAppointment { id: string; clientId: string; serviceId: string; date: string; }

/**
 * Creates a service via API, passes it to the test function, then cleans up.
 * 
 * Usage:
 *   await withService(provider, async (svc) => {
 *     await expect(page.getByText(svc.name)).toBeVisible();
 *   });
 */
export async function withService(
  provider: ApiProvider,
  fn: (svc: TestService) => Promise<void>,
): Promise<void> {
  const name = `${PFX}-Svc-${Date.now().toString(36)}`;
  const svc: TestService = { id: `s-${Date.now().toString(36)}`, name, price: 500, duration: 45 };
  
  await provider.seed({
    services: [{ id: svc.id, name: svc.name, price: svc.price, duration: svc.duration, category: 'Manicura', isActive: true }],
  });

  try {
    await fn(svc);
  } finally {
    // Cleanup handled by provider.teardown() in fixture
  }
}

/**
 * Creates a client via API, passes it to the test function.
 */
export async function withClient(
  provider: ApiProvider,
  fn: (client: TestClient) => Promise<void>,
): Promise<void> {
  const name = `${PFX}-Maria-${Date.now().toString(36)}`;
  const client: TestClient = { id: `c-${Date.now().toString(36)}`, name, phone: '555-2001' };

  await provider.seed({
    customers: [{ id: client.id, name: client.name, phone: client.phone, email: `${client.name}@test.com` }],
  });

  try {
    await fn(client);
  } finally {
    // Cleanup handled by provider.teardown()
  }
}

/**
 * Creates a client + service + appointment via API, passes them to the test function.
 */
export async function withAppointment(
  provider: ApiProvider,
  fn: (appt: TestAppointment, client: TestClient, svc: TestService) => Promise<void>,
): Promise<void> {
  const now = Date.now().toString(36);
  const today = new Date().toISOString().split('T')[0];
  
  const client: TestClient = { id: `ac-${now}`, name: `${PFX}-ApptClient-${now}`, phone: '555-3301' };
  const svc: TestService = { id: `as-${now}`, name: `${PFX}-ApptSvc-${now}`, price: 500, duration: 45 };
  const appt: TestAppointment = { id: `apt-${now}`, clientId: client.id, serviceId: svc.id, date: today };

  await provider.seed({
    customers: [{ id: client.id, name: client.name, phone: client.phone }],
    services: [{ id: svc.id, name: svc.name, price: svc.price, duration: svc.duration, category: 'Manicura', isActive: true }],
    appointments: [{ id: appt.id, clientId: appt.clientId, serviceId: appt.serviceId, date: appt.date, startTime: '10:00', endTime: '10:45', status: 'confirmed' }],
  });

  try {
    await fn(appt, client, svc);
  } finally {
    // Cleanup handled by provider.teardown()
  }
}
