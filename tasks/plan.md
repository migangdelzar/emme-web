# Implementation Plan: Emme Salon App Architecture Migration

## Overview

The salon app already has several recommended foundations: feature folders,
typed contracts, a shared REST client, TanStack Query, a small Zustand UI store,
and a documented dependency direction. The remaining work is to make ownership
explicit and remove duplicate orchestration, starting with the app shell and
one vertical feature slice before migrating the rest of the application.

This plan preserves the current HashRouter URLs and backend contracts. It does
not copy backend domain rules into the browser or introduce a second server
state store.

## Current-state audit

| Area | Current state | Target state | Priority |
|---|---|---|---|
| App shell | `app/App.tsx` owns providers, auth branching, layout, and routes | `app/AppProviders.tsx`, `app/router.tsx`, and `app/layouts/*` own composition separately | High |
| Routing | Inline `<Routes>` inside `AppContent` | One route definition module with route-level lazy loading and an app-shell layout | High |
| Error handling | `shared/components/ErrorBoundary.tsx` | `app/error-boundary/*` for shell/route failure boundaries; shared error UI stays reusable | Medium |
| Server state | Duplicate `AppContext`, `hooks/useApiQueries`, `providers/DataProvider`, and `api/hooks/*` paths | TanStack Query plus feature-owned query/mutation hooks | High |
| Feature boundaries | Feature components exist, but import `context` and global `api/hooks` directly | Feature `domain`, `api`, `services`, `hooks`, `pages`, and public `index.ts` boundaries | High |
| Domain/view types | Contracts and view types are re-exported from `context/AppContext.tsx` | Feature-owned domain/view types and explicit API-to-view mappers | High |
| Infrastructure | REST/auth/browser storage adapters are split across `api`, `app/auth`, and `services` | Explicit `infrastructure/http`, `infrastructure/auth`, and `infrastructure/storage` adapters | Medium |
| Shared code | `shared/ui` is reusable; `widgets/Navigation` is app-shell code | Shared UI remains shared; navigation moves under app layouts | Low |
| Tests | Boundary and mapper tests exist; large screens have limited focused coverage | Add tests at domain/service/hook/page boundaries while preserving E2E coverage | High |

The largest risk is `context/AppContext.tsx`: it currently combines domain
types, default profile data, server queries, mutation orchestration, cache
writes, and a context API. Removing it safely requires feature hooks to expose
the same observable behavior before the context is deleted.

## Workspace package boundary review

The extracted packages are already the correct lower-level dependency boundary:

| Package | Current responsibility | Migration rule |
|---|---|---|
| `@emme/api-client` | Generic `HttpClient`, auth/tenant/API-version headers, URL resolution, response parsing, and `ApiHttpError` | Keep transport-only; feature code must not instantiate `fetch` or Axios directly |
| `@emme/contracts` | Shared application contracts, route constants, response normalization, and capability factories such as `createClientApi`, `createServiceApi`, and `createAppointmentApi` | Treat as the canonical backend boundary; do not duplicate its DTOs or endpoint paths inside the app |
| `@emme/contracts` `HttpClient` | Narrow structural port consumed by capability factories | Inject the app's `@emme/api-client` `HttpClient`; no adapter wrapper is needed because the interfaces are structurally compatible |
| `DataProvider` contract | E2E/test provider surface implemented by `MockProvider` and `RealProvider` | Keep for browser-test seams, but stop using it as the production application's server-state abstraction |

This means the target request flow is:

```text
Feature hook
    ↓
Feature service (only when orchestration/domain normalization exists)
    ↓
Capability factory from @emme/contracts
    ↓
HttpClient from @emme/api-client
    ↓
Backend API
```

The current app has a second, transitional path in `src/providers/DataProvider`
and `src/hooks/useApiQueries`. Those modules call the same contract factories,
but hide them behind a global provider and duplicate TanStack Query wiring. They
should be retired after feature hooks take ownership. The E2E `DataProvider`
interface itself should remain until the browser provider fixtures no longer
need the direct assertion methods.

The packages currently export source entry points (`src/index.ts`) rather than
consuming built declarations. That is valid for this Bun workspace and keeps
local typechecking immediate, but package build output must remain a release
artifact concern; feature migration should not import from `dist/`.

## Architecture decisions

- Keep TanStack Query as the only source of truth for remote clients, services,
  appointments, and tenant data. TanStack Query keys provide caching,
  refetching, and shared query results; a second global copy would reintroduce
  stale-state bugs. See the [TanStack Query query model](https://tanstack.com/query/latest/docs/framework/react/guides/queries).
- Keep `@emme/contracts` as the typed backend capability boundary and keep
  `@emme/api-client` transport-only. Feature adapters may map contract DTOs to
  feature view models, but must not import backend internals.
- Create the React Router route tree once in `app/router.tsx` and provide it
  through the app shell. React Router documents route objects as the basis for
  lazy routes and route-level error boundaries; this aligns with the requested
  `router.tsx` and `error-boundary/` structure.
- Preserve `HashRouter` in the first slice because the app is deployed as a
  static SPA and existing E2E URLs use hash navigation. Switching to browser
  history is a separate deployment decision.
- Use plain functions and hooks for feature behavior. Classes are not needed
  unless a concrete error, SDK client, or stateful domain entity requires one.
- Do not create empty placeholder folders. Add `domain`, `schemas`,
  `permissions`, `store`, and `mappers` only when the feature has behavior that
  earns the boundary.

## Task list

### Phase 1: App-shell foundation

- [ ] Add `src/app/AppProviders.tsx` for QueryClient, auth, app/profile, theme,
      tooltip, notifications, and error-boundary composition.
- [ ] Add `src/app/router.tsx` with the existing paths, lazy route modules, and
      the signed-out/tenant-required/ready branches represented by shell
      components.
- [ ] Add `src/app/layouts/AppLayout.tsx` for sidebar, mobile navigation, page
      transition, and the shared content frame.
- [ ] Move route-level fallback/error UI to `src/app/error-boundary/` while
      retaining reusable presentation in `src/shared/components`.
- [ ] Keep `main.tsx` as a thin bootstrap that renders `App` through the
      provider composition root.

**Acceptance criteria:** Existing hash URLs render the same feature screens;
auth loading, signed-out, tenant-selection, and authenticated states remain
observable; the application has one router and one provider composition root.

**Verification:** App shell tests, `bun run --filter @emme/emme-salon-app
typecheck`, focused Vitest tests, and the mock smoke E2E flow.

### Phase 2: Clients vertical slice

- [ ] Add `features/clients/domain/client.types.ts` for application-facing
      client types and mutation inputs.
- [ ] Move client query/mutation adapters to `features/clients/api/`, keeping
      the existing `createClientApi` capability from `@emme/contracts` and
      `HttpClient` from `@emme/api-client` behind that boundary.
- [ ] Add `features/clients/mappers/client.mapper.ts` only when the feature
      view model differs from the canonical `Client` contract; do not duplicate
      the contract's response parser.
- [ ] Add `features/clients/services/client.service.ts` for normalization and
      operation orchestration that is currently inside the screen/context.
- [ ] Split `Clients.tsx` into `pages/ClientsPage.tsx` plus focused components
      incrementally; keep the existing visual behavior and test IDs.
- [ ] Export the feature's public hooks/components/types from
      `features/clients/index.ts`.
- [ ] Replace client reads/writes from `AppContext` with the feature hooks and
      add focused service/hook/component tests before deleting the old path.

**Acceptance criteria:** Client list, search/filtering, create, edit, delete,
and appointment-history behavior remain unchanged; no client screen imports
`context/AppContext`, `src/hooks/useApiQueries`, or `src/api/hooks/useCustomers`.

**Verification:** Domain/service tests with injected fakes, component tests for
loading/empty/error/submission states, existing mock E2E client flow, typecheck,
lint, and build.

### Phase 3: Services and appointments vertical slices

- [ ] Apply the clients boundary pattern to services.
- [ ] Apply the pattern to appointments, including status mutations, scheduling
      calculations, and calendar export helpers.
- [ ] Move shared appointment/service types out of `AppContext` and keep the
      scheduling algorithm independently testable.
- [ ] Replace cross-feature imports with public feature barrels or explicit
      shared contracts where the dependency is genuinely shared.
- [ ] Delete the legacy `src/api/hooks`, `src/hooks/useApiQueries`, and
      `src/providers/DataProvider` paths only after consumers are migrated.

**Acceptance criteria:** TanStack Query remains the only remote-data store;
feature hooks own query keys and mutations; scheduling and CRUD flows remain
green in unit and browser tests.

### Phase 4: Infrastructure and client-state cleanup

- [ ] Move runtime environment parsing to `src/config/environment.ts` and
      application defaults to `src/config/app-config.ts` without changing the
      public environment variable contract.
- [ ] Add explicit `src/infrastructure/http`, `auth`, and `storage` modules by
      moving existing adapters, not by wrapping the same `@emme/api-client`
      transport twice.
- [ ] Keep only client UI state in `src/state`/the existing Zustand store; move
      onboarding/sidebar ownership behind a public state module.
- [ ] Move navigation from `src/widgets` into app layout ownership.

**Acceptance criteria:** Feature code depends inward on stable public modules;
browser APIs and network calls are visible at infrastructure boundaries; no
remote business data is persisted in Zustand or local storage.

### Phase 5: Verification and cleanup

- [ ] Add/maintain route, provider, mapper, service, hook, and component tests.
- [ ] Run `bun run docs:check`, `bun run typecheck`, `bun run lint`, `bun run
      test`, `bun run build`, and the mock E2E suite.
- [ ] Run the app at 320px, 768px, 1024px, and 1440px for changed shell/feature
      surfaces and verify keyboard/focus/error/empty/loading states.
- [ ] Remove compatibility exports and dead files only after import scans and
      browser verification show no consumers.
- [ ] Update architecture documentation with the final module ownership and
      add an ADR if routing, auth storage, or deployment history changes.

## Dependency graph

```text
AppProviders + router
        ↓
AppLayout + route pages
        ↓
Feature hooks
        ↓
Feature services / domain rules
        ↓
Feature API adapters
        ↓
@emme/contracts + @emme/api-client
```

The migration is sequential across shared boundaries but vertical within a
feature. Clients should be the first feature because it has an existing mapper,
CRUD hooks, and a clear screen boundary. Services and appointments depend on
shared view types and cross-feature scheduling data, so they follow after the
client pattern is proven.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Removing `AppContext` too early | High; large screens stop rendering | Migrate one feature at a time and retain a temporary compatibility export |
| Query-key drift during API moves | High; stale or missing updates | Reuse `createResourceKey`/query factory and add invalidation tests |
| Route changes break static hosting or E2E | High | Preserve `HashRouter` and existing paths in Phase 1 |
| Screens are too large to migrate atomically | Medium | Extract page/container and focused components in vertical slices |
| Frontend duplicates backend business rules | Medium | Keep only presentation validation and UX guards; backend remains authoritative |
| Hidden browser side effects in feature code | Medium | Move fetch, storage, and EventSource creation behind infrastructure/adapters |

## Open questions

- Should the migration proceed on a new `feat/salon-app-architecture` branch,
  or should the current `feat/api-version-contract` branch remain the delivery
  branch for this follow-up?
- Should `HashRouter` remain the long-term deployment choice, or is a server
  fallback configuration available for a future browser-history migration?
- Which feature should receive the first implementation slice if clients are
  not the preferred starting point?

## Definition of done

- [ ] Every migrated feature has explicit ownership and a public barrel.
- [ ] No feature component performs raw HTTP, storage, or EventSource work.
- [ ] No feature imports the legacy context or global API hook paths after the
      relevant migration phase.
- [ ] All existing behavior and test IDs remain compatible unless explicitly
      approved.
- [ ] Typecheck, lint, unit tests, build, docs, and applicable browser tests
      pass with zero skipped tests introduced by the migration.
