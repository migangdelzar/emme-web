# Analytics Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Provide reusable dashboard, finance, and reporting read-model contracts and presentation adapters.

**Architecture:** Analytics is query-oriented and does not become a second source of business truth. Backend aggregates remain authoritative; the feature maps them to stable view models.

**Tech Stack:** TypeScript, React, `@emme/api`, `@emme/ui`, existing chart library, Vitest, Testing Library.

## Global Constraints

- Metrics are tenant-scoped and include explicit date/time-zone boundaries.
- Currency and totals use the payments money contract.
- Empty, partial, stale, forbidden, and unavailable states are explicit.

## Files

- Create: `packages/features/src/analytics/domain/`, `packages/features/src/analytics/application/`, `packages/features/src/analytics/api/`, `packages/features/src/analytics/infrastructure/`, `packages/features/src/analytics/validation/`, `packages/features/src/analytics/presentation/`, `packages/features/src/analytics/i18n/`, and `packages/features/src/analytics/test/`.
- Migrate: dashboard/finance API hooks, mappers, components, and tests from app/features.
- Test: metric mappers, query ports, API parsing, view models, charts/cards, and boundaries.

### Task 1: Metric contracts

- [ ] **Step 1:** Write tests for date ranges, tenant scope, currency aggregation, zero values, missing data, and partial metric responses.
- [ ] **Step 2:** Implement `MetricRange`, `RevenueSummary`, `AppointmentSummary`, `DashboardSnapshot`, and typed analytics errors.
- [ ] **Step 3:** Run focused tests; expected result is PASS.

### Task 2: Queries and API mapping

- [ ] **Step 1:** Write fake-query tests for dashboard snapshot, revenue, appointment status counts, and trend data.
- [ ] **Step 2:** Implement `AnalyticsRepository`, query factories, API contracts, and mappers with explicit tenant/date parameters.
- [ ] **Step 3:** Verify forbidden, empty, stale, timeout, and malformed response behavior.

### Task 3: Presentation and migration

- [ ] **Step 1:** Write tests for stat cards, charts, loading/skeleton, empty, error, responsive, and accessible table alternatives.
- [ ] **Step 2:** Implement reusable cards/view models and migrate salon dashboard/finances consumers.
- [ ] **Step 3:** Run package tests, app tests, typecheck, and build.

### Task 4: Commit

```bash
git add packages/features apps/emme-salon-app
git commit -m "feat(analytics): add tenant-scoped reporting read models"
```

## Definition of Done

- [ ] Dashboard and finance behavior uses stable query contracts.
- [ ] Tenant, currency, date-range, empty, and unavailable states are tested.
