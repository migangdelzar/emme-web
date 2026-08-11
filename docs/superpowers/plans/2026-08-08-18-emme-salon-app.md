# Emme Salon App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Reduce `apps/emme-salon-app` to a tenant-owner/staff composition shell that consumes public vertical feature APIs while preserving existing studio behavior.

**Architecture:** The app owns providers, route composition, layouts, branding, navigation, and role-specific workflows. Business rules, repositories, generic components, and reusable hooks come from packages.

**Tech Stack:** React 19, Vite, Bun, React Router, TanStack Query, Playwright, existing Capacitor/PWA setup.

## Global Constraints

- Preserve `apps/emme-salon-app` and current URLs/route behavior.
- No `@/` imports from package source and no imports from private feature paths.
- Concrete HTTP, auth, storage, and feature adapters are wired in `AppProviders.tsx`.
- Existing mocked and real E2E modes remain deterministic and same-origin.

## Files

- Modify: `apps/emme-salon-app/src/app/App.tsx`, `AppProviders.tsx`, `router.tsx`, `main.tsx`, layouts, navigation, error boundary, config, theme, and package manifest.
- Create/relocate: `apps/emme-salon-app/src/features/appointments/`, `apps/emme-salon-app/src/features/catalog/`, `apps/emme-salon-app/src/features/customers/`, `apps/emme-salon-app/src/features/staff/`, `apps/emme-salon-app/src/features/settings/`, `apps/emme-salon-app/src/features/onboarding/`, `apps/emme-salon-app/src/features/analytics/`, and `apps/emme-salon-app/src/features/integrations/` for app-only workflows.
- Remove after consumer migration: duplicated app feature implementation files and app aliases.
- Test: app providers, route composition, workflow components, boundary scans, and existing E2E page objects/specs.

### Task 1: Composition root

**Test:** `apps/emme-salon-app/src/app/composition-boundary.test.ts`

```ts
it('constructs runtime dependencies only in the composition root', () => {
  const source = readFileSync('src/app/AppProviders.tsx', 'utf8');
  expect(source).toContain('createHttpClient');
  expect(source).not.toContain("fetch('/api/");
});
```

- [x] **Step 1:** Write failing source and provider tests for API, auth, tenant, query, i18n, and error providers.
- [x] **Step 2:** Wire `@emme/infrastructure` implementations into `AppProviders.tsx` and expose them through core contexts.
- [x] **Step 3:** Run focused app tests; expected result is PASS.

### Task 2: Route and navigation composition

- [x] **Step 1:** Write tests for authenticated, tenant-selected, permission-denied, lazy-loaded, and not-found routes.
- [x] **Step 2:** Update `router.tsx`, navigation, and layouts to import features from public barrels and retain current paths (`/agenda`, `/clients`, `/services`, settings, finances, and dashboard paths).
- [x] **Step 3:** Run route tests and `bun run --filter @emme/emme-salon-app typecheck`.

### Task 3: Studio workflows

- [x] **Step 1:** Write component/integration tests for dashboard, service lifecycle, client lifecycle, appointment management, settings, onboarding, finances, and Google Workspace flows.
- [x] **Step 2:** Implement app-local pages/forms/filters using feature application APIs and `@emme/ui`; do not move role-specific workflows into shared packages.
- [x] **Step 3:** Run existing unit tests and mocked Playwright journeys for every documented studio use case.

### Task 4: Remove legacy ownership

- [x] **Step 1:** Write a source-boundary test rejecting duplicate business implementations and app-private imports in package consumers.
- [x] **Step 2:** Delete only duplicate files whose consumers have migrated and update package exports/manifests.
- [x] **Step 3:** Run `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`, and `bun run test:e2e:mock`.

### Task 5: Commit

```bash
git add apps/emme-salon-app packages/features packages/core packages/infrastructure packages/i18n packages/ui
git commit -m "refactor(salon-app): reduce studio to composition and workflows"
```

## Definition of Done

- [x] Studio requirements and existing use cases remain covered.
- [x] The app contains composition and role-specific workflows only.
- [x] All package imports use public exports and all current E2E modes pass.

**Status:** Complete
