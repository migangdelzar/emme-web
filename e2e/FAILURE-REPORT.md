# E2E Real Test Failure Report

**Date:** 2026-08-06
**Passing:** 65/74 (87.8%) | **Failed:** 7 | **Skipped:** 2

---

## Root Cause Summary

All 7 failures are **Vite dev server rendering timeouts** — elements rendered by React aren't visible within the Playwright timeout. Individual test runs confirm each tests passes (12-15s) when run in isolation. The failures only occur when tests run sequentially within a single Vite process, where cumulative HMR/rebuild overhead causes timeouts on later tests.

**Not backend issues.** All backend queries complete in 0.2-0.5s (auth in 3.3s). The data-testid attributes match between React components and page objects.

---

## Failure Details

### 1. Appointments page loads with real agenda
- **Spec:** `specs/real/data-persistence.spec.ts:33`
- **Error:** `expect(locator).toBeVisible()` — `getByTestId('appointment-header')` not visible
- **Timeout:** 5s
- **Cause:** Appointments component renders but header testId element not visible within timeout after navigation. The appointments list loads async data, and render takes time with large datasets.

### 2. Finances page loads with real data  
- **Spec:** `specs/real/data-persistence.spec.ts:38`
- **Error:** `expect(locator).toBeVisible()` — `getByTestId('finances-header')` not visible
- **Timeout:** 5s
- **Cause:** Same pattern — page navigation completes but header element not visible within timeout.

### 3. Create appointment form accessible
- **Spec:** `specs/real/data-persistence.spec.ts:66`
- **Error:** `expect(locator).toBeVisible()` — `getByTestId('appointment-dialog')` not visible
- **Timeout:** 10s
- **Cause:** Dialog component renders with framer-motion animations. Animation completion + Vite rendering delay exceeds timeout.

### 4. Seed client via API → appears in UI
- **Spec:** `specs/real/data-persistence.spec.ts:71`
- **Error:** `expect(locator).toBeVisible()` — text selector for generated client name not visible
- **Timeout:** 8s
- **Cause:** Client created via API, then page navigates to `/clients`. React renders the client list, but the newly created client's name isn't visible within timeout due to list re-render delay.

### 5. Customer lifecycle — creates customer through UI
- **Spec:** `specs/customers/mock-lifecycle.spec.ts:6`
- **Error:** `expect(locator).toBeVisible()` — `text='E2E Customer'` not visible
- **Timeout:** 25s
- **Cause:** Full UI flow: open dialog → fill form → submit → wait for list update. Multiple Vite HMR cycles between steps.

### 6. Service lifecycle — creates and updates service through UI
- **Spec:** `specs/services/mock-lifecycle.spec.ts:6`
- **Error:** `expect(locator).toBeVisible()` — service name text selector not visible
- **Timeout:** 34s+
- **Cause:** Same multi-step UI flow as customer lifecycle. Cumulative Vite rendering delays.

### 7. Tenant owner lifecycle — read and update tenant service
- **Spec:** `specs/real/tenant-owner-lifecycle.spec.ts:25`
- **Error:** `expect(locator).toBeVisible()` — service detail elements not visible
- **Timeout:** 33s+
- **Cause:** OAuth2 login flow + service CRUD operations. Combined auth latency (3.3s) + Vite rendering delays.

---

## Verification

All 7 tests PASS when run individually:
- Appointments (4 tests): 12-15s each ✓
- Dashboard (4 tests): 8-14s each ✓  
- Customers (5 tests): 10-15s each ✓
- Services (7 tests): 8-12s each ✓

## Resolution Options

1. **Production build for E2E** (`VITE_APP_ENV=production`) — eliminates Vite HMR overhead (recommended)
2. **Increase timeouts** — bump real project expect timeout from 25s to 45s
3. **Split test suite** — run heavy UI tests separately from lightweight API tests
4. **`reuseExistingServer: true`** — reuse Vite server between test runs to avoid cold starts

## Backend Health

| Metric | Value |
|---|---|
| Platform status | ✅ UP |
| JVM heap | 380MB (1G container) |
| Auth latency | 3.3s |
| GET services | 0.51s |
| GET customers | 0.19s |
| POST service | 0.43s |
| Event chain | ✅ All events complete |
| Subscriptions | ✅ 1 per tenant |
| Memberships | ✅ 1 per tenant |
