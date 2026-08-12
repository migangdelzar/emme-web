# Project-Wide Code Structure Migration Plan

> **For implementation:** execute this plan task-by-task. Every behavioral or export change follows Red → Green → Refactor, and every task ends with focused verification before the next task begins.

**Design specification:** [2026-08-11 project-wide code structure design](../specs/2026-08-11-project-wide-code-structure-design.md)

**Goal:** Apply one explicit, scalable structure across `@emme/business`, `@emme/api`, `@emme/infrastructure`, `@emme/core`, `@emme/ui`, `salon-app`, `client-app`, and `admin-app` while preserving current runtime behavior, package APIs, and application routes.

**Architecture:** Use FSD-inspired vertical ownership in each app; use Hexagonal/Clean dependency direction at package and capability boundaries; use pragmatic DDD inside reusable business capabilities; use component-driven design in `@emme/ui` and app presentation folders. A feature owns its workflow: app `features/<capability>/application` orchestrates UI interactions, while `@emme/business/<capability>/application` owns framework-free commands and queries.

**Tech stack:** Bun workspaces, TypeScript, React, Vite, Vitest, ESLint, existing package scripts and architecture validators. No new runtime dependency is planned.

## Global constraints

- Preserve the current checkout's unrelated changes, including `e2e/src/.auth/` if it is present.
- Do not change endpoint paths, request/response wire shapes, auth behavior, route behavior, or visual behavior as part of this structural migration.
- Do not create `@emme/features`, `@emme/domain`, or `@emme/application` packages.
- `@emme/business` remains framework-free and may depend only on `@emme/kernel`.
- Business and infrastructure implementations depend on protocols; concrete adapters are wired only from composition roots.
- Compatibility barrels may re-export canonical modules during migration, but canonical modules must not import through their own compatibility barrels.
- Empty reserved boundaries receive a `README.md` explaining ownership and the allowed future contents; empty source directories without a marker are not accepted.
- Every new boundary or public export receives a focused test or architecture validation rule.
- Use `.js` extensions for relative imports in published ESM package source, matching the existing NodeNext convention.

## Exact target topology

The implementation must converge to this topology. `README.md` files mark intentionally reserved directories; `index.ts` files are added only where the directory is a source boundary.

```text
packages/business/src/
├── shared/
│   ├── domain/{errors,policies,value-objects}/README.md
│   └── application/{dto,ports}/README.md
├── appointments/
│   ├── domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/
│   └── application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/
├── clients/
│   ├── domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/
│   └── application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/
├── services/
│   ├── domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/
│   └── application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/
├── staff/{domain,application}/README.md
├── payments/{domain,application}/README.md
├── communications/{domain,application}/README.md
└── integrations/{domain,application}/README.md

packages/api/src/
├── client/
├── contracts/{common,errors,auth,tenants,appointments,clients,services,staff,integrations}/
├── ports/
├── providers/
└── testing/

packages/infrastructure/src/
├── http/
├── auth/
├── storage/
├── telemetry/
├── business/{appointments,clients,services,integrations}/
└── providers/

packages/core/src/{auth,tenancy,permissions,routing,configuration,errors,logging,feature-flags,runtime}/
packages/ui/src/{components,data-display,date-time,feedback,forms,hooks,layout,navigation,overlays,theme,web,native}/

apps/<app>/src/
├── app/{composition,providers,routing,layouts,guards,error-boundary,config}/
├── features/{appointments,clients,services,staff,payments,communications,integrations,settings}/
│   └── <capability>/{pages,components,hooks,api,mappers,domain,application,infrastructure,presentation,state,validation,shared,test}/
├── shared/{shell,hooks,lib,test}/
└── theme/
```

## Dependency graph and migration rules

```text
apps/<app>/src/features/<capability>
  -> @emme/business/<capability> (commands, queries, domain types)
  -> @emme/api (contracts and transport protocols)
  -> @emme/infrastructure (concrete adapters, only through composition roots)
  -> @emme/core / @emme/ui / @emme/i18n

@emme/infrastructure -> @emme/api + @emme/business + @emme/core
@emme/api -> @emme/core (only for transport-safe shared contracts)
@emme/business -> @emme/kernel
@emme/ui -> @emme/core only where the existing UI contract requires it; never business or app packages
@emme/core -> @emme/kernel
```

The architecture validator and boundary tests must reject package-to-app imports, app-to-app imports, `@/` aliases inside packages, UI-to-business imports, and retired package imports. Feature-to-feature imports inside one app are also forbidden unless routed through the app's approved shared boundary.

## Phase 0 — Baseline and migration harness

### Task 0.1 — Capture baseline and establish the migration checklist

**Files:** `tasks/todo.md`, `tasks/lessons.md` only if a new lesson is discovered.

**Steps:**

1. Record current branch, clean/dirty status, package manifests, and the current results of `bun run architecture:check`, `bun run docs:check`, `bun run typecheck`, and focused package tests.
2. Add this plan's acceptance criteria and a one-in-progress-item checklist to `tasks/todo.md`; do not remove historical entries.
3. Record any baseline failure verbatim in the working notes before changing source.

**Acceptance criteria:**

- The starting branch is `feat/project-architecture-structure`.
- Existing unrelated worktree files are identified and preserved.
- Baseline commands and their results are recorded.

**Verification:** `git status --short --branch`; `bun run architecture:check`; `bun run docs:check`.

**Dependencies:** None.

### Task 0.2 — Add structure assertions before moving implementation

**Files:**

- `packages/business/src/__tests__/structure.test.ts` (new)
- `packages/business/src/__tests__/package-boundary.test.ts` (update)
- `packages/business/package.json` (update exports only when the test specifies the new public paths)
- `scripts/validate-architecture.mjs` (update only for rules covered by a failing test)

**Red:** Add tests that assert canonical capability directories, shared boundary directories, public capability exports, and forbidden package direction. Run `bun run --filter @emme/business test` and capture the expected missing-path failures.

**Green:** Add only the directory markers, public barrels, and validator rules necessary for the assertions to pass.

**Refactor:** Consolidate repeated path/fixture helpers and make the assertions report the exact missing boundary or invalid import.

**Acceptance criteria:**

- Tests fail before the structure exists and pass after the harness is added.
- The validator names each violation with a stable rule identifier.
- No application behavior changes.

**Verification:** `bun run --filter @emme/business test`; `bun run architecture:check`.

**Dependencies:** None.

## Phase 1 — Create all canonical boundaries

### Task 1.1 — Add business shared and reserved capability boundaries

**Files:**

- `packages/business/src/shared/domain/errors/README.md`
- `packages/business/src/shared/domain/policies/README.md`
- `packages/business/src/shared/domain/value-objects/README.md`
- `packages/business/src/shared/application/dto/README.md`
- `packages/business/src/shared/application/ports/README.md`
- `packages/business/src/{staff,payments,communications,integrations}/domain/README.md`
- `packages/business/src/{staff,payments,communications,integrations}/application/README.md`
- `packages/business/src/{staff,payments,communications,integrations}/index.ts`

**Steps:** Add ownership/readme markers and stable empty capability barrels. The reserved capabilities must export no implementation until a real requirement introduces one.

**Acceptance criteria:** Every target business boundary is visible in the tree, explainable from its README, and typechecks without a fake domain model.

**Verification:** `bun run --filter @emme/business typecheck`; `bun run --filter @emme/business test`.

**Dependencies:** Task 0.2.

### Task 1.2 — Add API, infrastructure, core, UI, and app shell markers

**Files:**

- `packages/api/src/contracts/{staff,integrations}/README.md`
- `packages/infrastructure/src/business/{appointments,clients,services,integrations}/README.md`
- `packages/infrastructure/src/providers/README.md`
- `packages/core/src/logging/README.md`
- `packages/ui/src/{layout,navigation,overlays}/README.md`
- `apps/salon-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/README.md`
- `apps/client-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/README.md`
- `apps/admin-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/README.md`
- `apps/{salon-app,client-app,admin-app}/src/shared/{shell,hooks,lib,test}/README.md`
- `apps/{salon-app,client-app,admin-app}/src/theme/README.md`

**Steps:** Add markers with package/app-specific ownership and import rules. Do not move runtime files yet.

**Acceptance criteria:** All three apps and all shared packages show the same shell boundary names; reserved folders are intentional and documented.

**Verification:** `bun run docs:check`; `bun run architecture:check`; `git diff --check`.

**Dependencies:** Task 1.1.

### Checkpoint 1 — Canonical skeleton

- [ ] New structure tests pass.
- [ ] Architecture and Markdown validators pass.
- [ ] No implementation file has moved without a compatibility test.

## Phase 2 — Normalize reusable business capabilities

### Task 2.1 — Migrate appointments domain to explicit DDD folders

**Files:**

- `packages/business/src/appointments/domain/{appointment-tenant.ts,appointment-time-range.ts,appointment-status.ts,appointment.rules.ts,appointment-errors.ts,appointment.types.ts,index.ts}`
- `packages/business/src/appointments/domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/` (canonical files)
- `packages/business/src/appointments/index.ts`
- `packages/business/src/appointments/domain/index.ts`
- `packages/business/src/appointments/application/index.ts`
- `packages/business/package.json`
- `packages/business/src/__tests__/structure.test.ts`
- Existing appointments tests under `packages/business/src/appointments/**`

**Red:** Add canonical import/export tests for appointment types, status, time range, tenant, policies, and errors. Add assertions for policy/service/error ownership rather than file-name conventions.

**Green:** Move implementations into `domain/entities`, `domain/value-objects`, `domain/policies`, `domain/errors`, and `domain/types`; add canonical domain and capability barrels; keep old paths as explicit deprecation re-exports.

**Refactor:** Split mixed `appointment.rules.ts` and `appointment-errors.ts` by responsibility without changing public names or behavior. Keep domain implementations independent of application and infrastructure.

**Acceptance criteria:** Existing appointment tests pass; new canonical paths are importable; old paths remain compatible; no React, browser, API, or infrastructure import appears under `packages/business/src/appointments/domain`.

**Verification:** `bun run --filter @emme/business test`; `bun run --filter @emme/business typecheck`; `bun run architecture:check`; search `packages/business/src/appointments/domain` for imports from `@emme/api`, `@emme/infrastructure`, React, or browser APIs.

**Dependencies:** Checkpoint 1.

### Task 2.2 — Normalize appointments application into commands, queries, DTOs, ports, and mappers

**Files:**

- `packages/business/src/appointments/application/{cancel-appointment.ts,create-appointment.ts,use-cases.ts,ports.ts,index.ts}` (existing files that exist at implementation time)
- `packages/business/src/appointments/application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/`
- `packages/business/src/appointments/application/ports/appointment-repository.ts`
- `packages/business/src/appointments/application/salon/{list-salon-appointments.ts,list-salon-appointments.test.ts}`
- `packages/business/src/appointments/index.ts`
- Appointment application tests

**Red:** Add tests for canonical command/query imports, the appointment repository protocol, DTOs, and compatibility imports from `application/use-cases.ts`, `application/ports.ts`, and `application/salon/*`.

**Green:** Place command handlers in `commands`, read handlers in `queries`, transport-neutral DTOs in `dto`, and protocols in the appropriate `ports` subdirectory. Keep salon role/workflow orchestration in the app-owned layer; retain a compatibility export for current consumers.

**Refactor:** Remove duplicate type declarations and make all handlers consume protocols through constructor/function injection. Preserve existing error semantics and return shapes.

**Acceptance criteria:** The canonical application folders distinguish commands, queries, DTOs, ports, and mappers; all current callers compile; the business package still exports only framework-free APIs.

**Verification:** `bun run --filter @emme/business test`; `bun run --filter @emme/business typecheck`; `rg -n "new (Fetch|Http|Api|Client)|fetch\(" packages/business/src/appointments`.

**Dependencies:** Task 2.1.

### Task 2.3 — Normalize clients domain and application

**Files:**

- `packages/business/src/clients/domain/{client.rules.ts,client.types.ts,index.ts}`
- `packages/business/src/clients/domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/`
- `packages/business/src/clients/application/{create-client.ts,update-client.ts,index.ts}`
- `packages/business/src/clients/application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/`
- `packages/business/src/clients/application/ports/client-repository.ts`
- `packages/business/src/clients/index.ts`
- `packages/business/src/__tests__/structure.test.ts`
- Existing client unit tests

**Red:** Add canonical public export tests and compatibility tests for the current create/update use cases, client types, rules, and repository protocol.

**Green:** Move/split client rules and types into their responsibility folders; move create/update into command handlers; place repository protocols under `ports/repositories`; retain old re-exports.

**Refactor:** Ensure domain rules do not depend on DTOs, React, transport, or infrastructure and that application handlers accept injected repository protocols.

**Acceptance criteria:** Existing client behavior and tests are unchanged; canonical and compatibility imports both work; no layer inversion is introduced.

**Verification:** `bun run --filter @emme/business test`; `bun run --filter @emme/business typecheck`; `bun run architecture:check`.

**Dependencies:** Task 2.2.

### Task 2.4 — Normalize services and reserve future capabilities

**Files:**

- `packages/business/src/services/domain/{service.rules.ts,service.types.ts,index.ts}`
- `packages/business/src/services/domain/{entities,aggregates,value-objects,policies,services,events,errors,types}/`
- `packages/business/src/services/application/{commands,queries,dto/{commands,queries,results},ports/{repositories,gateways,publishers,services},mappers}/README.md`
- `packages/business/src/services/index.ts`
- `packages/business/src/__tests__/structure.test.ts`
- Existing services tests

**Red:** Add canonical service boundary and compatibility export assertions.

**Green:** Move current service rules/types into the canonical folders and create the empty application boundaries with markers.

**Refactor:** Keep services capability-specific; put cross-capability policies in `business/shared` only when at least two capabilities consume the same policy.

**Acceptance criteria:** Services has the same boundary shape as appointments and clients, without inventing unsupported service workflows; reserved staff/payments/communications/integrations folders remain empty but documented.

**Verification:** `bun run --filter @emme/business test`; `bun run --filter @emme/business typecheck`; `bun run docs:check`.

**Dependencies:** Task 2.3.

### Checkpoint 2 — Business package

- [ ] Appointments, clients, and services expose canonical and compatibility APIs.
- [ ] Business package boundary tests pass.
- [ ] No behavior or public wire contract changed.
- [ ] All new command/query/application boundaries have focused tests.

## Phase 3 — Align adapters and transport contracts

### Task 3.1 — Move infrastructure adapters under business capability boundaries

**Files:**

- `packages/infrastructure/src/api/appointment-repository.adapter.ts`
- `packages/infrastructure/src/api/client-repository.adapter.ts`
- `packages/infrastructure/src/business/appointments/appointment-repository.adapter.ts`
- `packages/infrastructure/src/business/clients/client-repository.adapter.ts`
- `packages/infrastructure/src/business/services/README.md`
- `packages/infrastructure/src/business/integrations/README.md`
- `packages/infrastructure/src/index.ts` and affected infrastructure tests

**Red:** Add adapter export/boundary tests that import the canonical capability paths and assert the adapters implement the business protocols.

**Green:** Move adapters into `infrastructure/business/<capability>`, update imports to canonical business ports, and preserve temporary old-path re-exports.

**Refactor:** Keep HTTP/auth/storage/telemetry code in their existing technical adapter folders; only business-facing adapter placement changes.

**Acceptance criteria:** Infrastructure implementations depend on business protocols and API contracts, never the reverse; existing adapter behavior/tests remain green.

**Verification:** `bun run --filter @emme/infrastructure test`; `bun run --filter @emme/infrastructure typecheck`; `bun run architecture:check`; `rg -n "from ['\"]@emme/infrastructure" packages/business/src`.

**Dependencies:** Checkpoint 2.

### Task 3.2 — Normalize API contracts and provider boundaries

**Files:**

- `packages/api/src/contracts/{common,errors,auth,tenants,appointments,clients,services,staff,integrations}/`
- `packages/api/src/ports/`
- `packages/api/src/providers/`
- `packages/api/src/index.ts` and affected API tests

**Red:** Add tests for canonical contract imports, error/common contract ownership, and provider/port boundaries.

**Green:** Group existing contract files into capability folders; add markers for staff/integrations; preserve root/public compatibility exports.

**Refactor:** Keep API contracts transport-oriented and serializable. Do not move business rules into API contracts or add concrete fetch/storage implementations.

**Acceptance criteria:** API consumers can import canonical contract paths; current request/response shapes are byte-for-byte compatible; provider protocols remain replaceable.

**Verification:** `bun run --filter @emme/api test`; `bun run --filter @emme/api typecheck`; `bun run architecture:check`.

**Dependencies:** Task 3.1.

### Checkpoint 3 — Integration boundaries

- [ ] Infrastructure adapters compile against canonical business ports.
- [ ] API contract compatibility tests pass.
- [ ] No package imports an app or uses an app alias.

## Phase 4 — Standardize platform and design-system package shapes

### Task 4.1 — Add explicit core platform boundaries

**Files:**

- `packages/core/src/{auth,tenancy,permissions,routing,configuration,errors,logging,feature-flags,runtime}/`
- `packages/core/src/index.ts`
- Existing core tests and package exports

**Red:** Add structure/export tests for the logging boundary and all core platform domains.

**Green:** Add the missing logging marker/index and normalize any root-level files that belong under the named platform boundary without altering runtime exports.

**Refactor:** Keep core independent from feature UI and business capability implementations; consolidate only genuinely platform-wide concerns.

**Acceptance criteria:** Core has one predictable platform boundary per concern and all existing auth, tenancy, routing, and configuration imports remain valid.

**Verification:** `bun run --filter @emme/core test`; `bun run --filter @emme/core typecheck`; `bun run architecture:check`.

**Dependencies:** Checkpoint 3.

### Task 4.2 — Normalize UI component-driven boundaries

**Files:**

- `packages/ui/src/components/<Component>/` for each existing component group
- `packages/ui/src/{data-display,date-time,feedback,forms,hooks,layout,navigation,overlays,theme,web,native}/`
- `packages/ui/src/index.ts`
- Existing UI tests and package exports

**Red:** Add structure tests that every exported reusable component has a component-owned folder and that UI imports do not reference business/app packages.

**Green:** Move only reusable UI implementation and tests into component-owned folders; add layout/navigation/overlay markers and preserve public exports.

**Refactor:** Keep domain-specific UI in apps; keep `@emme/ui` components presentation-only, with explicit props and no capability workflow.

**Acceptance criteria:** `@emme/ui` follows CDD ownership, existing component imports work, and the UI package remains free of business/app dependencies.

**Verification:** `bun run --filter @emme/ui test`; `bun run --filter @emme/ui typecheck`; `bun run architecture:check`.

**Dependencies:** Task 4.1.

## Phase 5 — Apply FSD ownership to all applications

### Task 5.1 — Normalize salon app shell boundaries

**Files:**

- `apps/salon-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/`
- `apps/salon-app/src/shared/{shell,hooks,lib,test}/`
- `apps/salon-app/src/theme/`
- `apps/salon-app/src/app/index.ts` and existing shell/composition files
- `apps/salon-app/src/__tests__/architecture.test.ts` (new or update existing architecture tests)

**Red:** Add app architecture tests for allowed dependency direction, app-owned composition, shared shell ownership, and the separate theme boundary.

**Green:** Move existing app bootstrap/providers/router/layout/guard/config modules into canonical app folders and preserve aliases/routes through compatibility exports where required.

**Refactor:** Ensure composition roots are the only place that instantiate concrete infrastructure adapters; remove duplicate shell helpers from feature folders.

**Acceptance criteria:** Salon app owns its shell and workflows; shared package code is not pulled into the app through internal relative paths; current routes and auth behavior remain unchanged.

**Verification:** `bun run --filter salon-app test`; `bun run --filter salon-app typecheck`; `bun run architecture:check`; `bun run --filter salon-app build`.

**Dependencies:** Checkpoint 3 and Task 4.2.

### Task 5.2 — Normalize salon capability feature slices

**Files:**

- `apps/salon-app/src/features/appointments/{pages,components,hooks,api,mappers,domain,application,infrastructure,presentation,state,validation,shared,test}/`
- `apps/salon-app/src/features/clients/{pages,components,hooks,api,mappers,domain,application,infrastructure,presentation,state,validation,shared,test}/`
- `apps/salon-app/src/features/services/{pages,components,hooks,api,mappers,domain,application,infrastructure,presentation,state,validation,shared,test}/`
- `apps/salon-app/src/features/{auth,dashboard,finances,google-workspace,navigation,onboarding,settings}/` with the same boundary markers where a layer is intentionally empty
- Existing salon feature source/test files and feature public barrels

**Red:** Add feature boundary tests for appointments, clients, services, and the existing supporting features. Tests must assert that each feature's workflow orchestration is local to its `application` boundary and that feature internals do not import another feature directly.

**Green:** Move current feature pages/components/hooks/API/mappers/domain/application/infrastructure/presentation/state/validation/shared code into the corresponding feature-owned folders. Keep compatibility barrels only for current import consumers.

**Refactor:** Split mixed files by responsibility; remove feature-level duplicate transport logic in favor of `@emme/api` protocols and infrastructure adapters; keep UI-only code in components/pages/presentation.

**Acceptance criteria:** Current salon workflows retain behavior; appointments, clients, and services visibly follow the canonical FSD slice; every feature owns its workflow boundary; tests cover the new boundary.

**Verification:** `bun run --filter salon-app test`; `bun run --filter salon-app typecheck`; `bun run --filter salon-app test:coverage`; `bun run --filter salon-app build`; `rg -n "from ['\"]\.\./(appointments|clients|services|settings)" apps/salon-app/src/features`.

**Dependencies:** Task 5.1 and Phase 3.

### Task 5.3 — Scaffold client and admin apps with the same FSD shell

**Files:**

- `apps/client-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/`
- `apps/client-app/src/features/{appointments,clients,services,staff,payments,communications,integrations,settings}/`
- `apps/client-app/src/shared/{shell,hooks,lib,test}/`
- `apps/client-app/src/theme/`
- `apps/admin-app/src/app/{composition,providers,routing,layouts,guards,error-boundary,config}/`
- `apps/admin-app/src/features/{appointments,clients,services,staff,payments,communications,integrations,settings}/`
- `apps/admin-app/src/shared/{shell,hooks,lib,test}/`
- `apps/admin-app/src/theme/`
- `apps/{client-app,admin-app}/src/__tests__/architecture.test.ts`

**Red:** Add tests that assert both apps expose the canonical shell/feature boundaries, keep their login pages app-local, and do not import each other or salon feature internals.

**Green:** Add documented reserved feature markers and move existing client/admin shell files into `app`, `shared`, `theme`, and the currently implemented feature folders.

**Refactor:** Keep unimplemented capability folders empty and documented; do not copy salon workflows into client/admin until product requirements exist.

**Acceptance criteria:** All three deployables share the same structural contract while retaining separate app ownership and current auth/render behavior.

**Verification:** `bun run --filter client-app test`; `bun run --filter admin-app test`; `bun run --filter client-app typecheck`; `bun run --filter admin-app typecheck`; `bun run --filter client-app build`; `bun run --filter admin-app build`; `bun run architecture:check`.

**Dependencies:** Task 5.1.

### Checkpoint 4 — Application ownership

- [ ] All three apps expose the same canonical shell and feature boundary names.
- [ ] Salon owns current workflows; client/admin have documented reserved slices.
- [ ] No cross-app or direct feature-to-feature imports remain.
- [ ] App tests, typechecks, and builds pass.

## Phase 6 — Remove migration shims after consumer migration

### Task 6.1 — Migrate all consumers to canonical imports

**Files:** Every source/test file reported by the following searches, plus affected package manifests:

- `rg -l "@emme/business/(appointments|clients|services)" packages apps`
- `rg -l "appointments/(application|domain)|clients/(application|domain)|services/(application|domain)" packages apps`
- `rg -l "features/[^/]+/[^/]*/" apps`

**Steps:** Replace old import paths with canonical paths one capability at a time, updating tests in the same change. Run the relevant package suite after each capability.

**Acceptance criteria:** No production source imports a deprecated compatibility path; all public package consumers use documented canonical entry points; compatibility shims remain only where an external/public consumer requires them and are explicitly documented.

**Verification:** `rg -n "application/(use-cases|ports)|domain/[^/]+\.(rules|types)|@emme/features|@emme/domain|@emme/application" packages apps`; `bun run typecheck`; `bun run test`.

**Dependencies:** Phase 5.

### Task 6.2 — Make architecture validation enforce the final topology

**Files:**

- `scripts/validate-architecture.mjs`
- `packages/business/src/__tests__/package-boundary.test.ts`
- `packages/business/src/__tests__/structure.test.ts`
- `apps/{salon-app,client-app,admin-app}/src/__tests__/architecture.test.ts`
- `docs/architecture/README.md` and relevant architecture documents

**Red:** Add final forbidden-import and missing-boundary cases to the tests.

**Green:** Implement validator rules for canonical package/app boundaries, feature ownership, and compatibility-shim restrictions.

**Refactor:** Make validator output actionable with file, rule, and offending specifier; keep the implementation independent of test-only fixtures.

**Acceptance criteria:** Removing a required boundary marker or adding a forbidden dependency causes a deterministic failure; the complete repository passes with the final topology.

**Verification:** `bun run architecture:check`; run the focused architecture tests; manually inject a temporary forbidden import in a disposable working copy and confirm the validator rejects it.

**Dependencies:** Task 6.1.

## Phase 7 — Documentation and final verification

### Task 7.1 — Update architecture documentation and examples

**Files:**

- `docs/architecture/README.md`
- `docs/architecture/01-system-overview.md`
- `docs/architecture/02-layered-architecture.md`
- `docs/architecture/03-dependency-rules.md`
- `docs/architecture/04-feature-structure.md`
- `docs/architecture/05-testing-and-validation.md`
- `docs/architecture/06-adrs.md`
- `docs/architecture/07-import-migration-map.md`
- `docs/architecture/08-app-shell-and-features.md`
- `docs/architecture/09-package-responsibilities.md`
- `docs/architecture/10-contribution-checklist.md`

**Steps:** Replace stale paths and historical topology references with the canonical tree, describe feature-owned workflows, document the four complementary patterns, and add examples for a new capability in business, infrastructure, API, and app layers.

**Acceptance criteria:** Every documented path exists; every canonical boundary is explained; no historical architecture is presented as current.

**Verification:** `bun run docs:check`; `rg -n "@emme/features|@emme/domain|@emme/application|historical|legacy" docs/architecture` and review every remaining match.

**Dependencies:** Task 6.2.

### Task 7.2 — Run complete quality verification and finalize the checklist

**Files:** `tasks/todo.md`, `tasks/lessons.md` only if a new lesson is found.

**Steps:** Run the complete quality suite, update task statuses/results, inspect the final diff for unrelated changes, and commit source changes in logical units.

**Verification commands:**

```bash
bun run architecture:check
bun run docs:check
bun run typecheck
bun run lint
bun run test
bun run test:coverage
bun run build
bun run security:check
git diff --check
git status --short
```

**Acceptance criteria:** All required checks pass with zero test failures and no skipped tests introduced by this migration; all files are committed; the feature branch is pushed; the remote branch's latest commit matches the final local commit.

**Dependencies:** Task 7.1.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Large move touches many import paths | High | Canonical public export tests first; compatibility re-exports; migrate one capability at a time. |
| A “rules” or “types” file mixes multiple responsibilities | Medium | Split by responsibility only after behavior tests are green; keep names/exports stable. |
| Empty folders are removed by tooling or ignored by Git | Medium | Add ownership `README.md` markers and structure tests. |
| App shell and feature ownership are confused | High | App architecture tests enforce composition-root ownership and forbid feature-to-feature imports. |
| Architecture docs drift from source | Medium | Documentation validator plus final path audit. |
| Existing unrelated worktree changes are staged accidentally | High | Inspect `git status` before every commit and stage explicit paths. |
| Test/build failures expose pre-existing issues | Medium | Capture baseline first; distinguish baseline failures from migration regressions in `tasks/todo.md`. |

## Definition of done

- [ ] The exact target topology exists across all packages and apps.
- [ ] Appointments, clients, and services use explicit domain/application boundaries with compatibility exports during migration.
- [ ] Reserved capabilities have documented empty boundaries.
- [ ] Feature workflows are owned by their app feature slice.
- [ ] Every boundary has focused tests or architecture validation.
- [ ] Package dependency direction and forbidden imports are enforced.
- [ ] Architecture documentation matches the source tree and contains no stale current topology.
- [ ] Full quality verification passes.
- [ ] All intended changes are committed and pushed to `origin/feat/project-architecture-structure`.
