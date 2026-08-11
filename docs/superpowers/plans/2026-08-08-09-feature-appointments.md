# Appointments Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Move appointment rules, use cases, contracts, adapters, reusable presentation, and tests into a vertical `appointments` module.

**Architecture:** `domain` owns statuses, time ranges, cancellation/rescheduling/booking policies; `application` owns commands, queries, and ports; API/infrastructure map backend data; apps own calendar and booking workflows.

**Tech Stack:** TypeScript, `@emme/kernel`, `@emme/api`, `@emme/ui`, React, Vitest, Testing Library.

## Global Constraints

- Domain and application code is React-free.
- Repository, availability, notification, and clock dependencies are protocols.
- Existing statuses remain `pending`, `confirmed`, `completed`, and `cancelled` unless a backend contract proves another value.
- Tenant and permission context are explicit.

## Files

- Create: `packages/features/src/appointments/domain/`, `packages/features/src/appointments/application/`, `packages/features/src/appointments/api/`, `packages/features/src/appointments/infrastructure/`, `packages/features/src/appointments/validation/`, `packages/features/src/appointments/presentation/`, `packages/features/src/appointments/i18n/`, and `packages/features/src/appointments/test/` using the approved feature tree.
- Migrate: `packages/domain/src/appointments/**`, `packages/application/src/appointments/**`, `packages/api/src/appointments/**`, `packages/infrastructure/src/api/appointment-repository.adapter.ts`, and current salon appointment components/hooks.
- Test: domain rules, application ports, API mappers, repository adapter, components, and `packages/features/src/appointments/__tests__/boundary.test.ts`.

### Task 1: Domain model and rules

**Test:** `packages/features/src/appointments/domain/appointment-rules.test.ts`

```ts
it('allows cancellation only for pending or confirmed appointments', () => {
  expect(canCancelAppointment({ ...appointment, status: 'pending' })).toBe(true);
  expect(canCancelAppointment({ ...appointment, status: 'completed' })).toBe(false);
});
```

- [x] **Step 1:** Write tests for status transitions, time-range validity, cancellation, rescheduling, booking conflicts, and tenant identity.
- [x] **Step 2:** Move the existing appointment type/status/rule behavior into `domain/` and add typed errors for conflict and invalid state.
- [x] **Step 3:** Run focused domain tests; expected result is PASS.

### Task 2: Application commands, queries, and ports

- [x] **Step 1:** Write failing tests for `bookAppointment`, `cancelAppointment`, `rescheduleAppointment`, `listAppointments`, `getAppointment`, and `findAvailableSlots` using fake repositories.
- [x] **Step 2:** Implement `AppointmentRepository`, `AvailabilityRepository`, `NotificationPort`, and command/query factories with injected dependencies.
- [x] **Step 3:** Run application tests and verify missing appointment, conflict, invalid transition, permission, and adapter failure cases.

### Task 3: API, adapter, and validation

- [x] **Step 1:** Write mapper tests for API `customerId`/`clientId`, ISO timestamps, backend status values, and malformed payloads.
- [x] **Step 2:** Implement feature API queries/mutations, mappers, input schemas, and `GraphQLAppointmentRepository`/HTTP adapter against application ports.
- [x] **Step 3:** Run API and adapter tests with fake HTTP; expected result is PASS.

### Task 4: Reusable presentation

- [x] **Step 1:** Write component tests for `AppointmentStatusBadge`, `AppointmentSummaryCard`, and `AppointmentDateTime` across status, loading, missing data, and accessible-label states.
- [x] **Step 2:** Implement components using `@emme/ui`, feature translation namespaces, and view-model mappers.
- [x] **Step 3:** Export public feature APIs and run `bun run --filter @emme/features test`.

### Task 5: Boundary and commit

- [x] **Step 1:** Add a boundary test rejecting React imports from `domain/` and imports from private paths.
- [x] **Step 2:** Preserve global API transport contracts while exposing appointment business APIs from the feature barrel.
- [x] **Step 3:** Run typecheck, test, build, and `bun run architecture:check`.

```bash
git add packages/features packages/domain packages/application packages/api packages/infrastructure
git commit -m "feat(appointments): move scheduling into vertical feature module"
```

## Definition of Done

- [x] Salon and future client workflows can consume `@emme/features/appointments` public exports.
- [x] All domain/application/API/adapter/presentation tests pass.
- [x] New appointment business code is contained in the vertical feature module; existing global adapters remain compatible during migration.

**Status:** Complete
