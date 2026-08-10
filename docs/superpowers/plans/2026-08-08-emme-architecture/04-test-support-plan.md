# `@emme/test-support` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Provide reusable test providers, fakes, factories, fixtures, and handlers without leaking test-only dependencies into production packages.

**Architecture:** Test support is a development-only adapter package. It may depend on public package contracts and test libraries, but production packages must never import it at runtime. Unit tests prefer protocol fakes over `vi.mock`; package `src/__tests__/` contains cross-module integration and contract tests.

**Tech Stack:** Vitest 4, Testing Library, React 19, MSW where HTTP integration tests require it, TypeScript 5.8+, Bun.

## Current State

`packages/test-support` currently contains `MemoryStorage` and a colocated test. The salon app has `src/setupTests.ts`, provider setup, stores, and feature-specific mocks that should be consolidated only when they are reusable and do not encode salon-only behavior.

## Target Tree

```text
packages/test-support/src/
├── render-with-providers.tsx
├── test-wrapper.tsx
├── mock-auth.ts
├── mock-tenancy.ts
├── mock-api.ts
├── mock-permissions.ts
├── memory-storage.ts
├── fixtures/
│   ├── users.fixture.ts
│   ├── tenants.fixture.ts
│   ├── clients.fixture.ts
│   ├── appointments.fixture.ts
│   └── services.fixture.ts
├── handlers/
│   ├── api.handlers.ts
│   └── server.ts
├── __tests__/
│   └── provider-contracts.test.tsx
└── index.ts
```

Do not add a fixture until a package or application test consumes the same fixture shape more than once.

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/test-support/src/memory-storage.ts` | Keep as the storage protocol fake and expand only with tested behavior. |
| `apps/emme-salon-app/src/setupTests.ts` | Keep app-specific setup; replace reusable providers/fakes with package exports. |
| `apps/emme-salon-app/src/app/auth/*` tests | Use `mock-auth.ts` and `mock-tenancy.ts` where behavior is generic; keep tenant onboarding fixtures local. |
| Feature tests under `apps/emme-salon-app/src/features/**` | Move reusable API handlers/factories only after a second app or package needs them. |
| Package unit tests | Prefer injected fake protocols; use `vi.mock()` only for external libraries that cannot be injected. |

## Public API

```ts
export interface FakeAuthState {
  status: 'loading' | 'signedOut' | 'authenticated' | 'tenantRequired';
  userId?: string;
}

export interface FakeTenantState {
  tenantId: string;
  slug: string;
}

export function createMemoryStorage(
  initial?: Record<string, string>,
): Storage;

export function createTestWrapper(options?: {
  auth?: Partial<FakeAuthState>;
  tenant?: Partial<FakeTenantState>;
  locale?: string;
}): React.ComponentType<{ children: React.ReactNode }>;
```

Fakes must expose controlled error injection through explicit fields or function parameters. They must not make real HTTP calls, read real credentials, or silently share mutable state between tests.

## TDD Tasks

### Task 1: Stabilize storage and fake state contracts

**Files:** `packages/test-support/src/memory-storage.ts`, its colocated test, `mock-auth.ts`, `mock-tenancy.ts`, and package barrel.

- [ ] Red: add tests for set/get/remove/clear isolation and explicit auth/tenant state overrides.
- [ ] Run `bun run --filter @emme/test-support test`; expect failures for missing fake exports or incorrect storage behavior.
- [ ] Green: implement the minimum deterministic fake contracts.
- [ ] Run the focused tests and expect PASS.
- [ ] Refactor: ensure every factory creates fresh state and no module-level mutable singleton is shared.
- [ ] Run `bun run --filter @emme/test-support typecheck && bun run --filter @emme/test-support test`.
- [ ] Commit with `feat(test-support): add isolated auth and tenancy fakes`.

### Task 2: Add reusable React test providers

**Files:** Create `render-with-providers.tsx`, `test-wrapper.tsx`, `mock-permissions.ts`, and colocated/provider integration tests.

- [ ] Red: add a component test that renders a child through the wrapper and verifies locale, auth, tenant, query, and permission context can be overridden per test.
- [ ] Run the focused test and expect failure before the wrapper exists.
- [ ] Green: compose only public providers from `@emme/core`, `@emme/i18n`, and test-only query clients; expose `renderWithProviders` with an options object.
- [ ] Run `bun run --filter @emme/test-support test`; expect PASS.
- [ ] Refactor: keep the default query client fresh per render and remove any real API client construction from the helper.
- [ ] Run `bun run --filter @emme/test-support typecheck && bun run --filter @emme/test-support test`.
- [ ] Commit with `feat(test-support): add reusable provider test wrapper`.

### Task 3: Add fixtures and package-level handlers only for shared contracts

**Files:** `packages/test-support/src/fixtures/*`, `packages/test-support/src/handlers/*`, `packages/test-support/src/__tests__/provider-contracts.test.tsx`, and package barrel.

- [ ] Red: add a contract test for one representative fixture and one API handler used by a package integration test; assert stable IDs, required fields, and deterministic dates.
- [ ] Run the test and confirm it fails if the fixture or handler contract is incomplete.
- [ ] Green: implement factories with override parameters and handlers with explicit response data/error scenarios.
- [ ] Run the package test and expect PASS.
- [ ] Refactor: remove fields that are not required by consumers and keep handlers free of app-only route assumptions.
- [ ] Run `bun run --filter @emme/test-support build && bun run --filter @emme/test-support test`.
- [ ] Commit with `feat(test-support): add shared fixtures and handlers`.

## Acceptance Criteria

- [ ] Test support exports only test utilities and never becomes a runtime production dependency.
- [ ] Each factory returns fresh state and supports deterministic overrides.
- [ ] Shared provider tests do not require real network, storage, auth, or browser credentials.
- [ ] Colocated unit tests and package-level `__tests__` responsibilities are documented by usage.

## Verification and Definition of Done

```bash
bun run --filter @emme/test-support typecheck
bun run --filter @emme/test-support test
bun run --filter @emme/test-support build
```

- [ ] Package exports are consumed by at least the migrated package/app tests.
- [ ] Root tests remain green and no production bundle imports `@emme/test-support`.
- [ ] All changes are committed and pushed.

