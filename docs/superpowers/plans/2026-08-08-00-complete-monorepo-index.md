# Complete Monorepo Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Establish the complete EMME monorepo architecture, shared packages, vertical business modules, three application shells, architecture handbook, and test system.

**Architecture:** Business code is vertical by feature inside `@emme/features`; each complex feature contains domain, application, API, infrastructure, validation, presentation, i18n, and tests. Apps are composition roots and own role-specific workflows. Pure primitives live in `@emme/kernel`; runtime concerns live in `@emme/core`.

**Tech Stack:** Bun workspaces, Node-compatible ESM, React 19, TypeScript 5, Vite, Vitest, Testing Library, Playwright, Zod, TanStack Query where already adopted.

## Global Constraints

- Keep Bun workspaces and existing package names; do not migrate to pnpm or Turbo.
- `@emme/kernel` has no React, browser, API, application, or infrastructure dependencies.
- Generic UI in `@emme/ui` never imports business concepts.
- Feature domain/application code is React-free and depends on protocols.
- Apps instantiate concrete dependencies only in composition roots.
- Backend authorization, tenant isolation, validation, persistence, and invariants remain authoritative.
- Every code task follows Red → Green → Refactor → Verify.
- Every created or modified file is tested at its applicable test layer.
- Use strict TypeScript with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `useUnknownInCatchVariables`, `verbatimModuleSyntax`, `isolatedModules`, exhaustive discriminated unions, branded IDs, typed `Result` errors, and `satisfies`-checked configuration.

## Plan Portfolio

| Plan | Document | Depends on |
|---|---|---|
| 01 | [Workspace and architecture handbook](2026-08-08-01-workspace-and-architecture-handbook.md) | none |
| 02 | [Kernel](2026-08-08-02-kernel.md) | 01 |
| 03 | [Test support](2026-08-08-03-test-support.md) | 02 |
| 04 | [UI](2026-08-08-04-ui.md) | 02, 03 |
| 05 | [Core runtime](2026-08-08-05-core.md) | 02, 03, 07 |
| 06 | [i18n](2026-08-08-06-i18n.md) | 02, 03 |
| 07 | [API](2026-08-08-07-api.md) | 02, 03 |
| 08 | [Infrastructure](2026-08-08-08-infrastructure.md) | 02, 03, 07 |
| 09 | [Appointments](2026-08-08-09-feature-appointments.md) | 02, 03, 07, 08 |
| 10 | [Catalog](2026-08-08-10-feature-catalog.md) | 02, 03, 07, 08 |
| 11 | [Customers](2026-08-08-11-feature-customers.md) | 02, 03, 07, 08 |
| 12 | [Staff](2026-08-08-12-feature-staff.md) | 02, 03, 07, 08 |
| 13 | [Payments](2026-08-08-13-feature-payments.md) | 02, 03, 07, 08 |
| 14 | [Communications](2026-08-08-14-feature-communications.md) | 02, 03, 07, 08 |
| 15 | [Integrations](2026-08-08-15-feature-integrations.md) | 02, 03, 07, 08 |
| 16 | [Tenant configuration and onboarding](2026-08-08-16-feature-tenant-configuration-onboarding.md) | 02, 03, 07, 08 |
| 17 | [Analytics](2026-08-08-17-feature-analytics.md) | 02, 03, 07, 08 |
| 18 | [Salon app](2026-08-08-18-emme-salon-app.md) | 04–17 as consumed |
| 19 | [Client app](2026-08-08-19-client-app.md) | 04–17 as consumed |
| 20 | [Platform admin app](2026-08-08-20-platform-admin-app.md) | 04–08 |
| 21 | [Cross-app quality and release](2026-08-08-21-cross-app-quality.md) | 18–20 |

## Dependency Graph

```text
01 → 02 → 03
          ├→ 04
          ├→ 06
          └→ 07 → 08
                    └→ 09–17
                              └→ 18–20
                                        └→ 21
```

## Required Program Tracking

- [ ] Keep this index synchronized with each child plan status.
- [ ] Maintain a requirement matrix for `FR-WS###`, `FR-WC###`, and `FR-WA###`.
- [ ] Record every backend capability gap in the owning plan's dependency section.
- [ ] Do not begin an app plan until the feature contracts it consumes are exported and tested.
- [ ] Do not mark the program complete until plan 21 passes all quality gates.

## Verification Commands

```bash
bun run docs:check
bun run typecheck
bun run lint
bun test
bun run build
bun run test:e2e:mock
```

## Definition of Done

- [ ] Plans 01–21 are complete and linked.
- [ ] The architecture handbook documents structure, ownership, naming, dependencies, testing, and runtime boundaries.
- [ ] Every package and feature has focused tests and boundary tests.
- [ ] All three app shells consume public package APIs only.
- [ ] Verification commands pass with zero test failures and zero skipped tests.
- [ ] All work is committed in logical conventional commits and pushed to `feat/api-version-contract`.

### Task 1: Maintain the program index

**Files:**
- Modify: `docs/superpowers/plans/2026-08-08-00-complete-monorepo-index.md`

**Steps:**

- [ ] **Step 1:** Update the status table after each child plan reaches a verified milestone.
- [ ] **Step 2:** Run `bun run docs:check` and confirm the index links resolve.
- [ ] **Step 3:** Commit index-only status updates with `docs(plan): update monorepo plan status`.
