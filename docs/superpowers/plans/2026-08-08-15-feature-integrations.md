# Integrations Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Isolate Google Calendar, Google Sheets, OAuth, and external workspace behavior behind feature-owned ports and adapters.

**Architecture:** API contracts describe capabilities; feature application ports express user outcomes; infrastructure/provider adapters implement external details. OAuth tokens remain in infrastructure storage.

**Tech Stack:** TypeScript, `@emme/api`, `@emme/infrastructure`, React, Vitest, mocked provider tests.

## Global Constraints

- OAuth tokens and secrets never enter feature presentation or logs.
- Sync is idempotent and reports partial failures explicitly.
- External provider behavior is never called in unit tests.

## Files

- Create: `packages/features/src/integrations/domain/`, `packages/features/src/integrations/application/`, `packages/features/src/integrations/api/`, `packages/features/src/integrations/infrastructure/`, `packages/features/src/integrations/validation/`, `packages/features/src/integrations/presentation/`, `packages/features/src/integrations/i18n/`, and `packages/features/src/integrations/test/`.
- Migrate: `packages/api/src/integrations/**`, existing Google Workspace feature code, and global adapter wiring.
- Test: capability contracts, token/error mapping, sync commands, UI states, and boundary tests.

### Task 1: Integration contracts and domain

- [ ] **Step 1:** Write tests for connection state, provider account identity, sync status, idempotency key, and safe disconnect.
- [ ] **Step 2:** Implement provider-neutral `CalendarConnection`, `SheetExport`, sync result types, and typed errors.
- [ ] **Step 3:** Run focused tests; expected result is PASS.

### Task 2: Application ports and API

- [ ] **Step 1:** Write fake-port tests for connect, disconnect, list calendars/sheets, sync appointment, export data, and retry status.
- [ ] **Step 2:** Implement ports and API capability contracts using existing backend routes as the source of truth.
- [ ] **Step 3:** Verify expired token, revoked grant, conflict, timeout, and partial export behavior.

### Task 3: Adapters and presentation

- [ ] **Step 1:** Write tests for adapter request mapping and redacted error diagnostics.
- [ ] **Step 2:** Implement concrete adapters in feature infrastructure using injected provider clients and global token storage.
- [ ] **Step 3:** Implement reusable connection/status/export components and migrate salon screens.
- [ ] **Step 4:** Run integration tests with provider fakes and mocked E2E for the Google workflow.

### Task 4: Commit

```bash
git add packages/features packages/api packages/infrastructure apps/emme-salon-app
git commit -m "feat(integrations): isolate external workspace capabilities"
```

## Definition of Done

- [ ] Calendar, Sheets, OAuth, and provider failures are typed and tested.
- [ ] No token or provider SDK leaks into domain/application/presentation code.
