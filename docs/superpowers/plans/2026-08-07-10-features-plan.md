# Shared Features Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Establish `@emme/features` as an optional promotion layer for genuinely shared React business adapters, while keeping app-specific pages and workflows in each application.
**Architecture:** Feature modules consume `@emme/ui`, `@emme/core`, `@emme/application`, `@emme/domain`, `@emme/i18n`, and `@emme/validation`; they never import another app or reach directly into infrastructure internals.
**Tech Stack:** TypeScript, React, Bun workspaces, Vitest, Testing Library.

## Global Constraints

- A feature enters this package only when the same behavior is required by at least two apps.
- `@emme/features` is not a dumping ground for salon-only screens.
- Domain rules remain in `@emme/domain`; use cases remain in `@emme/application`; generic visuals remain in `@emme/ui`.
- Feature hooks may use React Query through the application runtime adapter, but they do not make direct HTTP calls.
- Tests are colocated with components/hooks. `src/__tests__/` covers package-level public composition.

---

## 1. Target Structure

```text
packages/features/src/
├── appointments/
│   ├── shared/{AppointmentCard.tsx,AppointmentStatusBadge.tsx,AppointmentDate.tsx}
│   ├── client/{BookingWizard.tsx,ServiceSelector.tsx,TimeSlotPicker.tsx,useAvailableSlots.ts,useCreateBooking.ts}
│   ├── salon/{AppointmentCalendar.tsx,AppointmentTable.tsx,useSalonAppointments.ts,useManageAppointment.ts}
│   └── index.ts
├── clients/
│   ├── shared/ClientAvatar.tsx
│   ├── salon/{ClientList.tsx,ClientForm.tsx,useClients.ts,useCreateClient.ts}
│   └── index.ts
├── services/
│   ├── shared/{ServiceCard.tsx,ServicePrice.tsx}
│   ├── salon/{ServiceList.tsx,ServiceForm.tsx,useManageServices.ts}
│   ├── client/{ServiceCatalog.tsx,useServices.ts}
│   └── index.ts
├── payments/{salon/,client/,index.ts}
├── notifications/{components/,hooks/,index.ts}
└── index.ts
```

The first implementation task is package boundary setup and promotion evidence. It does not copy salon-only feature files into the package merely to populate directories.

## 2. Ordered Tasks

### Task 1: Establish package boundary and promotion contract

**Files:** `packages/features/package.json`, `tsconfig.json`, `src/index.ts`, `src/__tests__/public-exports.test.ts`.

Write a failing package-boundary test that imports the public entry point and verifies it does not expose app paths, infrastructure singletons, or private feature internals. Add package scripts and exports consistent with the other libraries. Document the two-consumer promotion rule in the package README and index comments.

### Task 2: Evaluate current feature duplication

**Files:** `apps/emme-salon-app/src/features/**`, future app manifests, package-level migration notes.

Use import/reference evidence to identify UI behavior that is needed by both the salon and client experiences. Record the source files, public dependencies, and tests for each candidate. A candidate is promoted only when a second app consumer is part of the same migration change; otherwise the feature remains in its app.

### Task 3: Promote the first qualifying shared adapter

**Files:** one capability under `packages/features/src/<capability>/**`, original app consumer, colocated tests in both package/app locations.

Write the package component or hook test first. Move the smallest reusable behavior, update both consumers to use the public capability barrel, and remove the duplicate only after both test suites pass. The promoted module may compose `@emme/ui` components and application use cases, but it may not import app routes, app providers, or app-specific styles.

### Task 4: Add public contract and dependency scans

**Files:** `packages/features/src/__tests__/public-exports.test.ts`, package scripts.

Test public exports and run source scans for imports from `apps/`, concrete infrastructure modules, and private capability paths. Keep the package empty of unqualified feature copies when no qualifying shared adapter exists.

## 3. Verification

- `bunx vitest run packages/features/src`
- `bunx tsc -p packages/features/tsconfig.json --noEmit`
- `bun run typecheck`
- `bun run lint`
- `rg -n "apps/|@emme/infrastructure/src|/src/.+/(components|hooks)/" packages/features/src` returns no forbidden imports.

## 4. Definition of Done

- [ ] Package boundary and exports are tested.
- [ ] Promotion decisions are based on two real app consumers.
- [ ] Any promoted module has package and consumer tests.
- [ ] Salon-only workflows remain app-owned.
- [ ] No duplicate shared implementation remains after a promotion.

