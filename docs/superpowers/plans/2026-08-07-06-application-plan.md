# Application Layer Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Make `@emme/application` the framework-independent use-case layer for salon, client, and platform workflows, with explicit ports and injectable dependencies.
**Architecture:** Hexagonal application layer; use cases depend on `@emme/domain` and application ports, while API and infrastructure provide adapters. React hooks remain outside this package.
**Tech Stack:** TypeScript, Bun workspaces, Vitest, `@emme/domain`.

## Global Constraints

- Application code must not import React, React Query, Apollo, `fetch`, browser storage, or concrete API clients.
- Ports are TypeScript interfaces owned by the application boundary.
- Use cases receive dependencies through factory functions or parameters; they do not instantiate adapters.
- Existing behavior is preserved during migration. A behavior not represented by current code or approved reference documentation is not invented.
- Tests are colocated beside their use case. `src/__tests__/` is reserved for cross-module package contracts.

---

## 1. Current Inventory and Target Structure

Current implementation includes `appointments/cancel-appointment.ts`, `clients/create-client.ts`, appointment and client repository ports, and their colocated tests. The salon app still owns feature-specific hooks and API query modules.

Target structure:

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
│   ├── ports/
│   │   ├── appointment-repository.ts
│   │   ├── availability-service.ts
│   │   └── notification-service.ts
│   └── index.ts
├── clients/
│   ├── create-client.ts
│   ├── update-client.ts
│   ├── list-clients.ts
│   ├── ports/client-repository.ts
│   └── index.ts
├── services/
│   ├── list-services.ts
│   ├── create-service.ts
│   ├── update-service.ts
│   ├── ports/service-repository.ts
│   └── index.ts
├── staff/
│   ├── list-staff.ts
│   ├── update-staff.ts
│   ├── ports/staff-repository.ts
│   └── index.ts
├── payments/
│   ├── list-payments.ts
│   ├── create-payment.ts
│   ├── ports/payment-repository.ts
│   └── index.ts
├── platform/
│   ├── list-tenants.ts
│   ├── create-tenant.ts
│   ├── suspend-tenant.ts
│   └── index.ts
└── index.ts
```

## 2. Ordered Tasks

### Task 1: Stabilize application ports

**Files:** `packages/application/src/**/ports/*.ts`, corresponding `*.test.ts`.

Write contract tests for repository behavior using in-memory fakes. Define explicit signatures for filters, pagination, version/concurrency fields, and `null` versus exception behavior. Include `AppointmentRepository`, `AvailabilityService`, `NotificationService`, `ClientRepository`, and the ports required by currently supported service, staff, payment, and tenant operations.

Run `bunx vitest run packages/application/src` and confirm new tests fail before adding or changing port implementations. Keep interfaces dependent on domain types only.

### Task 2: Implement appointment and client use cases

**Files:** `packages/application/src/appointments/**`, `packages/application/src/clients/**`.

For each use case, add a failing unit test first, then the minimum implementation, then refactor. Cover list, create, update, cancellation/ownership checks, unavailable slots, repository failures, and notification invocation where the current behavior requires it. Reuse domain rules from `@emme/domain`; do not duplicate them in use cases.

Each test injects a fake port and verifies returned domain data plus calls and arguments. The implementation exposes functions with this shape:

```ts
export interface Dependencies {
  appointments: AppointmentRepository;
}

export function listSalonAppointments(dependencies: Dependencies) {
  return (filters: AppointmentFilters) => dependencies.appointments.list(filters);
}
```

Use a named `execute` function only when it makes the use case easier to compose; avoid class instances for simple operations.

### Task 3: Add services, staff, payments, and platform use cases

**Files:** `packages/application/src/services/**`, `staff/**`, `payments/**`, `platform/**`.

Add only operations already represented by the current API/domain surface or the approved architecture references. For every operation, write tests against a fake repository before implementation. Keep authorization decisions in `@emme/core` policies and domain invariants in `@emme/domain`; application code coordinates them and translates port failures into stable application errors.

Include pagination and tenant context in port inputs where the API requires them. Do not make tenant identity a hidden module-level value.

### Task 4: Publish package exports and integration contracts

**Files:** capability `index.ts` files, `packages/application/src/index.ts`, `packages/application/src/__tests__/application-contracts.test.ts`.

Export public use cases and port types through stable barrels. Add package-level tests that import only public exports and verify that no React, API adapter, or infrastructure implementation is reachable from the package entry point. Keep internal helpers unexported.

### Task 5: Route salon operations through application use cases

**Files:** `apps/emme-salon-app/src/features/**/hooks/*`, feature adapters under `apps/emme-salon-app/src/features/**`, and affected tests.

Update React hooks to call application use cases through injectable adapters. Hooks may own React Query state, query invalidation, form state, and UI notifications; they must not contain domain rules or direct HTTP calls. Preserve existing query keys and mutation behavior while the API/infrastructure plans are executed.

Run focused feature tests after each vertical slice, then the package and app suites.

## 3. Verification

- `bunx vitest run packages/application/src`
- `bunx tsc -p packages/application/tsconfig.json --noEmit`
- `bunx vitest run apps/emme-salon-app/src/features`
- `bun run typecheck`
- `bun run lint`
- `rg -n "from" packages/application/src | rg "react|@tanstack|@emme/api|@emme/infrastructure"` returns no forbidden imports.

## 4. Definition of Done

- [ ] Every exported use case has colocated unit tests written before implementation.
- [ ] Ports are explicit, injectable, and domain-oriented.
- [ ] Package exports expose only public use cases and ports.
- [ ] Salon hooks consume application operations without owning business rules or HTTP calls.
- [ ] Full verification passes with zero skipped tests and no forbidden imports.
