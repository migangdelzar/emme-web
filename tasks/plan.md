# Implementation Plan: Emme Monorepo Architecture Migration

## Goal

Move the current tenant application and reusable packages toward a modular
monorepo with three application shells and seven cohesive libraries. The
migration is compatibility-first: existing routes, API paths, query behavior,
E2E provider seams, and package tooling remain stable while ownership moves.

## Target workspace

```text
emme-web/
├── apps/
│   ├── platform-admin-app/       # future application shell
│   ├── emme-salon-app/            # current tenant-owner/staff app
│   └── client-app/                # future customer application
├── packages/
│   ├── ui/                        # reusable visual components
│   ├── core/                      # auth, tenancy, access-control, runtime
│   ├── api/                       # contracts, ports, typed API operations
│   ├── infrastructure/           # fetch, storage, auth and external adapters
│   ├── business/                  # reusable domain and business capabilities
│   ├── i18n/                      # typed shared localization resources
│   └── test-support/              # development/test-only fixtures and helpers
├── e2e/
└── docs/architecture/
```

The repository currently uses Bun workspaces. A future pnpm/Turbo migration is
explicitly out of scope for this architecture migration.

## Dependency direction

```text
@emme/ui       @emme/i18n
      ↑              ↑
@emme/core ─────── @emme/api
      ↑              ↑
@emme/business ─ @emme/infrastructure
            ↑
          apps
```

- `@emme/api` is framework-agnostic and owns DTOs, domain-facing contracts,
  endpoint adapters, route constants, response parsers, and HTTP ports.
- `@emme/infrastructure` implements concrete HTTP, auth-token, storage,
  analytics, feature-flag, and browser integrations. It may depend on `api`,
  but `api` never depends on infrastructure.
- `@emme/core` owns shared application behavior and providers, not concrete
  browser implementations.
- `@emme/business` owns reusable domain rules and business capabilities. It
  does not become a dumping ground for tenant-only screens.
- Apps own routes, layouts, composition roots, and role-specific experiences.
- `@emme/test-support` is dev-only and never a runtime dependency.

## Conventions

- Capability folders are plural: `clients/`, `services/`, `appointments/`.
- Public capability adapters are named `api.ts`; never `client-api.ts`.
- Domain contracts use singular names: `client.types.ts`.
- Tests are colocated beside their module by default (`*.test.ts(x)`).
- `__tests__/` is reserved for cross-module package integration tests.
- Public consumers import package root barrels; internal paths are private.
- TanStack Query owns server state. Zustand owns client-only UI state.
- Backend authorization and business invariants remain authoritative.

## Phases

### Phase 0 — Package boundary migration

- [ ] Rename `@emme/api-client` to `@emme/infrastructure`.
- [ ] Rename and reorganize `@emme/contracts` as `@emme/api`.
- [ ] Preserve public behavior and tests while moving files into capability,
      port, integration, and testing folders.
- [ ] Update app, E2E, package scripts, and TypeScript references to the new
      package names.
- [ ] Add compatibility notes to architecture documentation.

Acceptance: package tests, workspace typecheck, app tests, and E2E TypeScript
compile without imports from the old package names.

### Phase 1 — Shared library foundations

- [ ] Add `@emme/core` with auth, tenancy, access-control, runtime, config,
      errors, and common types as independently testable modules.
- [ ] Add `@emme/business` with the first reusable capability modules for
      clients, services, and appointments; keep UI extraction minimal and
      behavior-preserving.
- [ ] Add `@emme/test-support` for shared fakes/factories only when a second
      consumer needs them.
- [ ] Keep `@emme/ui`, `@emme/i18n`, and `@emme/validation` stable; schemas that
      are feature-only remain with their feature.

Acceptance: each new package has a public root barrel, strict typechecking,
focused tests for exported behavior, and no circular workspace dependency.

### Phase 2 — Tenant app composition root

- [ ] Add `src/app/AppProviders.tsx`.
- [ ] Add `src/app/router.tsx` and preserve HashRouter paths.
- [ ] Add `src/app/layouts/AppLayout.tsx` and app-owned error boundaries.
- [ ] Make `main.tsx` a thin bootstrap.
- [ ] Keep signed-out, tenant-required, and ready states behaviorally equal.

Acceptance: existing auth and navigation E2E flows remain green and there is
one provider composition root and one route tree.

### Phase 3 — Tenant feature vertical slices

- [ ] Migrate clients into explicit `domain`, `api`, `services`, `hooks`,
      `pages`, `components`, and public-barrel ownership.
- [ ] Migrate services using the same tested boundary.
- [ ] Migrate appointments and scheduling helpers, preserving status behavior.
- [ ] Migrate remaining tenant-only features only where a boundary earns its
      complexity; do not create empty enterprise folders.
- [ ] Remove `AppContext`, global API hooks, and transitional provider paths
      only after import scans and focused tests prove they are unused.

Acceptance: no migrated feature performs raw HTTP or imports legacy context/API
hooks; TanStack Query remains the only remote-data source of truth.

### Phase 4 — Verification and future app readiness

- [ ] Add route/provider/feature boundary tests and preserve E2E coverage.
- [ ] Add minimal application shells for `platform-admin-app` and `client-app`
      only when their requirements exist; do not invent product behavior.
- [ ] Run docs, format, typecheck, lint, unit, build, security, and mock E2E
      gates.
- [ ] Update architecture docs and add an ADR for package ownership.

## Execution checkpoints

After each phase: run focused tests, typecheck affected packages, inspect the
dependency graph, commit one logical increment, and push the branch. No phase
may leave the workspace uncompilable.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Package rename breaks hidden consumers | High | Update all workspace references and use repository-wide import scans |
| API/infrastructure circular dependency | High | Keep ports in `@emme/api`; infrastructure implements them |
| AppContext removal changes observable behavior | High | Migrate one vertical slice and retain compatibility until consumers are gone |
| Library extraction duplicates domain models | Medium | Map at explicit boundaries and keep backend contracts canonical |
| Tooling migration expands scope | Medium | Keep Bun; defer pnpm/Turbo |
| Empty abstraction folders accumulate | Low | Add folders only with behavior and tests |

## Definition of done

- [ ] Target package boundaries are present and documented.
- [ ] Old `@emme/contracts` and `@emme/api-client` imports are removed.
- [ ] Current tenant routes and E2E flows remain compatible.
- [ ] Every migrated behavior has tests written before implementation changes.
- [ ] Workspace verification passes or pre-existing failures are documented.
- [ ] All changes are committed and pushed on the feature branch.
