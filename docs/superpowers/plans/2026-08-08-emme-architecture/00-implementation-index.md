# Emme Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement these plans task-by-task. Each task uses Red → Green → Refactor and must be committed independently.

**Goal:** Migrate the Bun workspace and the current `@emme/emme-salon-app` toward the approved modular monorepo with explicit UI, validation, i18n, test-support, domain, application, API, infrastructure, core, and features packages.

**Architecture:** Keep applications as composition shells and keep reusable behavior in packages. Domain remains pure, application owns use cases and ports, API owns typed backend contracts and operations, infrastructure owns concrete external adapters, core owns runtime concerns, and features owns reusable React business adapters.

**Tech Stack:** Bun `>=1.2` with `bun@1.3.14`, TypeScript 5.8+, React 19, Vite, Vitest 4, TanStack Query 5, Zod 4, React Router 7, and Playwright for E2E.

## Global Constraints

- Use Bun workspaces and Bun scripts; do not add pnpm, Turbo, or a second task runner.
- Preserve the current application package name `@emme/emme-salon-app`.
- The typed client library is named `@emme/api`; do not introduce `@emme/api-client` imports or directories.
- `@emme/domain` must not import React, browser APIs, transport clients, storage, or workspace packages.
- `@emme/application` depends on domain protocols and receives concrete dependencies through factories or function parameters.
- `@emme/api` defines DTOs, requests, responses, routes, parsers, and transport ports; it does not instantiate fetch, Axios, Apollo, or browser storage.
- `@emme/infrastructure` contains concrete HTTP, auth storage, request-context, repository adapters, analytics, observability, and browser integrations.
- `@emme/core` contains auth, tenancy, permission, runtime configuration, providers, and application errors; concrete browser implementations stay in infrastructure.
- `@emme/features` contains reusable React business adapters only after their boundaries are proven; app-only composition remains in `apps/emme-salon-app`.
- Tests are colocated beside the module under test by default; `src/__tests__/` is for package-level cross-module integration or contract tests; E2E remains under `e2e/`.
- Every behavior change follows Red → Green → Refactor, with a focused commit after the task is green and refactored.
- Every package exposes public behavior through `src/index.ts`; internal paths are not imported by consumers.
- Every migration phase must preserve current routes, tenant behavior, translations, loading states, error behavior, and API payload compatibility.

## Plan Set

| Order | Plan | Package or application | Prerequisites | Parallelizable |
|---:|---|---|---|---|
| 1 | [UI](./01-ui-plan.md) | `@emme/ui` | None | Yes |
| 1 | [Validation](./02-validation-plan.md) | `@emme/validation` | None | Yes |
| 1 | [i18n](./03-i18n-plan.md) | `@emme/i18n` | None | Yes |
| 1 | [Test support](./04-test-support-plan.md) | `@emme/test-support` | UI/provider decisions only | Yes |
| 2 | [Domain](./05-domain-plan.md) | `@emme/domain` | None; use plain domain types and explicit inputs | Yes after shared foundations |
| 3 | [Application](./06-application-plan.md) | `@emme/application` | Domain | No |
| 4 | [API](./07-api-plan.md) | `@emme/api` | Existing contracts/API audit | Yes with infrastructure after ports are agreed |
| 5 | [Infrastructure](./08-infrastructure-plan.md) | `@emme/infrastructure` | API ports and application ports | No |
| 6 | [Core](./09-core-plan.md) | `@emme/core` | API contracts and infrastructure factories | No |
| 7 | [Features](./10-features-plan.md) | `@emme/features` | Core, application, API, i18n, validation, UI | No |
| 8 | [Salon integration](./11-emme-salon-app-integration-plan.md) | `@emme/emme-salon-app` | All package plans required for each migrated slice | No |

## Dependency Order

```text
ui ───────────────┐
validation ────────┼──> domain ──> application ──> api ──> infrastructure ──> core
i18n ──────────────┤                                      └───────────────┐
test-support ──────┘                                                      │
ui + validation + i18n + core + application + api ──> features ──> salon app
```

The API and infrastructure plans may be prepared in parallel, but infrastructure implementation cannot begin until the API transport ports and application repository ports are stable. Features and app integration are intentionally last because they consume the public contracts established by the lower layers.

## Cross-Plan Verification Commands

Run from the repository root after each completed phase:

```bash
bun run --filter '@emme/<package>' typecheck
bun run --filter '@emme/<package>' test
bun run docs:check
```

Run before declaring the complete migration done:

```bash
bun run docs:check
bun run i18n:check
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run test:coverage
bun run build
bun run test:e2e:mock
bun run security:check
```

## Global Definition of Done

- [ ] All eleven plans are completed and their task checkboxes are marked complete.
- [ ] Every package has a stable `src/index.ts` and no consumer imports package internals.
- [ ] `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, and relevant E2E checks pass with zero failures and no skipped tests.
- [ ] `bun run docs:check` and `bun run i18n:check` pass.
- [ ] Import-boundary tests prove the forbidden dependency directions are not reintroduced.
- [ ] The salon app retains `/dashboard`, `/agenda`, `/clients`, `/services`, `/finances`, and `/settings` behavior.
- [ ] No `api-client` name remains in package names, exports, imports, or documentation except migration-history references.
- [ ] Every logical task is committed with a conventional commit message and the branch is pushed.
