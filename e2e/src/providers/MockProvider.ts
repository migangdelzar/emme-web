import type { Page } from '@playwright/test';
import type { TestUser } from '@fixtures/userPool';
import type { Client, Service, Appointment, CreateClient, CreateService, CreateAppointment, DataProvider as DomainDataProvider } from '@emme/contracts';
import type { ApiProvider, SeedData, RouteConfig } from './ApiProvider';
import { db } from './store';
import { API } from '@routes/routes';
import { type RouteOverride, matchPattern } from './shared';

/** Match API requests at the host root without intercepting source modules such as `/src/api/*`. */
const API_REQUEST = /https?:\/\/[^/]+\/api(?:\/|$)/;

// Playwright test runner runs in Node.js — require() is available at runtime.
declare function require(module: string): any;

export class MockProvider implements ApiProvider, DomainDataProvider {
  readonly mode = 'mock' as const;
  private page!: Page;
  private overrides: RouteOverride[] = [];

  /** Apply overrides (forceStatus, tweakFn) then wait for slowMs, then fulfill. */
  private async fulfillWithOverrides(
    route: Parameters<Parameters<Page['route']>[1]>[0],
    response: { status: number; body: any; headers: Record<string, string> },
  ) {
    const method = route.request().method();
    const pathname = new URL(route.request().url()).pathname;
    const overridden = this.applyOverrides(method, pathname, response);
    const slowMs = this.overrides.find(o => matchPattern(o.pattern, method, pathname))?.slowMs;
    if (slowMs) await new Promise(r => setTimeout(r, slowMs));
    return route.fulfill({ status: overridden.status, contentType: 'application/json', body: JSON.stringify(overridden.body) });
  }

  async setup(page: Page, user?: TestUser | null): Promise<void> {
    this.page = page;
    db.customers.clear();
    db.services.clear();
    db.appointments.clear();

    // ── Route helpers ──
    const json = (body: unknown, status = 200): { status: number; body: unknown; headers: Record<string, string> } =>
      ({ status, body, headers: { 'content-type': 'application/json' } });

    const fulfill = (route: any, res: ReturnType<typeof json>) => this.fulfillWithOverrides(route, res);

    // ── Register ALL routes FIRST (before addInitScript) ──

    const routes = [
      // /api/me — 401 when unauthenticated
      page.route(`**${API.ME}`, async (route) => {
        if (!user) return route.fulfill({ status: 401, body: '{}' });
        return fulfill(route, json({
          userId: user.userId, displayName: user.name, email: user.email,
          memberships: user.memberships.map(m => ({
            tenantId: m.tenantId,
            tenantSlug: m.tenantName.toLowerCase().replace(/\s+/g, '-'),
            tenantName: m.tenantName, role: m.role, status: 'ACTIVE',
            permissions: ['appointment:create', 'catalog:read', 'customer:read'],
          })),
          profile: null,
        }));
      }),

      // Dashboard SSE
      page.route(`**${API.DASHBOARD_STREAM}**`, async (route) =>
        route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'event: connected\ndata: {}\n\n' })),

      // Single catch-all with entity dispatch (no race condition)
      page.route(API_REQUEST, async (route) => {
        if (!user) return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Unauthorized' }) });
        const pathname = new URL(route.request().url()).pathname;
        const method = route.request().method();

        // Entity CRUD (registered first in the handler, so they always match)
        const entityPaths: Record<string, any> = {
          [API.APPOINTMENTS]: db.appointments,
          [API.SERVICES]: db.services,
          [API.CUSTOMERS]: db.customers,
        };
        for (const [apiPath, table] of Object.entries(entityPaths)) {
          if (pathname === apiPath) {
            if (method === 'GET') return fulfill(route, json(table.all()));
            if (method === 'POST') {
              const body = route.request().postDataJSON() || {};
              const id = crypto.randomUUID();
              const item = apiPath === API.SERVICES
                ? { id, ...body, price: body.basePrice ?? body.price ?? 0, duration: body.durationMinutes ?? body.duration ?? 0, isActive: true }
                : apiPath === API.APPOINTMENTS
                  ? { id, ...body, clientId: body.customerId ?? body.clientId, date: body.startsAt?.split('T')[0], startTime: body.startsAt?.split('T')[1]?.slice(0, 5), endTime: body.endsAt?.split('T')[1]?.slice(0, 5), status: 'pending' }
                  : { id, ...body };
              return fulfill(route, json(table.insert(item), 201));
            }
            if (method === 'PUT') {
              const body = route.request().postDataJSON() || {};
              const id = pathname.split('/').pop()!;
              const current = table.find(id);
              const patch = apiPath === API.SERVICES
                ? { ...body, price: body.basePrice ?? body.price ?? current?.price, duration: body.durationMinutes ?? body.duration ?? current?.duration }
                : body;
              const updated = table.update(id, patch);
              return fulfill(route, json(updated ?? { ...body, id }));
            }
            return fulfill(route, json([]));
          }
          if (pathname.startsWith(`${apiPath}/`) && method === 'PUT') {
            const body = route.request().postDataJSON() || {};
            const id = pathname.split('/').pop()!;
            const current = table.find(id);
            const patch = apiPath === API.SERVICES
              ? { ...body, price: body.basePrice ?? body.price ?? current?.price, duration: body.durationMinutes ?? body.duration ?? current?.duration }
              : body;
            const updated = table.update(id, patch);
            return fulfill(route, json(updated ?? { ...body, id }));
          }
        }

        // Special routes
        if (pathname.startsWith('/api/finances'))
          return fulfill(route, json({ revenue: 12500.50, expenses: 3200 }));
        if (pathname.startsWith('/api/business-config'))
          return fulfill(route, json(method === 'GET'
            ? { tenantId: 'default-tenant', businessName: 'Mock Studio', ownerName: 'Test Owner', monthlyGoal: '25000', workingHours: '09:00-18:00', language: 'es', notificationsEnabled: true }
            : (route.request().postDataJSON() || {})));

        // Fallback: return empty array for entity-like paths, empty object for others
        const isEntityPath = ['appointments', 'services', 'customers', 'artists'].some(p => pathname.includes(`/api/${p}`));
        return fulfill(route, json(isEntityPath ? [] : {}));
      }),

      // Appointment cancel
      page.route(`**${API.APPOINTMENTS}/*/cancel`, async (route) => {
        const id = new URL(route.request().url()).pathname.split('/').at(-2)!;
        const updated = db.appointments.update(id, { status: 'cancelled' });
        return fulfill(route, json(updated ?? { id, status: 'cancelled' }));
      }),
      // Services retire
      page.route(`**${API.SERVICES}/*/retire`, async (route) => {
        const id = new URL(route.request().url()).pathname.split('/').at(-2)!;
        db.services.remove(id);
        return fulfill(route, json({}));
      }),
      // Keycloak OIDC mock
      page.route('**/realms/**/.well-known/**', async (route) => fulfill(route, json({
        issuer: 'http://localhost:8180/realms/emme',
        authorization_endpoint: 'http://localhost:8180/realms/emme/protocol/openid-connect/auth',
        token_endpoint: 'http://localhost:8180/realms/emme/protocol/openid-connect/token',
      }))),
      // Actuator
      page.route(`**${API.HEALTH}`, async (route) => fulfill(route, json({ status: 'UP' }))),
    ];

    await Promise.all(routes);

    // ── Auth injection LAST (tokens set AFTER all routes are ready) ──
    // Skip auth when no user provided (unauthenticated tests)
    if (user) {
      await page.addInitScript((cfg: { auth: boolean; userData: any }) => {
        if (!cfg.auth) return;
        const { userData } = cfg;
        const memberships = Array.isArray(userData.memberships) ? userData.memberships : [];
        const profile = {
          userId: userData.userId || 'default-mock-user',
          memberships: memberships.map((m: any) => ({ ...m, status: 'ACTIVE', permissions: ['appointment:create', 'catalog:read', 'customer:read'] })),
          displayName: userData.name || 'Default User',
          email: userData.email || 'default@emme.app',
          profile: null,
        };
        sessionStorage.setItem('oidc.user', JSON.stringify({ access_token: 'test-token', expires_in: 3600 }));
        sessionStorage.setItem('oidc.user:http://localhost:8180/realms/emme:emme-salon-app', JSON.stringify({
          id_token: 'fake-id-token', access_token: 'test-token', token_type: 'Bearer',
          scope: 'openid profile email',
          profile: { sub: userData.userId || 'default', name: userData.name || 'Default', email: userData.email || 'default@emme.app', preferred_username: userData.userId || 'default' },
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          session_state: 'fake-session', refresh_token: 'fake-refresh',
        }));
        localStorage.setItem('access_token', 'test-token');
        localStorage.setItem('emmenails_profile', JSON.stringify(profile));
        localStorage.setItem('emmenails_cache_isFirstTime', JSON.stringify({ data: false, timestamp: Date.now(), version: '1.0.1' }));
        localStorage.setItem('emme-ui-state', JSON.stringify({ state: { isFirstTime: false }, version: 0 }));
      }, { auth: true, userData: user });
    }
  }

  // ── Route overrides ──

  route(pattern: string): RouteConfig {
    const override: RouteOverride = { pattern };
    this.overrides.push(override);
    return {
      fromHAR(file: string) {
        override.harFile = file;
        return this;
      },
      fromStore() {
        override.useStore = true;
        return this;
      },
      fromTweak(fn: (res: { status: number; body: any; headers: Record<string, string> }) => void | { status?: number; body?: any }) {
        override.tweakFn = fn as any;
        return this;
      },
      slow(ms: number) {
        override.slowMs = ms;
        return this;
      },
      status(code: number) {
        override.forceStatus = code;
        return this;
      },
    };
  }

  /** Apply overrides to a response before route.fulfill(). */
  private applyOverrides(method: string, path: string, res: { status: number; body: any; headers: Record<string, string> }): { status: number; body: any; headers: Record<string, string> } {
    for (const ov of this.overrides) {
      if (!matchPattern(ov.pattern, method, path)) continue;
      if (ov.forceStatus) res.status = ov.forceStatus;
      if (ov.tweakFn) {
        const tweaked = ov.tweakFn(res);
        if (tweaked) Object.assign(res, tweaked);
      }
    }
    return res;
  }

  // ── ApiProvider ──

  async seed(data: SeedData): Promise<void> {
    if (data.appointments) db.appointments.seed(data.appointments);
    if (data.services) db.services.seed(data.services);
    if (data.customers) db.customers.seed(data.customers);
  }

  async teardown(): Promise<void> {
    db.customers.clear();
    db.services.clear();
    db.appointments.clear();
  }

  // ── DataProvider (contracts) — direct test assertions ──

  loadClients = (): Promise<Client[]> => Promise.resolve([...db.customers.all()]);
  addClient = (c: CreateClient): Promise<Client> => Promise.resolve(db.customers.insert({ id: crypto.randomUUID(), ...c }));
  loadServices = (): Promise<Service[]> => Promise.resolve([...db.services.all()]);
  addService = (s: CreateService): Promise<Service> => Promise.resolve(db.services.insert({ id: crypto.randomUUID(), ...s, isActive: true }));
  loadAppointments = (): Promise<Appointment[]> => Promise.resolve([...db.appointments.all()]);
  addAppointment = (a: CreateAppointment): Promise<Appointment> => Promise.resolve(db.appointments.insert({ id: crypto.randomUUID(), ...a }));
}
