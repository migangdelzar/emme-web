import type { Page } from '@playwright/test';
import type { TestUser } from '@fixtures/userPool';
import type { ApiProvider, SeedData, RouteConfig } from './ApiProvider';
import { createClientApi, createServiceApi, createAppointmentApi } from '@emme/contracts';
import { API } from '@routes/routes';
import { type RouteOverride, matchPattern } from './shared';

/** Calls the real backend API. Token is extracted from browser after OAuth2 login and injected via setToken(). */
export class RealProvider implements ApiProvider {
  readonly mode = 'real' as const;
  private baseUrl: string;
  private token: string = '';
  private seededIds: { customers: string[]; services: string[]; appointments: string[] } = {
    customers: [], services: [], appointments: []
  };
  private overrides: RouteOverride[] = [];

  constructor() {
    this.baseUrl = process.env.E2E_API_URL || 'http://localhost:8081';
  }

  /** Set the auth token (extracted from browser after OAuth2 login). */
  setToken(token: string) {
    this.token = token;
  }

  private createHttp() {
    const baseUrl = this.baseUrl;
    const token = this.token;

    const fetcher = (url: string | URL, init?: RequestInit) =>
      fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers as Record<string, string> || {}),
        },
      });

    return {
      get: async <T>(path: string) => {
        const url = `${baseUrl}${path}`;
        const res = await fetcher(url);
        const data = await res.json();
        const pathname = new URL(url).pathname;
        const response = { status: res.status, body: data, headers: Object.fromEntries(res.headers.entries()) };
        this.applyOverrides('GET', pathname, response);
        if (response.status >= 400) throw new Error(`HTTP ${response.status} ${path}`);
        return response.body as T;
      },
      post: async <T>(path: string, body?: unknown) => {
        const url = `${baseUrl}${path}`;
        const res = await fetcher(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
        const data = await res.json();
        const pathname = new URL(url).pathname;
        const response = { status: res.status, body: data, headers: Object.fromEntries(res.headers.entries()) };
        this.applyOverrides('POST', pathname, response);
        if (response.status >= 400) throw new Error(`HTTP ${response.status} ${path}`);
        return response.body as T;
      },
      put: async <T>(path: string, body?: unknown) => {
        const url = `${baseUrl}${path}`;
        const res = await fetcher(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
        const data = await res.json();
        const pathname = new URL(url).pathname;
        const response = { status: res.status, body: data, headers: Object.fromEntries(res.headers.entries()) };
        this.applyOverrides('PUT', pathname, response);
        if (response.status >= 400) throw new Error(`HTTP ${response.status} ${path}`);
        return response.body as T;
      },
      patch: async <T>(_path: string, _body?: unknown) => { throw new Error('Not implemented'); },
      delete: async <T>(_path: string) => { throw new Error('Not implemented'); },
    };
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
    // Auth token is set via setToken() after browser login
  }

   async seed(_data: SeedData): Promise<void> {
     // Data is pre-seeded by DataSeeder (CommandLineRunner with @Profile("local"))
     // RealProvider becomes read-only — verifies pre-existing data via UI assertions.
   }

  async teardown(): Promise<void> {
    const http = this.createHttp();
    for (const id of this.seededIds.appointments) {
      try { await http.post(`${API.APPOINTMENTS}/${id}/cancel`); } catch {}
    }
    this.seededIds = { customers: [], services: [], appointments: [] };
  }
}
