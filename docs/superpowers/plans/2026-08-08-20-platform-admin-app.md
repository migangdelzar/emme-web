# Platform Admin App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build the platform-admin shell and workflows for tenant lifecycle, feature flags, memberships, audit/operations, provisioning, and subscriptions.

**Architecture:** `apps/platform-admin-app` owns admin-only pages, routes, filters, navigation, and permission composition. Shared core/API/UI/i18n/infrastructure provide runtime and transport contracts; admin-only workflows stay local until reuse is proven.

**Tech Stack:** React 19, Vite, React Router, TanStack Query, Testing Library, Vitest, Playwright.

## Global Constraints

- Every admin operation requires explicit platform-admin permissions.
- Tenant data is isolated by backend authorization and explicit request context.
- Destructive actions require confirmation, audit metadata, and backend state transitions.
- No admin UI bypasses backend policy.

## Files

- Create: `apps/platform-admin-app/package.json`, `apps/platform-admin-app/tsconfig.json`, `apps/platform-admin-app/vite.config.ts`, `apps/platform-admin-app/index.html`, and `apps/platform-admin-app/src/main.tsx`.
- Create: `apps/platform-admin-app/src/app/App.tsx`, `apps/platform-admin-app/src/app/AppProviders.tsx`, `apps/platform-admin-app/src/app/app-config.ts`, `apps/platform-admin-app/src/app/router.tsx`, `apps/platform-admin-app/src/app/routes/`, `apps/platform-admin-app/src/app/layouts/`, and `apps/platform-admin-app/src/app/error-boundary/`.
- Create app-local modules: `apps/platform-admin-app/src/features/tenant-management/`, `apps/platform-admin-app/src/features/feature-flags/`, `apps/platform-admin-app/src/features/memberships/`, `apps/platform-admin-app/src/features/audit/`, `apps/platform-admin-app/src/features/provisioning/`, and `apps/platform-admin-app/src/features/subscriptions/`.
- Test: feature component/hooks, route boundaries, API contract fixtures, and `e2e/src/specs/admin/`.

### Task 1: Shell, admin auth, and tenant lifecycle

- [x] **Step 1:** Write tests for platform-admin auth, permission denial, tenant list/filter/detail/create/update/suspend/reactivate/delete-hold, and provisioning status.
- [x] **Step 2:** Implement shell and `tenant-management` workflows using typed API contracts and safe confirmation dialogs.
- [x] **Step 3:** Run focused component/integration tests; expected result is PASS.

### Task 2: Feature flags and memberships

- [x] **Step 1:** Write tests for global flags, tenant overrides, effective-feature resolution, membership list/assign/revoke, and stale/forbidden responses.
- [x] **Step 2:** Implement app-local pages, schemas, query hooks, and permission guards.
- [x] **Step 3:** Run mocked browser journeys for `FR-WA008`–`FR-WA013`.

### Task 3: Audit, operations, and subscriptions

- [x] **Step 1:** Write tests for audit filters/details, projection reconciliation status/rebuild confirmation, and subscription plan/status/entitlements.
- [x] **Step 2:** Implement pages and state mapping with explicit loading, empty, error, and destructive-action states.
- [x] **Step 3:** Run mocked browser journeys for `FR-WA014`–`FR-WA016`.

### Task 4: Contract and commit

- [x] **Step 1:** Add API fixtures for all `FR-WA001`–`FR-WA016` and a route-boundary test rejecting salon/client imports.
- [x] **Step 2:** Configure admin Playwright mocked and real-backend projects without credentials in source.
- [x] **Step 3:** Run typecheck, tests, build, architecture check, and mocked E2E.

```bash
git add apps/platform-admin-app e2e/src/specs/admin packages/core packages/api
git commit -m "feat(platform-admin): add tenant and platform operations app"
```

## Definition of Done

- [x] Every `FR-WA001`–`FR-WA016` maps to a route, state, contract, and test.
- [x] Destructive and permission-sensitive operations are explicit and backend-authoritative.
- [x] Admin app has no imports from other app internals.

**Status:** Complete
