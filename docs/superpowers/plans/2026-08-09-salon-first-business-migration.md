# Salon-First Business Consolidation and UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Consolidate reusable domain and application code into `@emme/business`, move salon presentation into `apps/salon-app/src/features`, and preserve existing behavior.

**Architecture:** `@emme/business` is one framework-independent package organized by capability. Each capability has internal `domain` and `application` layers with `application → domain → kernel`. The salon app owns salon pages, hooks, state, view models, and business-specific React components. `@emme/features` remains a compatibility facade for non-salon consumers until they migrate.

**Tech Stack:** Bun 1.3, TypeScript 5.8, React 19, Vite 6, Vitest 4, Testing Library, Playwright, TanStack Query 5.

## Global Constraints

- Keep `admin-app`, `salon-app`, and `client-app` as separate deployable applications.
- `@emme/business` must not import React, browser APIs, routing, TanStack Query, HTTP clients, storage, or concrete infrastructure.
- `@emme/ui` must not import business concepts.
- Use protocol-based dependency injection for application ports and infrastructure adapters.
- Write the failing test before each behavior change.
- Preserve routes, API shapes, authentication, tenant context, selectors, and Playwright flows.
- Do not remove `@emme/features` until no application imports it.
- Do not create speculative shared React components or hooks.

## Target Structure

```text
packages/business/
├── package.json
├── tsconfig.json
└── src/
    ├── appointments/{domain,application}/
    ├── clients/{domain,application}/
    ├── services/domain/
    ├── __tests__/package-boundary.test.ts
    └── index.ts

apps/salon-app/src/features/
├── auth/
├── appointments/
├── clients/
├── dashboard/
├── finances/
├── onboarding/
├── services/
└── settings/
```

## Task 1: Create the Business Package Boundary

**Files:** Create `packages/business/package.json`, `packages/business/tsconfig.json`, `packages/business/src/index.ts`, and `packages/business/src/__tests__/package-boundary.test.ts`; modify root `package.json` and `packages/infrastructure/package.json`.

- [ ] **Step 1: Write the failing test.** Scan `packages/business/src` and reject imports of React, browser globals, `@tanstack`, `@emme/api`, `@emme/infrastructure`, and `apps/`. Import the future public exports for appointments, clients, and services.
- [ ] **Step 2: Run `bun run --filter @emme/business test`.** Expected: failure because the package does not exist.
- [ ] **Step 3: Create the strict NodeNext package.** Use the current domain/application tsconfig settings, export `.`, `./appointments`, `./clients`, and `./services`, and add the package to root scripts.
- [ ] **Step 4: Run `bun run --filter @emme/business typecheck && bun run --filter @emme/business test`.** Expected: the boundary test passes; capability exports remain red until Task 2.
- [ ] **Step 5: Commit.** Run `git add packages/business package.json packages/infrastructure/package.json && git commit -m "feat(business): add consolidated business package boundary"`.

## Task 2: Consolidate Domain and Application Sources

**Files:** Move `packages/domain/src/appointments`, `clients`, and `services` into `packages/business/src/*/domain`; move `packages/application/src/appointments` and `clients` into `packages/business/src/*/application`; update all imports and package manifests.

- [ ] **Step 1: Write failing contract tests.** Assert that `@emme/business/appointments` exports appointment types/rules, cancellation, listing, and repository ports; assert equivalent client/service exports; assert application code may import domain code but domain code cannot import application code.
- [ ] **Step 2: Run `bun run --filter @emme/business test`.** Expected: missing-export failures.
- [ ] **Step 3: Move the existing source and adjacent tests without changing behavior.** Use relative imports inside the package and capability barrels at `src/*/index.ts`.
- [ ] **Step 4: Update consumers.** Replace `@emme/domain` and `@emme/application` imports in `packages/infrastructure`, `packages/features`, and all apps with the relevant `@emme/business/*` import.
- [ ] **Step 5: Run `bun run typecheck && bun run --filter @emme/business test && bun run --filter @emme/infrastructure test && bun run --filter @emme/features test`.** Expected: all pass.
- [ ] **Step 6: Remove obsolete domain/application manifests and root script filters only after `rg '@emme/(domain|application)'` returns no source/package imports.** Keep historical docs for the documentation task.
- [ ] **Step 7: Commit.** Run `git add packages/business packages/domain packages/application packages/infrastructure packages/features apps package.json && git commit -m "refactor(business): consolidate domain and application packages"`.

## Task 3: Establish Salon Feature Ownership

**Files:** Create local barrels under `apps/salon-app/src/features/{auth,appointments,clients,dashboard,finances,onboarding,services,settings}` and `features/shared`; modify `App.tsx`, `AppProviders.tsx`, `AppLayout.tsx`, and `router.tsx`; create `features/feature-boundary.test.ts`.

- [ ] **Step 1: Write a failing boundary test.** Reject `@emme/features` imports from salon-owned files and deep imports across local feature internals; assert the existing route paths.
- [ ] **Step 2: Run `bun run --filter salon-app test -- src/features/feature-boundary.test.ts`.** Expected: failure because the shell still imports `@emme/features`.
- [ ] **Step 3: Move auth, onboarding, navigation, settings context, dashboard, and finances presentation into the corresponding local feature folders.** Keep route paths and UI behavior unchanged.
- [ ] **Step 4: Rewire the app shell to local barrels.** Keep providers and route definitions under `src/app`; keep pages and feature composition under `src/features`.
- [ ] **Step 5: Run `bun run --filter salon-app typecheck && bun run --filter salon-app test && bun run --filter salon-app build`.
- [ ] **Step 6: Commit.** Run `git add apps/salon-app/src && git commit -m "refactor(salon): make local features own salon presentation"`.

## Task 4: Migrate Appointments

**Files:** Move appointment pages/components/hooks/state/validation from `packages/features/src/appointments` into `apps/salon-app/src/features/appointments`; add local integration tests; update salon routing.

- [ ] **Step 1: Write failing tests** for agenda rendering, filters, cancellation errors, query/cache behavior, and UTC instant serialization using test-support fakes.
- [ ] **Step 2: Run `bun run --filter salon-app test -- src/features/appointments`.** Expected: failure before local ownership exists.
- [ ] **Step 3: Move salon presentation and orchestration only.** Import shared rules/use cases from `@emme/business/appointments`; keep transport operations in `@emme/api` and schemas local.
- [ ] **Step 4: Run `bun run --filter salon-app typecheck && bun run --filter salon-app test -- src/features/appointments && bun run test:e2e:mock -- specs/flows/appointments.spec.ts`.
- [ ] **Step 5: When the provider is available, run the headed real appointment flow against `localhost:8080` and `localhost:8081`.
- [ ] **Step 6: Commit.** Run `git add apps/salon-app/src/features/appointments apps/salon-app/src/app/router.tsx && git commit -m "refactor(salon): move appointments workflow into salon app"`.

## Task 5: Migrate Clients and Services

**Files:** Move client/service pages/components/hooks/validation from `packages/features/src/{clients,services}` into `apps/salon-app/src/features/{clients,services}`; add focused integration tests; update routing.

- [ ] **Step 1: Write failing tests** for list loading, empty states, create/update validation, price rendering, cache invalidation, and repository errors with injected fakes.
- [ ] **Step 2: Run `bun run --filter salon-app test -- src/features/clients src/features/services`.** Expected: failure before migration.
- [ ] **Step 3: Move the implementation.** Import types/use cases from `@emme/business/clients` and `@emme/business/services`; keep salon form schemas and view models local.
- [ ] **Step 4: Run `bun run --filter salon-app typecheck && bun run --filter salon-app test -- src/features/clients src/features/services && bun run --filter salon-app build`.
- [ ] **Step 5: Commit.** Run `git add apps/salon-app/src/features/clients apps/salon-app/src/features/services apps/salon-app/src/app/router.tsx && git commit -m "refactor(salon): move client and service workflows locally"`.

## Task 6: Retire Migrated React Exports

**Files:** Modify `packages/features/src/index.ts`, package exports, compatibility tests, and app dependencies; delete only modules with no remaining client/admin consumer.

- [ ] **Step 1: Write a failing compatibility-boundary test** that rejects salon-only dashboard, settings, finances, onboarding, and navigation exports after their consumers move.
- [ ] **Step 2: Run `bun run --filter @emme/features test`.** Expected: failure while old exports remain.
- [ ] **Step 3: Remove migrated exports and dead source.** Preserve exports still required by `client-app` or `admin-app`.
- [ ] **Step 4: Run `bun run typecheck && bun run lint && bun run test && bun run build`.
- [ ] **Step 5: Commit.** Run `git add packages/features apps/client-app apps/admin-app package.json && git commit -m "refactor(features): remove migrated salon presentation exports"`.

## Task 7: Synchronize Documentation and Architecture Checks

**Files:** Modify the architecture handbook under `docs/architecture`, the root docs README, `scripts/validate-architecture.mjs`, and its tests.

- [ ] **Step 1: Add failing checks** for the `@emme/business` package, its import restrictions, salon feature ownership, and UI business-package restrictions.
- [ ] **Step 2: Run `bun run architecture:check && bun run docs:check`.** Expected: failures against obsolete diagrams/rules.
- [ ] **Step 3: Replace obsolete domain/application package diagrams with `@emme/business` and its internal layers; document `@emme/features` as temporary compatibility.**
- [ ] **Step 4: Run the two checks again and commit with `docs(architecture): document business package and salon ownership`.

## Task 8: Full Regression Verification

**Files:** Update `tasks/todo.md` with results; update `tasks/lessons.md` only if a new failure mode is discovered.

- [ ] **Step 1: Run `bun run quality` and resolve only migration-caused failures.**
- [ ] **Step 2: Run `bun run test:e2e:mock`.** Expected: all non-intentionally-skipped tests pass.
- [ ] **Step 3: Run the headed real-provider suite:** `E2E_MODE=real E2E_EXTERNAL_WEB=true E2E_HEADED=true E2E_BASE_URL=http://localhost:8080 E2E_API_URL=http://localhost:8081 E2E_TENANT_SLUG=e2e-studio bunx playwright test --project=real --headed --workers=1 --retries=0`.
- [ ] **Step 4: Run `git diff main...HEAD --stat && git status --short`; confirm no untracked files and no obsolete source imports.
- [ ] **Step 5: Commit verification notes and push `feat/api-version-contract`; verify `git log --oneline origin/feat/api-version-contract -1`.

## Definition of Done

- [ ] `@emme/business` is the only reusable business package, with enforced internal domain/application boundaries.
- [ ] Salon presentation is owned by `apps/salon-app/src/features`.
- [ ] `@emme/features` contains only remaining compatibility exports or is removed when unused.
- [ ] Existing unit, typecheck, lint, build, coverage, mock Playwright, and real-provider salon tests pass.
- [ ] Architecture documentation and validation match the implementation.
- [ ] All changes are committed and pushed.
