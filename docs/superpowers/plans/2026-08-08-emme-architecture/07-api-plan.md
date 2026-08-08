# `@emme/api` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Make `@emme/api` the reusable, typed backend boundary containing contracts, DTO parsing, routes, capability operations, and transport ports under the final `api` name.

**Architecture:** API code knows what backend operations and payloads exist, but not how HTTP is implemented. It converts backend DTOs to application-facing models at the boundary and accepts an injected `HttpClient`. It must not instantiate fetch/Axios/Apollo, read storage, or import React.

**Tech Stack:** TypeScript 5.8+, strict NodeNext package build, Vitest 4, Bun; existing extracted typings from the `api-client` and `contracts` libraries are migration inputs.

## Current State

The workspace already has `packages/api` under the desired final name, with common routes/types, capability adapters for clients, appointments, services, integrations, an HTTP port, and package-level contract tests. The API package was previously referred to as `api-client`; no new package with that name may be introduced. The extracted typings from `/Users/miguelangeldelgadillozarate/Development/emme-web/packages/api-client` and `/Users/miguelangeldelgadillozarate/Development/emme-web/packages/contracts` must be audited against the checked-in package before finalizing contracts.

## Target Tree

```text
packages/api/src/
├── contracts/
│   ├── common/
│   │   ├── pagination.types.ts
│   │   ├── sorting.types.ts
│   │   └── filter.types.ts
│   ├── auth/
│   │   ├── auth.dto.ts
│   │   └── user.dto.ts
│   ├── tenants/tenant.dto.ts
│   ├── clients/
│   │   ├── client.dto.ts
│   │   └── client.requests.ts
│   ├── appointments/
│   │   ├── appointment.dto.ts
│   │   ├── appointment.requests.ts
│   │   └── availability.dto.ts
│   ├── services/
│   │   ├── service.dto.ts
│   │   └── service.requests.ts
│   ├── payments/payment.dto.ts
│   └── errors/api-error.types.ts
├── ports/http-client.ts
├── auth/auth.api.ts
├── tenants/tenants.api.ts
├── clients/clients.api.ts
├── appointments/
│   ├── appointments.api.ts
│   └── availability.api.ts
├── services/services.api.ts
├── staff/staff.api.ts
├── payments/payments.api.ts
├── integrations/
│   ├── calendar-sync/api.ts
│   ├── google-oauth/api.ts
│   └── google-sheets/api.ts
├── testing/provider.ts
├── create-api.ts
└── index.ts
```

Current capability filenames can be retained temporarily when their public exports are stable, but new files use plural capability names (`clients.api.ts`, not `client-api.ts`).

## Migration Mapping

| Current path or source | Target action |
|---|---|
| `packages/api/src/common/common.types.ts` | Split reusable contract types into `contracts/common/`; keep route constants in `routes.ts`. |
| `packages/api/src/common/routes.ts` | Keep as the single API route source; remove page-route concerns if app routing can own them. |
| `packages/api/src/ports/http-client.ts` | Keep as the transport port and move response parsing helpers beside contract adapters. |
| `packages/api/src/{clients,appointments,services,integrations}/*` | Normalize under `contracts/` plus capability API adapters and export from root. |
| `/Users/miguelangeldelgadillozarate/Development/emme-web/packages/api-client` | Audit public names and move reusable typed operations into this package; no `api-client` package name remains. |
| `/Users/miguelangeldelgadillozarate/Development/emme-web/packages/contracts` | Audit DTOs and requests, preserve backend field names in `contracts/`, and map them to domain/application types at the API boundary. |
| `apps/emme-salon-app/src/api/*` | Replace direct client construction and app DTO parsing with `createApi`/capability operations from `@emme/api`. |
| `packages/api/src/__tests__/capability-apis.test.ts` | Keep as package-level cross-capability contract coverage. |

## Public API and Protocols

```ts
export interface HttpClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export interface ClientsApi {
  list(filters?: ClientFilters): Promise<ClientDto[]>;
  getById(id: string): Promise<ClientDto>;
  create(input: CreateClientRequest): Promise<ClientDto>;
  update(id: string, input: UpdateClientRequest): Promise<ClientDto>;
  retire(id: string): Promise<void>;
}

export interface Api {
  clients: ClientsApi;
  appointments: AppointmentsApi;
  services: ServicesApi;
}

export function createApi(http: HttpClient): Api;
```

DTOs preserve backend names and optionality. Domain mapping occurs in API adapters or infrastructure repository adapters according to the agreed port boundary; UI components never consume raw DTOs.

## TDD Tasks

### Task 1: Audit extracted contracts and finalize the `api` naming boundary

**Files:** `packages/api/src/contracts/*`, package manifest/export map, `packages/api/src/__tests__/capability-apis.test.ts`.

- [ ] Red: add contract tests for the canonical client, appointment, service, tenant, auth, and error DTO shapes imported from `@emme/api`; add a test that fails if `api-client` appears in public package metadata or exports.
- [ ] Run `bun run --filter @emme/api test`; expect failures for missing DTOs or stale names.
- [ ] Green: compare the extracted `api-client` and `contracts` sources with checked-in types, copy only agreed reusable contracts into `packages/api/src/contracts/`, and update all exports to `@emme/api`.
- [ ] Run the focused tests and expect PASS.
- [ ] Refactor: delete duplicate or ambiguous contract aliases and preserve compatibility only through documented type aliases when an existing app import needs a transition.
- [ ] Run `bun run --filter @emme/api typecheck && bun run --filter @emme/api test`.
- [ ] Commit with `refactor(api): consolidate extracted contracts under api`.

### Task 2: Stabilize transport port and response parsing

**Files:** `packages/api/src/ports/http-client.ts`, parsing helpers, colocated tests, `src/__tests__/capability-apis.test.ts`.

- [ ] Red: add tests for object/array response validation, missing required fields, optional fields, status normalization, and malformed payload errors.
- [ ] Run focused tests and confirm failures before implementation.
- [ ] Green: keep a minimal `HttpClient` port and typed parsing helpers that reject malformed unknown payloads with stable errors.
- [ ] Run `bun run --filter @emme/api test`; expect PASS.
- [ ] Refactor: separate transport types from capability DTOs and keep parsers free of HTTP implementation details.
- [ ] Run `bun run --filter @emme/api typecheck && bun run --filter @emme/api build`.
- [ ] Commit with `test(api): cover transport and DTO parsing contracts`.

### Task 3: Normalize capability API factories

**Files:** `packages/api/src/{clients,appointments,services,auth,tenants,payments}/*`, `create-api.ts`, tests.

- [ ] Red: add fake-HTTP tests that assert exact route, method, query/body payload, and mapped DTO for list/get/create/update/status operations used by the salon app.
- [ ] Run focused tests and confirm route or export failures before implementation.
- [ ] Green: implement capability factories that receive `HttpClient`, use the canonical route constants, and map unknown responses through parsers.
- [ ] Run `bun run --filter @emme/api test`; expect PASS.
- [ ] Refactor: expose a single `createApi(http)` composition factory and keep capability API functions independently testable.
- [ ] Run `bun run --filter @emme/api typecheck && bun run --filter @emme/api build`.
- [ ] Commit with `feat(api): expose typed capability API factories`.

### Task 4: Migrate app API consumers and remove legacy naming

**Files:** `apps/emme-salon-app/src/api/*`, feature API modules, package manifests, import-boundary tests.

- [ ] Red: add a salon integration test that injects a fake `Api` into the composition root and verifies a client/appointment query uses the public package operation rather than a direct REST client.
- [ ] Run the focused app test and expect failure before composition wiring.
- [ ] Green: replace app-local API client construction with `createApi`, preserve query keys and payloads, and update imports from any `api-client`/deep path to `@emme/api`.
- [ ] Run `bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Refactor: remove duplicate app DTO parsing after import scans prove no consumer depends on it.
- [ ] Run `rg -n "api-client|src/api/restClient|src/api/platformClient" apps packages --glob '!**/dist/**'` and expect no legacy consumer matches; then run package/app builds.
- [ ] Commit with `refactor(salon-app): consume canonical api package`.

## Acceptance Criteria

- [ ] `@emme/api` is the only reusable typed client package name.
- [ ] Contracts preserve backend DTOs while adapters expose stable typed operations.
- [ ] API operations accept injected transport ports and never instantiate concrete clients.
- [ ] Exact routes and payloads are covered by package-level contract tests.
- [ ] No app component imports raw DTOs or performs HTTP calls directly.

## Verification and Definition of Done

```bash
bun run --filter @emme/api typecheck
bun run --filter @emme/api test
bun run --filter @emme/api build
bun run --filter @emme/emme-salon-app typecheck
bun run --filter @emme/emme-salon-app test
rg -n "api-client|client-api" apps packages --glob '!**/dist/**'
```

- [ ] The final search returns no active legacy imports or package names.
- [ ] External extracted sources have been reconciled and are not imported by filesystem path.
- [ ] All changes are committed and pushed.
