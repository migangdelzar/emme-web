import {
  API_VERSION,
  type CurrentUser,
  type HealthResponse,
  type TenantMembership,
  type TenantMembershipsResponse,
} from "@emme/api";

import { ApiHttpError } from "./api-error.js";

export type AccessTokenProvider = () => Promise<string | null> | string | null;
export type TenantSlugProvider = () => string | null;

export interface ApiClientOptions {
  baseUrl: string;
  apiVersion?: string;
  getAccessToken?: AccessTokenProvider;
  getTenantSlug?: TenantSlugProvider;
  fetcher?: typeof fetch;
  maxRetries?: number;
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

export function createHttpClient(options: ApiClientOptions): HttpClient {
  const context: RequestContext = {
    baseUrl: normalizeBaseUrl(options.baseUrl),
    fetcher: options.fetcher ?? globalThis.fetch.bind(globalThis),
    options,
  };

  return {
    get: <T>(path: string, params?: Record<string, string>) =>
      request<T>(path, context, { method: "GET", params }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, context, { method: "POST", body }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, context, { method: "PUT", body }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, context, { method: "PATCH", body }),
    delete: <T>(path: string) => request<T>(path, context, { method: "DELETE" }),
  };
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const http = createHttpClient(options);

  return {
    getHealth: () => http.get<HealthResponse>("/q/health"),
    getCurrentUser: () => http.get<CurrentUser>("/api/me"),
    listTenantMemberships: async () => {
      const response = await http.get<TenantMembershipsResponse>("/api/me/tenants");
      return response.memberships;
    },
  };
}

interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string>;
}

async function request<T>(
  path: string,
  context: RequestContext,
  requestOptions: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "API-Version": context.options.apiVersion ?? API_VERSION,
  };

  if (requestOptions.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

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

  const url = new URL(trimPath(path), context.baseUrl);
  for (const [key, value] of Object.entries(requestOptions.params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const requestInit: RequestInit = {
    method: requestOptions.method,
    headers,
    body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
  };
  const maxRetries = normalizeRetryCount(context.options.maxRetries);
  let attempt = 0;
  let response: Response;

  while (true) {
    try {
      response = await context.fetcher(url, requestInit);
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      attempt += 1;
      continue;
    }

    if (response.ok || !isTransientStatus(response.status) || attempt >= maxRetries) break;
    attempt += 1;
  }
  const body = response.status === 204 ? undefined : await parseBody(response);

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
  if (contentType.includes("application/json") || contentType.includes("+json")) {
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

function normalizeRetryCount(value: number | undefined): number {
  return value === undefined || !Number.isFinite(value) ? 0 : Math.max(0, Math.floor(value));
}

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}
