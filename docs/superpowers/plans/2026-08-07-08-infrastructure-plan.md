# Infrastructure Package Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Centralize concrete HTTP, authentication, browser storage, and API-to-application adapters in `@emme/infrastructure`.
**Architecture:** Hexagonal adapters implement `@emme/api` transport ports and `@emme/application` repository ports. The package is the only library allowed to depend on concrete browser/network mechanisms.
**Tech Stack:** TypeScript, Bun workspaces, Vitest, native `fetch`, browser storage APIs, `@emme/api`, `@emme/application`.

## Global Constraints

- Concrete external side effects are isolated here and injected at application composition roots.
- No infrastructure module imports React components or owns React Query state.
- Authentication and tenant headers are attached through explicit request context, not global mutable state.
- Error normalization must produce stable `ApiError` values without exposing raw backend payloads to UI.
- Tests use fake fetch, fake storage, and fake API clients; real network calls are never made in unit tests.

---

## 1. Current Inventory and Target Structure

Current code includes `http/fetch-http-client.ts`, `http/api-error.ts`, `auth/token-storage.ts`, `api/client-repository.adapter.ts`, and their tests. The salon app still owns `src/api/restClient.ts` and `apiClientInstance.ts`.

Target structure:

```text
packages/infrastructure/src/
├── http/
│   ├── fetch-http-client.ts
│   ├── request-builder.ts
│   ├── api-error.ts
│   ├── timeout.ts
│   ├── retry.ts
│   └── interceptors/{auth.interceptor.ts,tenant.interceptor.ts,error.interceptor.ts,retry.interceptor.ts}
├── auth/{browser-token-storage.ts,refresh-token-client.ts,session-storage.ts}
├── storage/{local-storage.ts,session-storage.ts,storage.types.ts}
├── api/
│   ├── appointment-repository.adapter.ts
│   ├── client-repository.adapter.ts
│   ├── service-repository.adapter.ts
│   ├── staff-repository.adapter.ts
│   └── payment-repository.adapter.ts
├── analytics/{analytics-client.ts,analytics-events.ts}
├── feature-flags/feature-flag-client.ts
├── observability/{logger.ts,error-reporter.ts,performance-monitor.ts}
├── browser/{online-status.ts,visibility-state.ts,browser-runtime.ts}
└── index.ts
```

Concrete analytics, feature-flag, and observability adapters are added only for integrations already used by an app or explicitly required by the runtime. Their ports remain in `@emme/core` or `@emme/application`.

## 2. Ordered Tasks

### Task 1: Harden the HTTP adapter

**Files:** `packages/infrastructure/src/http/**`, colocated tests.

Write failing tests for successful JSON responses, empty responses, non-JSON errors, timeout cancellation, retryable status codes, authentication/tenant headers, and normalized status/code/field errors. Implement the minimum native-fetch adapter behind `@emme/api`’s `HttpClient` port. Refactor request construction and retry policy into focused pure helpers.

The adapter must accept `baseUrl`, `fetchImplementation`, timeout policy, and retry policy as constructor/factory dependencies so tests do not patch global fetch.

### Task 2: Add auth and storage adapters

**Files:** `packages/infrastructure/src/auth/**`, `storage/**`, `packages/infrastructure/src/auth/*.test.ts`, `storage/*.test.ts`.

Write tests for token read/write/remove, missing storage, storage exceptions, session restoration, refresh success, refresh failure, and logout cleanup. Implement browser adapters behind small interfaces. The infrastructure package must not expose raw storage objects to feature code.

### Task 3: Implement application-port adapters

**Files:** `packages/infrastructure/src/api/**`, adapters and tests.

For appointments, clients, services, staff, and payments, write adapter tests with fake `@emme/api` capability clients. Map API DTOs to `@emme/domain` models and map domain inputs to API request DTOs. Verify pagination, tenant context, version/concurrency fields, missing resources, and API error propagation.

Adapters implement ports from `@emme/application`; they do not own business rules. A rule needed to reject an operation belongs in domain/application tests, not in an HTTP adapter.

### Task 4: Wire the salon composition root

**Files:** `apps/emme-salon-app/src/app/AppProviders.tsx`, `src/app/config/**`, `packages/infrastructure/src/index.ts`, affected tests.

Create the concrete HTTP client, API SDK, repository adapters, token storage, and runtime dependencies once in the app composition root. Pass them into core providers and application hooks. Remove app-local REST singleton creation only after all consumers use injected dependencies.

### Task 5: Verify external-adapter boundaries

**Files:** package-level boundary tests and package metadata.

Add tests that public exports are explicit and a source scan proving concrete network/storage imports are confined to infrastructure. Run the complete package and salon-app suite.

## 3. Verification

- `bunx vitest run packages/infrastructure/src`
- `bunx tsc -p packages/infrastructure/tsconfig.json --noEmit`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `rg -n "from" packages/infrastructure/src | rg "react|@tanstack/react-query"` returns no UI imports.

## 4. Definition of Done

- [ ] HTTP behavior is tested through injected fetch implementations.
- [ ] Auth/storage behavior is isolated behind adapters and tested for failure paths.
- [ ] Application repository ports have concrete API adapters with DTO mapping tests.
- [ ] Salon app creates infrastructure in one composition root and has no duplicate REST singleton.
- [ ] Error, retry, timeout, tenant, and token behavior is verified.
