# `@emme/application` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Move reusable business orchestration into framework-independent use cases with injectable repository and service ports.

**Architecture:** Use cases coordinate domain rules and outbound ports. They do not import React, TanStack Query, API DTOs, fetch, Axios, storage, or browser APIs. Concrete adapters are wired by infrastructure or an app composition root.

**Tech Stack:** TypeScript 5.8+, `@emme/domain`, Vitest 4, Bun.

## Current State

`packages/application` already contains appointment cancellation and client creation use cases with tests. The salon app still performs query/mutation orchestration inside feature hooks and API modules. The migration must preserve current cache behavior while moving business decisions into use cases.

## Target Tree

```text
packages/application/src/
├── appointments/
│   ├── salon/
│   │   ├── list-salon-appointments.ts
│   │   ├── update-appointment.ts
│   │   └── cancel-appointment.ts
│   ├── client/
│   │   ├── find-available-slots.ts
│   │   ├── create-booking.ts
│   │   └── cancel-own-appointment.ts
│   └── ports/
│       ├── appointment-repository.ts
│       ├── availability-service.ts
│       └── notification-service.ts
├── clients/
│   ├── create-client.ts
│   ├── update-client.ts
│   └── ports/client-repository.ts
├── services/
│   ├── manage-service.ts
│   └── ports/service-repository.ts
├── payments/
│   ├── create-payment.ts
│   └── ports/payment-repository.ts
├── platform/
│   ├── create-tenant.ts
│   ├── suspend-tenant.ts
│   └── list-tenants.ts
├── __tests__/
│   └── port-contracts.test.ts
└── index.ts
```

Only use cases required by current salon behavior are implemented in the first migration. Platform-admin and client-app use cases are port-ready but are not invented until those apps have approved product behavior.

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/application/src/appointments/cancel-appointment.ts` | Keep and align with the appointment repository port and domain cancellation rule. |
| `packages/application/src/clients/create-client.ts` | Keep and align with client normalization and repository port. |
| `apps/emme-salon-app/src/features/*/hooks/use*Data.ts` | Move orchestration decisions into application functions; hooks remain React Query adapters. |
| `apps/emme-salon-app/src/features/*/api/*.queries.ts` | Keep query keys/cache policy in app/features; invoke application use cases as query/mutation functions. |
| `packages/infrastructure/src/api/*-repository.adapter.ts` | Implement application ports, not application logic. |

## Public API and Protocols

```ts
export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  list(filters?: AppointmentFilters): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
}

export interface AppointmentFilters {
  date?: string;
  status?: AppointmentStatus;
}

export interface ClientRepository {
  create(input: CreateClientInput): Promise<Client>;
  update(id: string, input: UpdateClientInput): Promise<Client>;
}

export interface AvailabilityService {
  findSlot(slotId: string): Promise<{ id: string; isAvailable: boolean }>;
}

export interface CreateBookingInput {
  clientId: string;
  serviceId: string;
  slotId: string;
  notes?: string;
}

export function createBooking(dependencies: {
  availability: AvailabilityService;
  appointments: AppointmentRepository;
}) : (input: CreateBookingInput) => Promise<Appointment>;
```

Factories receive ports as arguments. They do not instantiate repositories, query clients, or HTTP clients internally. Use cases return domain models or typed application errors; UI messages are translated by i18n adapters.

## TDD Tasks

### Task 1: Normalize port interfaces and existing use cases

**Files:** `packages/application/src/appointments/ports/*`, `clients/ports/*`, existing use cases/tests, and `src/index.ts`.

- [ ] Red: add tests using in-memory fake repositories that assert `cancelAppointment` rejects missing appointments, rejects non-cancellable appointments, and removes only after the domain rule passes.
- [ ] Run `bun run --filter @emme/application test`; confirm failures for incomplete contracts.
- [ ] Green: define ports with domain types and inject them into existing use-case factories.
- [ ] Run focused tests and expect PASS.
- [ ] Refactor: remove imports of API or infrastructure modules and expose only protocol/use-case symbols through the package barrel.
- [ ] Run `bun run --filter @emme/application typecheck && bun run --filter @emme/application test`.
- [ ] Commit with `refactor(application): formalize repository ports`.

### Task 2: Implement salon client and appointment use cases

**Files:** Create `clients/update-client.ts`, `appointments/salon/list-salon-appointments.ts`, `appointments/salon/update-appointment.ts`, tests beside each file.

- [ ] Red: add tests for normalized client input, optimistic-concurrency/version forwarding, list filters, and update rejection when the repository returns a conflict.
- [ ] Run each focused test and confirm it fails before implementation.
- [ ] Green: implement use cases with injected ports and domain rules; return repository results without React or query-cache concerns.
- [ ] Run `bun run --filter @emme/application test`; expect PASS.
- [ ] Refactor: keep each use case focused and split dependencies when a function requires more than its repository and relevant policy service.
- [ ] Run `bun run --filter @emme/application typecheck && bun run --filter @emme/application build`.
- [ ] Commit with `feat(application): add salon client and appointment use cases`.

### Task 3: Add booking/availability ports only where the product flow exists

**Files:** `packages/application/src/appointments/client/*`, `appointments/ports/availability-service.ts`, tests beside each use case.

- [ ] Red: add tests for unavailable slots, valid booking creation, and cancellation of an appointment owned by the current client.
- [ ] Run focused tests and confirm the expected failures.
- [ ] Green: implement the minimal use cases and ports needed by the approved client-app contract; do not add UI or route behavior.
- [ ] Run `bun run --filter @emme/application test`.
- [ ] Refactor: keep client-specific authorization inputs explicit in the use-case signature and preserve backend-authoritative authorization.
- [ ] Run `bun run --filter @emme/application typecheck && bun run --filter @emme/application build`.
- [ ] Commit with `feat(application): add booking application ports`.

### Task 4: Enforce framework-free application boundaries

**Files:** `packages/application/src/__tests__/port-contracts.test.ts`, package barrel and imports.

- [ ] Red: add a source-boundary test rejecting React, TanStack Query, API DTO, infrastructure, storage, and browser imports.
- [ ] Run the package tests and confirm the boundary test fails for any violation.
- [ ] Green: move cache behavior back to feature hooks and remove forbidden imports.
- [ ] Run `bun run --filter @emme/application test`.
- [ ] Refactor: document factory signatures and error contracts in the public barrel.
- [ ] Run `bun run --filter @emme/application typecheck && bun run --filter @emme/application build`.
- [ ] Commit with `test(application): enforce framework-free use cases`.

## Acceptance Criteria

- [ ] Use cases are callable without React, HTTP, or browser runtime.
- [ ] Every external dependency is represented by an injectable protocol.
- [ ] Domain rules are reused instead of duplicated in hooks/components.
- [ ] Existing appointment cancellation and client creation behavior remains green.

## Verification and Definition of Done

```bash
bun run --filter @emme/application typecheck
bun run --filter @emme/application test
bun run --filter @emme/application build
```

- [ ] Fake repository tests cover success, missing entity, invalid state, and conflict paths.
- [ ] No application module instantiates infrastructure classes.
- [ ] All changes are committed and pushed.
