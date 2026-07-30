import type { Page } from '@playwright/test';
import type { TestUser } from '@fixtures/userPool';
import type { Client, Service, Appointment } from '@emme/contracts';

export interface SeedData {
  appointments?: Appointment[];
  services?: Service[];
  customers?: Client[];
}

export interface RouteConfig {
  /** Replay from HAR recording file (MockProvider only). */
  fromHAR(file: string): RouteConfig;
  /** Use in-memory store for this route (MockProvider only, default). */
  fromStore(): RouteConfig;
  /** Modify the response before fulfillment. Works on both providers. */
  fromTweak(fn: (response: { status: number; body: any; headers: Record<string, string> }) => void | { status?: number; body?: any }): RouteConfig;
  /** Add artificial latency (ms). Works on both providers. */
  slow(ms: number): RouteConfig;
  /** Force a status code. Works on both providers. */
  status(code: number): RouteConfig;
}

export interface ApiProvider {
  /** Set up the provider before tests. For mock: installs page routes. For real: preflight checks. */
  setup(page: Page, user: TestUser): Promise<void>;

  /** Seed data into the backend. Mock: updates in-memory state. Real: calls API to create. */
  seed(data: SeedData): Promise<void>;

  /** Tear down after tests. Mock: clears state. Real: deletes seeded resources. */
  teardown(): Promise<void>;

  /** Whether this provider is mock or real. */
  readonly mode: 'mock' | 'real';

  /** Configure a route. Pattern: 'GET /api/v1/services' or 'GET /api/v1/**'. */
  route(pattern: string): RouteConfig;
}
