# `@emme/infrastructure` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Isolate concrete browser, network, storage, auth, and external-system implementations behind the API and application ports.

**Architecture:** Infrastructure is the adapter layer. It may use fetch, Axios, browser storage, token persistence, retry/timeout, analytics, logging, and concrete API SDKs. It must not leak those implementations into domain/application or require UI components to know transport details.

**Tech Stack:** TypeScript 5.8+, fetch-compatible HTTP, current auth/storage adapters, `@emme/api`, `@emme/application`, Vitest 4, Bun.

## Current State

`packages/infrastructure` already contains a fetch HTTP client, API error, client repository adapter, token storage, appointment/client adapters, and colocated tests. The salon app still owns `src/api/restClient.ts`, `apiClientInstance.ts`, `platformClient.ts`, and authentication/session wiring. The infrastructure plan moves concrete behavior without moving app-specific composition.

## Target Tree

```text
packages/infrastructure/src/
├── http/
│   ├── fetch-http-client.ts
│   ├── request-builder.ts
│   ├── api-error.ts
│   ├── timeout.ts
│   ├── retry.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       ├── tenant.interceptor.ts
│       ├── request-id.interceptor.ts
│       ├── error.interceptor.ts
│       └── retry.interceptor.ts
├── api/
│   ├── appointment-repository.adapter.ts
│   ├── client-repository.adapter.ts
│   ├── service-repository.adapter.ts
│   └── tenant-repository.adapter.ts
├── auth/
│   ├── browser-token-storage.ts
│   ├── refresh-token-client.ts
│   └── session-storage.ts
├── storage/
│   ├── local-storage.ts
│   ├── session-storage.ts
│   └── storage.types.ts
├── analytics/
│   ├── analytics-client.ts
│   └── analytics-events.ts
├── observability/
│   ├── logger.ts
│   ├── error-reporter.ts
│   └── performance-monitor.ts
├── browser/
│   ├── locale.ts
│   ├── time-zone.ts
│   └── browser-runtime.ts
└── index.ts
```

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/infrastructure/src/http/fetch-http-client.ts` | Keep as concrete HTTP implementation; split request building/retry only when tests identify a separate responsibility. |
| `packages/infrastructure/src/http/api-error.ts` | Keep as normalized transport error and align status/code/field contracts with `@emme/api`. |
| `packages/infrastructure/src/api/*-repository.adapter.ts` | Implement `@emme/application` ports and map API DTOs to domain models. |
| `packages/infrastructure/src/auth/token-storage.ts` | Keep protocol and browser adapter separate; expose browser storage only from infrastructure. |
| `apps/emme-salon-app/src/api/restClient.ts` | Replace with `createFetchHttpClient` from infrastructure in the app composition root. |
| `apps/emme-salon-app/src/api/apiClientInstance.ts` | Delete after `createApi(httpClient)` is wired once in `AppProviders`. |
| `apps/emme-salon-app/src/api/platformClient.ts` | Move reusable concrete transport logic into infrastructure; platform-specific operations remain API/application-owned. |
| `apps/emme-salon-app/src/app/auth/sessionModel.ts` | Keep auth state model in core; keep token persistence/refresh implementation here. |
| `apps/emme-salon-app/src/services/cacheService.ts` | Keep only app-specific offline/cache policy; reusable storage adapter belongs here. |

## Public API and Protocols

```ts
export interface AccessTokenProvider {
  getAccessToken(): string | null | Promise<string | null>;
}

export interface TenantSlugProvider {
  getTenantSlug(): string | null | Promise<string | null>;
}

export interface ApiClientOptions {
  baseUrl: string;
  accessTokenProvider?: AccessTokenProvider;
  tenantSlugProvider?: TenantSlugProvider;
  timeoutMs?: number;
}

export function createHttpClient(options: ApiClientOptions): HttpClient;
export function createApiClient(options: ApiClientOptions): ApiClient;

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string>;
}
```

Concrete adapters accept protocols for token, tenant, clock, logger, and storage dependencies. They never read auth or tenant state from a module-level singleton.

## TDD Tasks

### Task 1: Stabilize HTTP client and normalized errors

**Files:** `packages/infrastructure/src/http/*`, existing HTTP tests, `api-error.ts` tests.

- [ ] Red: add tests for base URL joining, JSON parsing, timeout abort, network error normalization, 401/403/404/409/422/429/500 mapping, and auth/tenant headers from injected providers.
- [ ] Run `bun run --filter @emme/infrastructure test`; confirm each failure occurs before implementation.
- [ ] Green: implement the minimum request pipeline with injectable providers and normalized `ApiHttpError`.
- [ ] Run focused tests and expect PASS.
- [ ] Refactor: extract retry/timeout/interceptor responsibilities only where tests show independent behavior; preserve one public client factory.
- [ ] Run `bun run --filter @emme/infrastructure typecheck && bun run --filter @emme/infrastructure test`.
- [ ] Commit with `feat(infrastructure): harden http client and api errors`.

### Task 2: Implement application repository adapters

**Files:** `packages/infrastructure/src/api/*-repository.adapter.ts`, adapter tests, application port imports.

- [ ] Red: add fake-API tests for client list/create/update, appointment list/cancel, and service operations; assert DTO-to-domain mapping and propagated typed errors.
- [ ] Run focused tests and confirm failures before implementation.
- [ ] Green: inject `@emme/api` capability APIs into adapter factories and implement application ports without adding business policy to the adapter.
- [ ] Run `bun run --filter @emme/infrastructure test`; expect PASS.
- [ ] Refactor: keep mapping functions focused and avoid exposing DTO fields to application callers.
- [ ] Run `bun run --filter @emme/infrastructure typecheck && bun run --filter @emme/infrastructure build`.
- [ ] Commit with `feat(infrastructure): add repository adapters for application ports`.

### Task 3: Separate browser storage and auth persistence

**Files:** `packages/infrastructure/src/auth/*`, `src/storage/*`, existing token-storage tests, new colocated tests.

- [ ] Red: add tests for token read/write/clear, missing token, storage exceptions, refresh-client request behavior, and no access to real `localStorage` in unit tests.
- [ ] Run focused tests and confirm failure before implementation.
- [ ] Green: implement browser adapters over an injected `Storage` protocol and expose a refresh client over injected HTTP.
- [ ] Run package tests and expect PASS.
- [ ] Refactor: keep storage serialization and auth refresh separate; do not put auth state transitions in infrastructure.
- [ ] Run `bun run --filter @emme/infrastructure typecheck && bun run --filter @emme/infrastructure test`.
- [ ] Commit with `feat(infrastructure): isolate browser auth storage`.

### Task 4: Add runtime detection and observability adapters

**Files:** `packages/infrastructure/src/browser/*`, `analytics/*`, `observability/*`, tests.

- [ ] Red: add tests for explicit locale/time-zone detection fallbacks, no-window server-safe behavior, logger level forwarding, and analytics event payloads.
- [ ] Run focused tests and expect failures before implementation.
- [ ] Green: implement adapters that return runtime values and accept injected external integrations.
- [ ] Run package tests and expect PASS.
- [ ] Refactor: keep telemetry optional and prevent secrets, tokens, or raw response bodies from being logged.
- [ ] Run `bun run --filter @emme/infrastructure typecheck && bun run --filter @emme/infrastructure build`.
- [ ] Commit with `feat(infrastructure): add browser and observability adapters`.

## Acceptance Criteria

- [ ] Concrete HTTP, storage, auth, browser, and external integrations live only in infrastructure.
- [ ] Application repository ports have tested adapters.
- [ ] Errors are normalized once and preserve status/code/field information.
- [ ] Runtime values are supplied through injectable providers.
- [ ] No infrastructure implementation is imported by domain code.

## Verification and Definition of Done

```bash
bun run --filter @emme/infrastructure typecheck
bun run --filter @emme/infrastructure test
bun run --filter @emme/infrastructure build
```

- [ ] Timeout, retry, auth expiry, tenant header, conflict, and malformed-response tests pass.
- [ ] No token or sensitive response data appears in test snapshots or logs.
- [ ] All changes are committed and pushed.

