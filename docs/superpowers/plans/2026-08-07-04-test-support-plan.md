# @emme/test-support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Centralize reusable test providers, fakes, fixtures, and transport handlers without leaking test code into production packages.

**Architecture:** Test support depends on test tooling and public package contracts only. Production packages never depend on it. App and package tests may consume it as a dev dependency.

**Tech Stack:** TypeScript, Vitest, Testing Library, MSW when the transport boundary requires it, Bun.

## Global Constraints

- Never include real credentials or uncontrolled external calls.
- Use protocol-based fakes rather than mocking owned modules with `vi.mock`.
- Keep test factories tenant-agnostic and deterministic.
- Colocate tests for non-trivial fakes; use package integration tests for provider composition.

## Current inventory

- Existing `packages/test-support/src/memory-storage.ts` and `memory-storage.test.ts`.
- App setup in `apps/emme-salon-app/src/setupTests.ts`.
- App provider composition in `apps/emme-salon-app/src/app/AppProviders.tsx`.
- E2E providers under `e2e/src/providers/` remain E2E-owned unless a reusable contract is explicitly extracted.

## Target structure

```text
packages/test-support/src/
├── render-with-providers.tsx
├── test-wrapper.tsx
├── mock-auth.ts
├── mock-tenancy.ts
├── mock-api.ts
├── mock-permissions.ts
├── fixtures/
│   ├── users.fixture.ts
│   ├── tenants.fixture.ts
│   ├── clients.fixture.ts
│   ├── appointments.fixture.ts
│   └── services.fixture.ts
├── handlers/
│   ├── auth.handlers.ts
│   ├── tenant.handlers.ts
│   ├── appointment.handlers.ts
│   ├── client.handlers.ts
│   └── service.handlers.ts
├── memory-storage.ts
└── index.ts
```

### Task 1: Define test-provider protocols and wrappers

**Files:**
- Create: `packages/test-support/src/test-wrapper.tsx`
- Create: `packages/test-support/src/render-with-providers.tsx`
- Create: `packages/test-support/src/mock-auth.ts`
- Create: `packages/test-support/src/mock-tenancy.ts`
- Create: `packages/test-support/src/mock-permissions.ts`
- Modify: `packages/test-support/src/index.ts`
- Test: `packages/test-support/src/__tests__/provider-boundary.test.tsx`

- [ ] Step 1: Write tests proving defaults are deterministic and provider overrides are isolated per test.
- [ ] Step 2: Run focused tests; expect RED.
- [ ] Step 3: Implement wrappers that accept explicit auth, tenant, permission, and QueryClient options.
- [ ] Step 4: Run package tests and typecheck; expect PASS.
- [ ] Step 5: Commit `feat(test-support): add reusable provider test harness`.

### Task 2: Add fixtures, factories, and handlers

**Files:**
- Create: `packages/test-support/src/fixtures/*.fixture.ts`
- Create: `packages/test-support/src/handlers/*.handlers.ts`
- Create: `packages/test-support/src/mock-api.ts`
- Test: colocated factory/handler tests and `src/__tests__/handler-contract.test.ts`.

- [ ] Step 1: Write tests for unique IDs, tenant scoping, valid default records, and controllable API failures.
- [ ] Step 2: Run focused tests; expect RED.
- [ ] Step 3: Implement factories and handlers using public `@emme/api` contracts.
- [ ] Step 4: Run package tests; expect PASS.
- [ ] Step 5: Commit `feat(test-support): add reusable fixtures and API handlers`.

### Task 3: Migrate package and salon tests

**Files:**
- Modify: `apps/emme-salon-app/src/setupTests.ts`
- Modify: app tests that duplicate QueryClient/auth/tenant setup.
- Modify: package test configs only where shared setup is needed.

- [ ] Step 1: Add regression tests around one migrated app provider and one package adapter.
- [ ] Step 2: Run the focused tests; expect failures from setup replacement only.
- [ ] Step 3: Replace duplicated fixtures with `@emme/test-support` imports and keep E2E provider setup separate.
- [ ] Step 4: Run package tests, app tests, typecheck, and mock E2E.
- [ ] Step 5: Commit `refactor(testing): consume shared test support`.

## Verification

```bash
bun run --filter @emme/test-support typecheck
bun run --filter @emme/test-support test
bun run --filter @emme/emme-salon-app test
bun run --filter @emme/e2e test
```

## Definition of done

- [ ] Package and app tests use reusable deterministic setup.
- [ ] No production package imports `@emme/test-support`.
- [ ] E2E tests remain isolated and do not require real credentials in mock mode.
