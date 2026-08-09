# Cross-App Quality and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Verify the complete monorepo across package boundaries, apps, browser journeys, accessibility, security, performance, CI, and release checks.

**Architecture:** Quality gates run from the root and use package-aware Bun scripts. Unit and package tests prove local contracts; Playwright proves critical integrated outcomes in mocked and real-backend modes.

**Tech Stack:** Bun, Vitest, Testing Library, Playwright, ESLint, TypeScript, Prettier, existing CI tooling.

## Global Constraints

- Zero failing, skipped, or pending tests.
- Mocked E2E is deterministic and does not call real external services.
- Real E2E requires configured environment variables and never commits credentials.
- Security checks include tenant mismatch, permission denial, secret redaction, and browser storage review.

## Files

- Modify: root `package.json`, CI workflows, `e2e/src/`, Playwright config, docs quality scripts, and `docs/architecture/04-delivery/*`.
- Create: `scripts/validate-architecture.mjs`, package/app quality configs where missing, accessibility test helpers, and release checklist.
- Test: root validation scripts, app smoke tests, critical Playwright journeys, and package boundary suites.

### Task 1: Root quality orchestration

- [x] **Step 1:** Write a failing test that verifies the root quality command includes docs, i18n, architecture, typecheck, lint, test, coverage, build, and security stages.
- [x] **Step 2:** Implement deterministic root scripts with Bun filters and clear failure propagation.
- [x] **Step 3:** Run `bun run quality`; expected result is PASS or a documented environment-only real-E2E skip outside the default quality command.

### Task 2: Accessibility and responsive coverage

- [x] **Step 1:** Write component smoke tests for keyboard navigation, focus return, labels, dialog semantics, table alternatives, and responsive empty/error states.
- [x] **Step 2:** Add the shared test helpers and run them across `@emme/ui`, feature presentation, and app workflows.
- [x] **Step 3:** Run focused Vitest suites; expected result is PASS.

### Task 3: Browser journeys

- [x] **Step 1:** Add deterministic mocked journeys for studio, client, and admin critical paths using explicit fixtures and route-boundary mocks.
- [x] **Step 2:** Add real-backend projects guarded by required environment variables and same-origin API routing.
- [x] **Step 3:** Run `bun run test:e2e:mock`; expected result is PASS with zero committed recordings.

### Task 4: Security, performance, and release

- [x] **Step 1:** Write checks for forbidden imports, secret patterns, tenant headers, cache scope, oversized route bundles, and error redaction.
- [x] **Step 2:** Implement checks and document thresholds in `docs/architecture/04-delivery/quality-gates.md` and `05-operations/security.md`.
- [x] **Step 3:** Run lint, `bun audit --audit-level=high`, build analysis, and smoke HTTP checks.

### Task 5: Final verification and commit

- [x] **Step 1:** Run `bun run docs:check`, `bun run i18n:check`, `bun run architecture:check`, `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`, and `bun run test:e2e:mock`.
- [x] **Step 2:** Record evidence and unresolved environment-only checks in the release checklist.
- [x] **Step 3:** Commit and push the complete verified program.

```bash
git add package.json scripts docs/architecture .github e2e
git commit -m "chore(quality): verify monorepo boundaries and release gates"
git push origin feat/api-version-contract
```

## Definition of Done

- [x] All package and app plans have passing verification.
- [x] Architecture, accessibility, security, performance, CI, and release documentation is current.
- [x] The remote branch contains the complete plan and verification artifacts.

**Status:** Complete
