import type {
  CurrentUser,
  HealthResponse,
  TenantMembership,
  TenantMembershipsResponse,
} from "@emme/contracts";

import { ApiHttpError } from "./errors.js";

export type AccessTokenProvider = () => Promise<string | null> | string | null;
export type TenantSlugProvider = () => string | null;

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: AccessTokenProvider;
  getTenantSlug?: TenantSlugProvider;
  fetcher?: typeof fetch;
}

/** Generic HTTP client — domain modules depend on this, not on specific implementations. */
export interface HttpClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export interface ApiClient {
  getHealth(): Promise<HealthResponse>;
  getCurrentUser(): Promise<CurrentUser>;
  listTenantMemberships(): Promise<TenantMembership[]>;
}

interface RequestContext {
  baseUrl: string;
  fetcher: typeof fetch;
  options: ApiClientOptions;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);

  return {
    getHealth: () => request<HealthResponse>("/q/health", { baseUrl, fetcher, options }),
    getCurrentUser: () => request<CurrentUser>("/api/me", { baseUrl, fetcher, options }),
    listTenantMemberships: async () => {
      const response = await request<TenantMembershipsResponse>("/api/me/tenants", {
        baseUrl,
        fetcher,
        options,
      });
      return response.memberships;
    },
  };
}

async function request<T>(path: string, context: RequestContext): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = context.options.getAccessToken
    ? await context.options.getAccessToken()
    : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const tenantSlug = context.options.getTenantSlug?.();
  if (tenantSlug) {
    headers["X-Emme-Tenant-Slug"] = tenantSlug;
  }

  const response = await context.fetcher(new URL(trimPath(path), context.baseUrl), {
    headers,
  });
  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiHttpError(
      `API request failed with status ${response.status}`,
      response.status,
      body
    );
  }

  return body as T;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  return text;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    throw new Error("API base URL is required");
  }

  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function trimPath(path: string): string {
  return path.replace(/^\/+/, "");
}
