# `@emme/features` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Promote genuinely reusable React business capabilities while keeping app-specific pages, routes, layouts, and composition in the applications.

**Architecture:** Features are organized by capability and user experience (`salon`, `client`, or shared), not by tenant identity. A feature may contain components, hooks, query/mutation adapters, schemas, mappers, permissions, and constants, but it consumes public package APIs and never imports another feature’s internals.

**Tech Stack:** React 19, TanStack Query 5, `@emme/ui`, `@emme/core`, `@emme/domain`, `@emme/application`, `@emme/api`, `@emme/i18n`, `@emme/validation`, Vitest 4, Testing Library, Bun.

## Current State

The salon app owns feature folders for dashboard, appointments, clients, services, finances, Google Workspace, settings, auth, and onboarding. Some feature code is already organized with components, hooks, API query modules, domain files, and mappers. There is no `packages/features` package yet. The package must be populated from repeated, generic capability behavior—not by moving every salon screen wholesale.

## Target Tree

```text
packages/features/src/
├── appointments/
│   ├── domain/
│   ├── shared/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentStatusBadge.tsx
│   │   └── AppointmentDate.tsx
│   ├── salon/
│   │   ├── AppointmentCalendar.tsx
│   │   ├── AppointmentTable.tsx
│   │   ├── use-salon-appointments.ts
│   │   └── use-manage-appointment.ts
│   ├── client/
│   │   ├── BookingWizard.tsx
│   │   ├── ServiceSelector.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   ├── use-available-slots.ts
│   │   └── use-create-booking.ts
│   └── index.ts
├── clients/
│   ├── domain/
│   ├── shared/ClientAvatar.tsx
│   ├── salon/
│   │   ├── ClientList.tsx
│   │   ├── ClientForm.tsx
│   │   ├── use-clients.ts
│   │   └── use-create-client.ts
│   └── index.ts
├── services/
│   ├── domain/
│   ├── shared/
│   │   ├── ServiceCard.tsx
│   │   └── ServicePrice.tsx
│   ├── salon/
│   │   ├── ServiceList.tsx
│   │   ├── ServiceForm.tsx
│   │   └── use-manage-services.ts
│   ├── client/
│   │   ├── ServiceCatalog.tsx
│   │   └── use-services.ts
│   └── index.ts
├── staff/
│   ├── domain/
│   ├── salon/
│   │   ├── StaffList.tsx
│   │   ├── StaffForm.tsx
│   │   └── use-staff.ts
│   └── index.ts
├── payments/
│   ├── domain/
│   ├── salon/
│   │   ├── PaymentTable.tsx
│   │   └── use-salon-payments.ts
│   ├── client/
│   │   ├── CheckoutForm.tsx
│   │   └── use-create-payment.ts
│   └── index.ts
└── index.ts
```

Do not promote dashboard, onboarding, settings, Google Workspace, or salon navigation until a reusable public contract is demonstrated. Those remain app-owned initially.

## Migration Mapping

| Current path | Target action |
|---|---|
| `apps/emme-salon-app/src/features/appointments/*` | First candidate: promote reusable appointment cards/status/date and generic query/mutation adapters; keep route page composition app-owned. |
| `apps/emme-salon-app/src/features/clients/*` | Promote client list/form only after API/application contracts use domain-shaped models and props are not salon-specific. |
| `apps/emme-salon-app/src/features/services/*` | Promote service card/price/catalog pieces; retain salon management composition until client/salon contracts diverge clearly. |
| `apps/emme-salon-app/src/features/dashboard/*` | Keep in salon app because dashboard aggregation and stream behavior are app-specific. |
| `apps/emme-salon-app/src/features/finances/*` | Keep in salon app until payment contract and role needs are approved. |
| `apps/emme-salon-app/src/features/google-workspace/*` | Keep in salon app or a later integration package; do not place external integration UI in generic features prematurely. |
| `apps/emme-salon-app/src/features/settings/*` | Keep app-owned settings composition; promote only generic form controls to UI. |

## Public API and Hook Contract

```ts
export interface UseClientsOptions {
  search?: string;
  status?: 'active' | 'inactive';
  enabled?: boolean;
}

export function useClients(options?: UseClientsOptions): UseQueryResult<readonly Client[]>;

export interface CreateClientMutationInput {
  name: string;
  phone: string;
  email?: string;
}

export function useCreateClient(): UseMutationResult<Client, Error, CreateClientMutationInput>;
```

Hooks call application use cases or API operations through injected/public providers and own query keys, invalidation, and mutation state. Components receive domain/application-shaped data and do not call HTTP directly.

## TDD Tasks

### Task 1: Create feature package boundary and promotion criteria

**Files:** Create `packages/features/package.json`, `tsconfig.json`, `src/index.ts`, package-level boundary test, and root workspace scripts.

- [ ] Red: add a boundary test that imports one capability through `@emme/features` and rejects app-internal, browser, or direct infrastructure imports.
- [ ] Run the package test and expect failure because the package does not exist or lacks exports.
- [ ] Green: create the package with allowed dependencies and public capability barrels.
- [ ] Run `bun run --filter @emme/features typecheck && bun run --filter @emme/features test`.
- [ ] Refactor: keep package exports explicit and avoid exporting every internal component by default.
- [ ] Commit with `feat(features): add reusable feature package boundary`.

### Task 2: Promote appointment shared components and hooks

**Files:** Create `packages/features/src/appointments/shared/*`, `appointments/salon/*` as required; update salon appointment consumers and add colocated tests.

- [ ] Red: add component tests for appointment status/date rendering and hook tests for list query keys, loading/error state, cancellation mutation, and cache invalidation using `@emme/test-support`.
- [ ] Run focused tests and confirm failures before implementation.
- [ ] Green: move only generic components/hooks, inject/use public application/API contracts, and keep salon route pages in the app.
- [ ] Run package and affected salon tests; expect PASS.
- [ ] Refactor: remove duplicated app implementation only after import scans show all consumers use `@emme/features`.
- [ ] Run `bun run --filter @emme/features typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(features): promote reusable appointment capability`.

### Task 3: Promote client and service capabilities incrementally

**Files:** `packages/features/src/{clients,services}/`, corresponding app feature files, colocated tests.

- [ ] Red: add tests for generic props, schema validation, create/update mutation state, query invalidation, and mapper behavior using domain fixtures and fake API/application ports.
- [ ] Run focused tests and confirm failures.
- [ ] Green: promote only components/hooks with stable cross-app props; keep app-specific layout and route page wrappers local.
- [ ] Run package and salon tests; expect PASS.
- [ ] Refactor: keep feature directories capability-specific and expose through nearest `index.ts` files.
- [ ] Run `bun run --filter @emme/features typecheck && bun run --filter @emme/features build && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit each capability as `refactor(features): promote <capability> adapters`.

### Task 4: Prove no cross-feature internal imports

**Files:** `packages/features/src/__tests__/feature-boundary.test.ts`, package barrels, migrated app imports.

- [ ] Red: add a source scan rejecting `appointments/*` imports from clients internals, deep imports into another feature, and package imports from app paths.
- [ ] Run package tests and confirm the scan catches an intentionally invalid fixture or existing violation.
- [ ] Green: replace invalid imports with public capability barrels or shared package contracts.
- [ ] Run `bun run --filter @emme/features test`.
- [ ] Refactor: document one-way feature ownership and public exports.
- [ ] Run `bun run --filter @emme/features typecheck && bun run --filter @emme/features build`.
- [ ] Commit with `test(features): enforce capability boundaries`.

## Acceptance Criteria

- [ ] Features are reusable by role experience, not tenant identity.
- [ ] Components do not perform HTTP or business calculations directly.
- [ ] Hooks own React Query/cache behavior and consume stable use-case/API contracts.
- [ ] App-only dashboard, onboarding, settings, and external integration UI remains app-owned until proven reusable.

## Verification and Definition of Done

```bash
bun run --filter @emme/features typecheck
bun run --filter @emme/features test
bun run --filter @emme/features build
bun run --filter @emme/emme-salon-app typecheck
bun run --filter @emme/emme-salon-app test
```

- [ ] At least one promoted capability is consumed by the salon app through the public package entry point.
- [ ] No feature imports another feature’s internal files or app internals.
- [ ] All changes are committed and pushed.

