# `@emme/domain` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Establish pure, framework-independent business models and rules for appointments, clients, services, payments, and shared value concepts.

**Architecture:** Domain code describes what the business means, not how data is fetched or displayed. It imports no React, Zod, API DTO, infrastructure, storage, or browser code. Application use cases consume these types and rules through the package barrel.

**Tech Stack:** TypeScript 5.8+, Vitest 4, Bun; no runtime workspace dependency.

## Current State

`packages/domain` already contains appointment status/rules/types and client rules/types with colocated tests. The salon app still duplicates `features/appointments/domain`, `features/clients/domain`, and `features/services/domain`. The migration must compare semantics before moving files because app types are view/API-shaped in places.

## Target Tree

```text
packages/domain/src/
├── appointments/
│   ├── appointment.types.ts
│   ├── appointment-status.ts
│   ├── appointment.rules.ts
│   ├── cancellation.rules.ts
│   └── index.ts
├── clients/
│   ├── client.types.ts
│   ├── client.rules.ts
│   └── index.ts
├── services/
│   ├── service.types.ts
│   ├── service.rules.ts
│   └── index.ts
├── payments/
│   ├── payment.types.ts
│   ├── payment-status.ts
│   ├── payment.rules.ts
│   └── index.ts
├── shared/
│   ├── money.ts
│   ├── date-range.ts
│   └── domain-error.ts
├── __tests__/
│   └── capability-contracts.test.ts
└── index.ts
```

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/domain/src/appointments/*` | Keep, normalize names and exports, and add only rules required by current behavior. |
| `packages/domain/src/clients/*` | Keep, normalize types and rules. |
| `apps/emme-salon-app/src/features/appointments/domain/*` | Compare with package types; move pure business rules and retain UI view types locally until consumers use domain types. |
| `apps/emme-salon-app/src/features/clients/domain/*` | Move pure client rules/types; remove duplicate app definitions after feature tests pass. |
| `apps/emme-salon-app/src/features/services/domain/*` | Move `service.rules.ts` and `service.types.ts` after checking price/duration invariants; keep view mapper types app/feature-owned. |
| `apps/emme-salon-app/src/features/*/mappers/*` | Do not move presentation mappers into domain. |

## Public API

```ts
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  tenantId: string;
  clientId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
}

export interface CreateClientInput {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateClientInput {
  name?: string;
  phone?: string;
  email?: string;
}

export function canCancelAppointment(
  appointment: Appointment,
  now: Date,
): boolean;

export function normalizeClientName(name: string): string;

export function calculateServiceTotal(
  price: number,
  quantity?: number,
): number;
```

Rules must be pure and deterministic. If a rule needs current time, accept `now` as an argument. Domain errors must carry stable codes; localized text belongs to `@emme/i18n`.

## TDD Tasks

### Task 1: Reconcile existing domain models and public barrels

**Files:** `packages/domain/src/{appointments,clients}/`, `packages/domain/src/index.ts`, existing colocated tests, and app domain tests used as behavior references.

- [ ] Red: add contract tests importing appointment, client, and service types/rules only from `@emme/domain`; assert no API-shaped fields such as `full_name` are required.
- [ ] Run `bun run --filter @emme/domain test`; expect failures for missing service exports or incompatible public names.
- [ ] Green: define the smallest domain models that represent the application rather than backend DTOs and export them through capability/root barrels.
- [ ] Run the focused tests and expect PASS.
- [ ] Refactor: remove duplicate domain exports and use singular model filenames with plural capability directories.
- [ ] Run `bun run --filter @emme/domain typecheck && bun run --filter @emme/domain test`.
- [ ] Commit with `refactor(domain): reconcile capability model exports`.

### Task 2: Implement appointment and client rules with injected time

**Files:** `packages/domain/src/appointments/{appointment.rules.ts,cancellation.rules.ts}`, `packages/domain/src/clients/client.rules.ts`, colocated tests.

- [ ] Red: add tests for cancellable statuses, cancellation cutoff boundaries, normalized names, invalid empty names, and deterministic behavior at exact timestamps.
- [ ] Run the affected tests and verify failures before changing implementation.
- [ ] Green: implement pure functions that accept all time and input values explicitly and return stable domain errors/codes for invalid states.
- [ ] Run `bun run --filter @emme/domain test`; expect PASS.
- [ ] Refactor: extract repeated date-range or status checks into focused helpers without introducing classes or side effects.
- [ ] Run `bun run --filter @emme/domain typecheck`.
- [ ] Commit with `feat(domain): define appointment and client rules`.

### Task 3: Add service, payment, and shared value rules from current behavior

**Files:** Create `packages/domain/src/services/*`, `packages/domain/src/payments/*`, and `packages/domain/src/shared/*` with colocated tests.

- [ ] Red: add tests for non-negative service prices, duration/availability constraints, money arithmetic with matching currency, payment status transitions, and rejected invalid transitions.
- [ ] Run focused tests and confirm the missing or incorrect behavior fails.
- [ ] Green: implement only the rules represented in the current salon app and approved architecture; do not invent payment flows or new product policy.
- [ ] Run `bun run --filter @emme/domain test`; expect PASS.
- [ ] Refactor: keep shared value objects immutable and use explicit return types.
- [ ] Run `bun run --filter @emme/domain typecheck && bun run --filter @emme/domain build`.
- [ ] Commit with `feat(domain): add service and payment invariants`.

### Task 4: Prove the domain dependency boundary

**Files:** `packages/domain/src/__tests__/capability-contracts.test.ts`, package configuration if required.

- [ ] Red: add a boundary test that scans domain source imports and rejects React, browser globals, `@emme/api`, `@emme/infrastructure`, `@emme/core`, and `@emme/validation` imports.
- [ ] Run the test and confirm it fails if any forbidden dependency is present.
- [ ] Green: remove or refactor offending imports until the boundary test passes.
- [ ] Run `bun run --filter @emme/domain test`.
- [ ] Refactor: document why date inputs are explicit and why localized messages do not live in domain.
- [ ] Run `bun run --filter @emme/domain typecheck && bun run --filter @emme/domain build`.
- [ ] Commit with `test(domain): enforce pure dependency boundary`.

## Acceptance Criteria

- [ ] Domain models are application-shaped, not DTO-shaped.
- [ ] Rules are pure, deterministic, and independently tested.
- [ ] Current appointment, client, and service behavior is preserved.
- [ ] No domain code imports framework, transport, storage, localization, or browser dependencies.

## Verification and Definition of Done

```bash
bun run --filter @emme/domain typecheck
bun run --filter @emme/domain test
bun run --filter @emme/domain build
```

- [ ] All rule edge cases pass with no skipped tests.
- [ ] The salon app no longer owns duplicate pure domain rules after its integration slice is migrated.
- [ ] All changes are committed and pushed.
