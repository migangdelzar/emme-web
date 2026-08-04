# Tenant-owner E2E and real-stack recordings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build independent mock and real Playwright coverage for Emme tenant-owner journeys, with real full-stack videos archived only by GitHub Actions.

**Architecture:** Shared Playwright fixtures and page objects expose one test API. `MockProvider` supplies fast in-memory UI contracts; `RealProvider` performs authenticated setup and cleanup against `emme-service`. A real-only recording workflow checks out explicit web/service refs, runs the same-origin stack, and uploads bounded evidence artifacts.

**Tech Stack:** Bun 1.3.14, TypeScript, React/Vite, Playwright 1.60, TanStack Query, Zustand, Spring Boot `emme-service`, Docker Compose, GitHub Actions.

## Global Constraints

- Keep mock and real E2E commands independently runnable.
- Only real full-stack journeys may be archived by GitHub Actions.
- Do not commit or upload credentials, tokens, cookies, HAR files, response bodies, or customer data.
- Use synthetic tenant-owner data with deterministic run markers and cleanup.
- Use condition-based waits; no fixed `waitForTimeout` in new journeys.
- Preserve header-based API versioning and same-origin `/api` traffic.
- Keep external Google, payment, notification, and AI provider flows out of this first recording scope.
- Keep the JVM service path as the real recording baseline; native comparison is a later job.

## File map

| File | Responsibility |
|---|---|
| `e2e/src/providers/RealProvider.ts` | Authenticated real setup, CRUD seed, cleanup, request diagnostics |
| `e2e/src/providers/ApiProvider.ts` | Shared provider and seed contracts |
| `e2e/src/fixtures/testWithUser.ts` | Real/mock tenant-owner fixtures and safe environment validation |
| `e2e/src/shared/factories/e2eDataFactory.ts` | Unique tenant-scoped test records |
| `e2e/src/shared/waits.ts` | Bounded UI/response wait helpers |
| `e2e/src/pages/*.ts` | Stable page-object actions and accessible locators |
| `e2e/src/specs/real/tenant-owner-lifecycle.spec.ts` | Real CRUD and appointment journeys |
| `e2e/src/specs/demo/real-demo-recordings.spec.ts` | Short, serial, real-only video journeys |
| `e2e/src/specs/real/authorization-and-errors.spec.ts` | Tenant isolation, permission, validation, and recovery assertions |
| `e2e/src/specs/real/accessibility-and-shell.spec.ts` | Real responsive, focus, landmarks, and console checks |
| `e2e/src/playwright.config.ts` | Real recording output and project configuration |
| `e2e/src/package.json` | Separate mock, real, and real-recording commands |
| `.github/workflows/real-e2e-recordings.yml` | Full-stack real recording workflow and artifact upload |
| `e2e/README.md` | Local commands, environment contract, and cleanup rules |
| `docs/architecture/03-integration/end-to-end.md` | Real/mock lane and evidence policy |
| `docs/architecture/02-frontend/testing.md` | Tenant-owner journey and recording quality gates |
| `tasks/todo.md` | Auditable progress and verification evidence |

## Task 1: Lock the real recording contract

**Files:**

- Modify: `e2e/src/package.json`
- Modify: `e2e/src/playwright.config.ts`
- Modify: `e2e/src/fixtures/testWithUser.ts`
- Test: `e2e/src/specs/real/recording-contract.spec.ts`

**Interfaces:**

- Produces `test:real:recordings`, which invokes `--project=real --grep @demo --retries=0` with `E2E_MODE=real` and `RECORD_DEMO=true`.
- Produces a real fixture failure when `E2E_MODE=real` lacks a configured base URL or owner credentials.

- [ ] Write a failing contract test that asserts the recording tag and real-only skip behavior are present in the real recording spec.
- [ ] Run `bunx playwright test e2e/src/specs/real/recording-contract.spec.ts --project=mock`; confirm it fails because the command/fixture contract is absent.
- [ ] Add the `test:real:recordings` script and configure `recordDemo` output under `test-results/real-recordings`.
- [ ] Make real authentication settings explicit through `E2E_KEYCLOAK_USERNAME`, `E2E_KEYCLOAK_PASSWORD`, `E2E_BASE_URL`, and `E2E_API_URL`, with no token logging.
- [ ] Run the focused contract test and `bun run --filter @emme/e2e build`; confirm both pass.
- [ ] Commit as `test(e2e): define real recording contract`.

## Task 2: Make real setup and cleanup deterministic

**Files:**

- Modify: `e2e/src/providers/ApiProvider.ts`
- Modify: `e2e/src/providers/RealProvider.ts`
- Create: `e2e/src/shared/factories/e2eDataFactory.ts`
- Create: `e2e/src/shared/waits.ts`
- Modify: `e2e/src/fixtures/testWithUser.ts`
- Test: `e2e/src/providers/realProvider.contract.test.ts`

**Interfaces:**

```ts
export interface E2eDataFactory {
  customer(runId: string): CreateClient;
  service(runId: string): CreateService;
  appointment(runId: string, customerId: string, serviceId: string): CreateAppointment;
}
```

- [ ] Write failing provider contract tests for `seed()` tracking created IDs, cleanup ordering appointments before customers/services, and rejecting real mode without a token.
- [ ] Run the focused provider tests; confirm the current read-only `RealProvider` fails the mutation/cleanup expectations.
- [ ] Implement authenticated `post`, `put`, `patch`, and `delete` helpers using the existing typed capability adapters and `API-Version: 1.0`.
- [ ] Track created resources by type and clean them in dependency order. Return cleanup errors through the test diagnostic rather than swallowing them.
- [ ] Implement the factory with `E2E-${runId}` names, deterministic phone/email values, and an appointment date in the next available test window.
- [ ] Replace new fixed sleeps with `waitForVisible`, `waitForResponseStatus`, and bounded polling helpers.
- [ ] Run provider unit tests and `bun run --filter @emme/e2e build`; confirm pass.
- [ ] Commit as `test(e2e): make real tenant data deterministic`.

## Task 3: Complete tenant-owner page-object actions

**Files:**

- Modify: `e2e/src/pages/ServicesPage.ts`
- Modify: `e2e/src/pages/ClientsPage.ts`
- Modify: `e2e/src/pages/AppointmentsPage.ts`
- Modify: `e2e/src/pages/SettingsPage.ts`
- Modify: `e2e/src/pages/FinancesPage.ts`
- Test: existing mock specs under `e2e/src/specs/{services,customers,appointments}`

- [ ] Add failing mock journey assertions for service create/edit/retire, customer create/edit, appointment create, and settings persistence.
- [ ] Run the affected mock specs; confirm missing page-object actions or missing mock state transitions fail.
- [ ] Add focused page-object actions using `data-testid`, accessible labels, and role locators. Do not add CSS-selector-only actions when a semantic locator is available.
- [ ] Extend `MockProvider` only where required to represent the same visible state transitions as the real API.
- [ ] Run `bun run --filter @emme/e2e test:smoke` and each affected domain command; confirm pass with no backend.
- [ ] Commit as `test(e2e): cover tenant-owner UI actions in mock mode`.

## Task 4: Add real tenant-owner lifecycle journeys

**Files:**

- Create: `e2e/src/specs/real/tenant-owner-lifecycle.spec.ts`
- Create: `e2e/src/specs/real/authorization-and-errors.spec.ts`
- Modify: `e2e/src/shared/tags.ts`

- [ ] Write real-only failing journeys for login/tenant context, service lifecycle, customer lifecycle, appointment creation, settings persistence, and finances.
- [ ] Run with `E2E_MODE=real`; confirm failures identify missing real seed/auth/cleanup rather than silently passing on empty data.
- [ ] Implement each journey with unique data, bounded waits, visible outcome assertions, and provider cleanup.
- [ ] Add tenant isolation and insufficient-permission assertions using a non-owner fixture or a server-denied response; do not simulate authorization by hiding buttons only.
- [ ] Add validation/conflict/unavailable/retry assertions using real service responses where deterministic; keep provider failure injection in mock tests when the real external dependency cannot be controlled.
- [ ] Run the focused real suite against the local full stack and record the exact environment limitations.
- [ ] Commit as `test(e2e): cover real tenant-owner journeys`.

## Task 5: Add real recording journeys

**Files:**

- Create: `e2e/src/specs/demo/real-demo-recordings.spec.ts`
- Modify: `e2e/src/playwright.config.ts`
- Modify: `e2e/src/package.json`

- [ ] Write failing serial recording tests with names `01-owner-dashboard`, `02-service-lifecycle`, `03-customer-appointment`, `04-business-settings`, `05-finances-and-navigation`.
- [ ] Run the recording command with a local real stack; confirm it creates videos only under the real recording output directory.
- [ ] Implement short, stable journeys that reuse the real fixture but assert only critical user-visible outcomes.
- [ ] Verify no test reads or prints token/cookie/local-storage credential values.
- [ ] Run the recording command and inspect the generated HTML report and video count.
- [ ] Commit as `test(e2e): add real tenant-owner demo recordings`.

## Task 6: Add real-stack GitHub Actions workflow

**Files:**

- Create: `.github/workflows/real-e2e-recordings.yml`
- Modify: `e2e/README.md`
- Modify: `docs/architecture/03-integration/end-to-end.md`
- Modify: `docs/architecture/02-frontend/testing.md`

- [ ] Write a workflow validation test or source guard that requires service/web refs, real mode, recording mode, health wait, and artifact upload with `if: always()`.
- [ ] Run the guard before implementation; confirm it fails because the workflow is absent.
- [ ] Add `workflow_dispatch` inputs for `service_ref`, `web_ref`, and `runtime` with JVM as the safe default.
- [ ] Check out both repositories, install Bun/Java/Chromium, start the deterministic JVM stack, wait for health through the web origin, run real recordings serially, and upload reports/videos for 14 days.
- [ ] Ensure cleanup runs even when Playwright fails and secrets are supplied only through GitHub Actions secrets.
- [ ] Run actionlint if available and validate YAML/Markdown locally.
- [ ] Commit as `ci(e2e): archive real full-stack recordings`.

## Task 7: Add shell/accessibility and CI evidence guards

**Files:**

- Create: `e2e/src/specs/real/accessibility-and-shell.spec.ts`
- Modify: `e2e/src/specs/cross-cutting/real-smoke.spec.ts`
- Modify: `tasks/todo.md`

- [ ] Write failing checks for one `h1`, named landmarks, keyboard-visible focus, no horizontal overflow at 320/768/1440 widths, zero unexpected console errors, same-origin API calls, and the version header.
- [ ] Run the checks against the real stack; confirm each failure is actionable.
- [ ] Implement only the missing test hooks/locators or minimal UI fixes required for the current product flows.
- [ ] Run mock unit/component checks, mock E2E, real E2E, typecheck, lint, build, docs validation, and workflow validation.
- [ ] Record evidence and residual environment limitations in `tasks/todo.md`.
- [ ] Commit as `test(e2e): verify real shell accessibility and transport`.

## Definition of Done

- [ ] Mock E2E passes without a backend.
- [ ] Real E2E passes against deterministic Emme web/service infrastructure.
- [ ] Real recording command produces videos, traces, screenshots, and reports.
- [ ] GitHub Actions archives only real full-stack recording artifacts.
- [ ] Tenant-owner lifecycle and authorization journeys have visible outcome assertions.
- [ ] Accessibility, responsive, console, same-origin, and API-version checks pass.
- [ ] No credentials or generated recordings are tracked.
- [ ] All commits are pushed to `feat/api-version-contract` and the PR targets `feat/architecture-docs-separation`.
