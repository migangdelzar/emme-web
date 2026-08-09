# Tenant Configuration and Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Provide reusable tenant business-profile, hours, booking-policy, preference, and onboarding contracts while keeping role-specific workflows in apps.

**Architecture:** Tenant context belongs to core; tenant business configuration and onboarding behavior belong to this vertical feature. API and infrastructure adapters are tenant-scoped.

**Tech Stack:** TypeScript, Zod, React, `@emme/api`, `@emme/core`, `@emme/ui`, Vitest.

## Global Constraints

- Tenant identity comes from the authenticated runtime context, never a form field alone.
- Configuration changes are validated locally and authoritatively server-side.
- Onboarding progress is resumable and safe to repeat.

## Files

- Create: `packages/features/src/tenant-configuration/domain/`, `packages/features/src/tenant-configuration/application/`, `packages/features/src/tenant-configuration/api/`, `packages/features/src/tenant-configuration/infrastructure/`, `packages/features/src/tenant-configuration/validation/`, `packages/features/src/tenant-configuration/presentation/`, `packages/features/src/tenant-configuration/i18n/`, `packages/features/src/tenant-configuration/test/`, `packages/features/src/onboarding/application/`, `packages/features/src/onboarding/api/`, `packages/features/src/onboarding/infrastructure/`, `packages/features/src/onboarding/presentation/`, and `packages/features/src/onboarding/test/`.
- Migrate: existing business config API, settings, onboarding, and profile components.
- Test: rules, use cases, schemas, mappers, adapters, settings components, and boundaries.

### Task 1: Configuration domain

- [x] **Step 1:** Write tests for business profile fields, hours ranges, active days, cancellation notice, advance-booking limits, and preference defaults.
- [x] **Step 2:** Implement configuration value objects, `TenantConfiguration`, and typed validation errors.
- [x] **Step 3:** Run focused domain tests; expected result is PASS.

### Task 2: Configuration and onboarding operations

- [x] **Step 1:** Write fake-repository tests for load/update profile, hours, policy, preferences, onboarding status, step completion, and resume.
- [x] **Step 2:** Implement ports and use cases with explicit tenant context and idempotent step completion.
- [x] **Step 3:** Verify invalid ranges, permission denied, stale version, offline retry, and repeated completion.

### Task 3: API, validation, and presentation

- [x] **Step 1:** Write contract tests for existing profile/hours/policy payloads and error mapping.
- [x] **Step 2:** Implement schemas, adapters, settings view models, and reusable onboarding step/status components.
- [x] **Step 3:** Migrate salon settings/onboarding screens and run package/app tests.

### Task 4: Commit

```bash
git add packages/features packages/api apps/emme-salon-app
git commit -m "feat(configuration): add tenant configuration and onboarding modules"
```

## Definition of Done

- [x] Tenant configuration is explicit, validated, resumable, and tested.
- [x] App workflows remain local while reusable contracts are public.

**Status:** Complete
