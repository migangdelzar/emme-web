import { createClientApi, createServiceApi, createAppointmentApi, type Client, type Service, type Appointment } from '@emme/api';

interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

interface Artist {
  id: string;
  name: string;
}

export const SEEDS: {
  services: Service[];
  customers: Client[];
  appointments: Appointment[];
} = {
  services: [],
  customers: [],
  appointments: [],
};

function createHttp(token: string, tenantSlug: string): HttpClient {
  const baseUrl = process.env.E2E_API_URL || 'http://localhost:8081';

  const request = async <T>(path: string, method: string, body?: unknown): Promise<T> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'API-Version': '1.0',
      Authorization: `Bearer ${token}`,
      'X-Emme-Tenant-Slug': tenantSlug,
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${method} ${path}: ${await res.text().catch(() => '')}`);
    if (res.status === 204) return undefined as T;
    return res.json() as T;
  };

  return {
    get: <T>(path: string) => request<T>(path, 'GET'),
    post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
    put: <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
    patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
    delete: <T>(path: string) => request<T>(path, 'DELETE'),
  };
}

/** Provision test data once. Idempotent — skips if data already exists. */
export async function provisionTestData(token: string, tenantSlug: string): Promise<typeof SEEDS> {
  const http = createHttp(token, tenantSlug);
  const customersApi = createClientApi(http);
  const servicesApi = createServiceApi(http);
  const appointmentsApi = createAppointmentApi(http);

  // Idempotency check
  const existing = await customersApi.list().catch(() => []);
  if (existing.length >= 3) {
    console.log('[Seed] Test data already provisioned, skipping');
    const services = await servicesApi.list().catch(() => []);
    const appointments = await appointmentsApi.list().catch(() => []);
    const artist = await ensureArtist(http);
    const today = new Date().toISOString().split('T')[0];
    const seededAppointments = [...appointments];
    for (let index = seededAppointments.length; index < 2 && index < services.length; index += 1) {
      seededAppointments.push(await appointmentsApi.create({
        clientId: existing[index].id,
        serviceId: services[index].id,
        artistId: artist.id,
        date: today,
        startTime: index === 0 ? '10:00' : '11:00',
        endTime: index === 0 ? '10:45' : '11:45',
        status: 'confirmed',
      }));
    }
    SEEDS.customers = existing.slice(0, 3);
    SEEDS.services = services.slice(0, 3);
    SEEDS.appointments = seededAppointments.slice(0, 2);
    return SEEDS;
  }

  console.log('[Seed] Provisioning test data...');

  // 3 services
  const s1 = await servicesApi.create({ name: 'E2E Manicure Clasica', category: 'Manicura y Cuidado Natural', duration: 45, price: 350 });
  const s2 = await servicesApi.create({ name: 'E2E Manicure Rusa', category: 'Manicura y Cuidado Natural', duration: 90, price: 750 });
  const s3 = await servicesApi.create({ name: 'E2E Soft Gel Premium', category: 'Extensiones y Estructura', duration: 120, price: 1200 });
  SEEDS.services = [s1, s2, s3];
  const artist = await ensureArtist(http);

  // 3 customers
  const c1 = await customersApi.create({ name: 'E2E Valeria Arriaza', phone: '555-0101', email: 'valeria@e2e.test' });
  const c2 = await customersApi.create({ name: 'E2E Elena Garcia', phone: '555-0102', email: 'elena@e2e.test' });
  const c3 = await customersApi.create({ name: 'E2E Maria Jose', phone: '555-0103', email: 'maria@e2e.test' });
  SEEDS.customers = [c1, c2, c3];

  // 2 appointments for today
  const today = new Date().toISOString().split('T')[0];
  const existingAppointments = await appointmentsApi.list().catch(() => []);
  const a1 = existingAppointments[0] ?? await appointmentsApi.create({ clientId: c1.id, serviceId: s1.id, artistId: artist.id, date: today, startTime: '10:00', endTime: '10:45', status: 'confirmed' });
  const a2 = existingAppointments[1] ?? await appointmentsApi.create({ clientId: c2.id, serviceId: s2.id, artistId: artist.id, date: today, startTime: '11:00', endTime: '11:45', status: 'confirmed' });
  SEEDS.appointments = [a1, a2];

  console.log(`[Seed] Done — ${SEEDS.services.length} services, ${SEEDS.customers.length} customers, ${SEEDS.appointments.length} appointments`);
  return SEEDS;
}

async function ensureArtist(http: HttpClient): Promise<Artist> {
  const artists = await http.get<Artist[]>('/api/artists').catch(() => []);
  return artists[0] ?? http.post<Artist>('/api/artists', { name: 'E2E Artist' });
}
