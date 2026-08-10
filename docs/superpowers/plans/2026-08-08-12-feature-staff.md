# Staff Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add reusable staff profiles, scheduling ownership, availability contracts, and permission-aware staff presentation.

**Architecture:** Staff is a vertical module. Salon owns staff-management screens; appointments consumes staff ports for artist/resource selection; admin may consume membership contracts without importing salon pages.

**Tech Stack:** TypeScript, React, `@emme/api`, `@emme/core`, `@emme/ui`, Vitest.

## Global Constraints

- Staff identity and membership are distinct concepts.
- Permission checks are explicit inputs and do not replace backend authorization.
- Availability is represented by a protocol so appointments can consume it without concrete adapters.

## Files

- Create: `packages/features/src/staff/domain/`, `packages/features/src/staff/application/`, `packages/features/src/staff/api/`, `packages/features/src/staff/infrastructure/`, `packages/features/src/staff/validation/`, `packages/features/src/staff/presentation/`, `packages/features/src/staff/i18n/`, and `packages/features/src/staff/test/`.
- Create app workflow paths: `apps/emme-salon-app/src/features/staff/`.
- Test: staff rules, repository/availability ports, API mapping, components, and boundaries.

### Task 1: Staff domain

- [x] **Step 1:** Write tests for active/inactive staff, role assignment, schedule ownership, and invalid availability ranges.
- [x] **Step 2:** Implement `StaffMember`, role/value types, availability value objects, and typed errors.
- [x] **Step 3:** Run focused domain tests; expected result is PASS.

### Task 2: Staff operations and ports

- [x] **Step 1:** Write tests for list, get, create/update, activate/deactivate, and availability operations using fakes.
- [x] **Step 2:** Implement `StaffRepository`, `StaffAvailabilityRepository`, and use-case factories with DI.
- [x] **Step 3:** Verify permission denied, missing staff, overlap, and backend failure behavior.

### Task 3: API and presentation

- [x] **Step 1:** Write mapper tests for staff identity, roles, schedule, and tenant fields.
- [x] **Step 2:** Implement contracts, adapters, `StaffAvatar`, `StaffSummary`, and app-local management form contracts.
- [x] **Step 3:** Run all package tests and boundary checks.

### Task 4: Commit

```bash
git add packages/features apps/emme-salon-app
git commit -m "feat(staff): add reusable staff and availability module"
```

## Definition of Done

- [x] Appointment availability can depend on staff protocols.
- [x] Salon staff workflows are app-local and package exports are public-only.

**Status:** Complete
