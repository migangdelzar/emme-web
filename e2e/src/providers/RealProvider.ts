import type { Page } from '@playwright/test';
import type { TestUser } from '@fixtures/userPool';
import type { ApiProvider, SeedData, RouteConfig } from './ApiProvider';
import { API_VERSION, createAppointmentApi, createClientApi, createServiceApi } from '@emme/contracts';
import { type RouteOverride, matchPattern } from './shared';

interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

/** Calls the real backend API. Token is extracted from browser after OAuth2 login and injected via setToken(). */
export class RealProvider implements ApiProvider {
  readonly mode = 'real' as const;
  private baseUrl: string;
  private token: string = '';
  private tenantSlug: string = '';
  private readonly fetcher: typeof fetch;
  private seededIds: { customers: string[]; services: string[]; appointments: string[] } = {
    customers: [], services: [], appointments: []
  };
  private overrides: RouteOverride[] = [];

  constructor(options: { baseUrl?: string; fetcher?: typeof fetch } = {}) {
    this.baseUrl = options.baseUrl?.trim() || process.env.E2E_API_URL?.trim() || '';
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  }

  /** Set the auth token (extracted from browser after OAuth2 login). */
  setToken(token: string) {
    this.token = token;
  }

  private createHttp() {
    const token = this.token;
    const tenantSlug = this.tenantSlug;
    const baseUrl = this.baseUrl;
    console.log(`[RealProvider] createHttp: token=${token ? token.substring(0,20)+'...' : 'EMPTY'}, tenantSlug=${tenantSlug}, baseUrl=${baseUrl}`);

    const request = async <T>(path: string, method: string, body?: unknown): Promise<T> => {
      const url = `${baseUrl}${path}`;
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'API-Version': API_VERSION,
      };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (tenantSlug) headers['X-Emme-Tenant-Slug'] = tenantSlug;

      console.log(`[RealProvider] ${method} ${path} token=${!!token} tenant=${tenantSlug}`);
      const response = await this.fetcher(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const rawBody = response.status === 204 ? '' : await response.text();
      const result = {
        status: response.status,
        body: rawBody ? JSON.parse(rawBody) : undefined,
        headers: Object.fromEntries(response.headers.entries()),
      };
      this.applyOverrides(method, new URL(url).pathname, result);
      const delay = this.overrides.find((override) => matchPattern(override.pattern, method, new URL(url).pathname))?.slowMs;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      if (result.status >= 400) throw new Error(`HTTP ${result.status} ${method} ${path}`);
      return result.body as T;
    };

    const http: HttpClient = {
      get: <T>(path: string) => request<T>(path, 'GET'),
      post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
      put: <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
      patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
      delete: <T>(path: string) => request<T>(path, 'DELETE'),
    };
    return http;
  }

  // ── Route overrides ──

  route(pattern: string): RouteConfig {
    const override: RouteOverride = { pattern };
    this.overrides.push(override);
    return {
      fromHAR(_file: string) {
        throw new Error('HAR replay is MockProvider-only. Use RealProvider for real backend tests.');
      },
      fromStore() {
        throw new Error('Store is MockProvider-only.');
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

  private applyOverrides(method: string, path: string, res: { status: number; body: any; headers: Record<string, string> }): void {
    for (const ov of this.overrides) {
      if (!matchPattern(ov.pattern, method, path)) continue;
      if (ov.forceStatus) res.status = ov.forceStatus;
      if (ov.tweakFn) {
        const tweaked = ov.tweakFn(res);
        if (tweaked) Object.assign(res, tweaked);
      }
    }
  }

  async setup(_page: Page, _user: TestUser): Promise<void> {
    if (!this.baseUrl) throw new Error('Real E2E requires E2E_API_URL to be configured.');
    if (!this.token) throw new Error('Real E2E provider requires an authenticated browser token.');
    // Use the provisioned E2E tenant slug from env or user membership
    this.tenantSlug = process.env.E2E_TENANT_SLUG
      || _user.memberships[0]?.tenantSlug
      || _user.memberships[0]?.tenantName?.toLowerCase().replace(/\s+/g, '-')
      || 'e2e-studio';
  }

  async seed(data: SeedData): Promise<void> {
    const http = this.createHttp();
    const customers = createClientApi(http);
    const services = createServiceApi(http);
    const appointments = createAppointmentApi(http);
    const customerIds = new Map<string, string>();
    const serviceIds = new Map<string, string>();

    for (const customer of data.customers ?? []) {
      const { id, ...payload } = customer;
      try {
        const created = await customers.create(payload);
        customerIds.set(id, created.id);
        this.seededIds.customers.push(created.id);
      } catch (error) {
        if (!(error instanceof Error && (error.message.includes('HTTP 409') || error.message.includes('HTTP 400')))) throw error;
      }
    }

    for (const service of data.services ?? []) {
      const { id, isActive: _isActive, ...payload } = service;
      try {
        const created = await services.create(payload);
        serviceIds.set(id, created.id);
        this.seededIds.services.push(created.id);
      } catch (error) {
        if (!(error instanceof Error && (error.message.includes('HTTP 409') || error.message.includes('HTTP 400')))) throw error;
      }
    }

    for (const appointment of data.appointments ?? []) {
      const { id: _id, ...payload } = appointment;
      try {
        const created = await appointments.create({
          ...payload,
          clientId: customerIds.get(appointment.clientId) ?? appointment.clientId,
          serviceId: serviceIds.get(appointment.serviceId) ?? appointment.serviceId,
        });
        this.seededIds.appointments.push(created.id);
      } catch (error) {
        if (!(error instanceof Error && (error.message.includes('HTTP 409') || error.message.includes('HTTP 400')))) throw error;
      }
    }
  }

  async teardown(): Promise<void> {
    const http = this.createHttp();
    const appointments = createAppointmentApi(http);
    const customers = createClientApi(http);
    const services = createServiceApi(http);
    const failures: unknown[] = [];

    for (const id of this.seededIds.appointments) {
      try { await appointments.cancel(id); } catch (error) { failures.push(error); }
    }
    for (const id of this.seededIds.customers) {
      try { await customers.retire(id); } catch (error) { failures.push(error); }
    }
    for (const id of this.seededIds.services) {
      try { await services.retire(id); } catch (error) { failures.push(error); }
    }

    this.seededIds = { customers: [], services: [], appointments: [] };
    if (failures.length > 0) throw new AggregateError(failures, 'Real E2E cleanup failed.');
  }
}
