# Web Architecture Completion

## Goal

Apply the approved frontend architecture and integration guardrails without
duplicating the backend's DDD/Hexagonal implementation. The web repository
must expose a typed, dependency-directed REST boundary, feature-oriented UI
modules, validated i18n resources, and reproducible quality gates.

## Acceptance criteria

- [x] `@emme/contracts` has no dependency on `@emme/api-client`.
- [x] Transport normalization does not use `any` in the shared contract layer
      or the application REST adapters.
- [x] The application uses one shared HTTP adapter for auth, tenant context,
      problem details, and empty responses.
- [x] Unit tests cover the new HTTP adapter and transport mapping boundaries.
- [x] Architecture documentation states the ownership and dependency rules.
- [x] Documentation, typecheck, lint, tests, build, and security checks pass.
- [x] Typed locale resources, i18n usage enforcement, Prettier, and mock
      accessibility/browser-flow gates pass.
- [x] Every change is committed and pushed on the feature branch.

## Working notes

- The web `main` branch contains six previously approved local commits and is
  the base for this feature branch.
- The service repository remains on `feat/studio-module-migration`; its Studio
  migration is intentionally incomplete and will be continued after the web
  boundary checkpoint.

## Results

Implementation and repository-wide verification complete for this web
transport-boundary checkpoint. Further UI module decomposition remains a
separate planned slice because the existing features are not yet represented by
stable public module barrels.

## Demo recordings and cleanup checkpoint

- [x] Audit Playwright recording and artifact behavior against the Clara
      full-stack challenge.
- [x] Add deterministic mock-mode demo flows and a manual GitHub Actions
      recording workflow with retained video/report artifacts.
- [x] Prevent mock smoke tests from requiring a running backend.
- [x] Fix E2E TypeScript errors in page objects and real-provider seed fixtures.
- [x] Update stale E2E assertions to the current app UI contract.
- [x] Remove unreachable/incomplete legacy E2E helpers, duplicate flow classes,
      and an unreferenced onboarding debug image.
- [x] Remove or retain remaining legacy E2E scaffolding only after the full
      suite is green and every candidate is confirmed unreachable.
- [ ] Audit the sibling `emme-service` repository for duplicate metadata,
      unused source candidates, and generated artifacts.

## Tenant-owner real E2E checkpoint — 2026-08-03

- [x] Define separate mock and real provider contracts.
- [x] Add deterministic real seed data and dependency-aware cleanup.
- [x] Add mock service/customer lifecycle journeys using shared page objects.
- [x] Add real tenant-owner lifecycle and recording journey specifications.
- [x] Add a manual real full-stack recording workflow with exact web/service
      refs, explicit service URL, credential secrets, and artifact retention.
- [ ] Provision a deterministic Keycloak/service environment and run the real
      workflow; this is an environment prerequisite, not a hidden mock fallback.
- [x] Add shell/accessibility/transport guards and run the complete local
      quality matrix.
- [ ] Run the real recording lane after a provisioned Keycloak/service
      environment is supplied; the workflow deliberately fails closed without
      those external prerequisites.

## i18n and legacy cleanup checkpoint — 2026-08-03

- [x] Consolidate locale ownership under `packages/i18n`.
- [x] Remove unused duplicated app-local locale JSON.
- [x] Add typed `useAppTranslation` boundary and locale parity validation.
- [x] Reject direct feature imports of `react-i18next` and `namespace:key`
      translation syntax.
- [x] Migrate application shell, authentication, tenant selection, dashboard,
      appointments, clients, services, settings, finances, onboarding, and
      Google Workspace hooks to the shared boundary.
- [x] Document the i18n architecture and CI contract with Mermaid diagrams.

## CI and dependency security checkpoint — 2026-08-03

- [x] Add i18n, formatting, typecheck, lint, unit, build, mock E2E, and audit
      gates to frontend CI.
- [x] Upgrade audited transitive dependencies for `fast-uri`, `ip-address`,
      and `undici`; `bun audit --audit-level=high` is clean.
- [x] Run the complete `bun run quality` pipeline successfully.
- [x] Run the complete mock browser suite: 70 discovered, 44 executed and
      passing, with 26 explicitly real-only skips.
- [ ] Reduce the existing non-blocking ESLint warning baseline; warnings do not
      currently fail CI, but each should become an owned cleanup slice.

### Working notes

- Demo recordings intentionally use the deterministic `MockProvider`; they do
  not require Keycloak, a backend, or credentials.
- Videos and reports remain ignored locally and are uploaded only as short-lived
  GitHub Actions artifacts.

## API version contract normalization

### Goal

Remove path-based API versioning from the web application and standardize every
frontend request on the version-neutral `/api` path plus the `API-Version: 1.0`
request header. No `/api/v1` compatibility alias is retained.

### Acceptance criteria

- [x] `@emme/contracts` exposes one canonical `API_VERSION` constant.
- [x] Route constants and application request paths use `/api`, never `/api/v1`.
- [x] The shared API client sends `API-Version: 1.0` by default.
- [x] Direct authentication requests send the same version header.
- [x] Mock E2E providers use the canonical version-neutral paths.
- [x] Playwright starts the app with deterministic runtime configuration.
- [x] Unit tests, typecheck, lint, build, and documentation checks pass.
- [x] Mock E2E suite passes with the final runtime configuration.
- [x] Changes are committed and pushed on the feature branch.

### Verification commands

```text
bun run test
bun run typecheck
bun run lint
bun run build
bun run docs:check
bun run --filter @emme/e2e test
rg -n '/api/v1' --glob '!node_modules/**' --glob '!dist/**' --glob '!test-results/**' .
```

## Typed data and client-state architecture

### Goal

Reduce repeated frontend query/mutation wiring with typed generic factories,
keep remote data in TanStack Query, and move cross-feature client/UI state to a
small Zustand store. Component-local transient state remains local React state.

### Decisions

- [x] Use a generic `createQueryResource` template for query keys, list
      queries, mutations, invalidation, and response mapping.
- [x] Preserve feature-specific input/output types and endpoint mapping at the
      feature boundary; generics must not erase domain meaning.
- [x] Use Zustand for shared client state and reducer-style action methods.
- [x] Do not add Redux: this application has no requirement for Redux middleware,
      time-travel debugging, or a large cross-team event bus.
- [x] Do not move server data into Zustand; TanStack Query remains the source of
      truth for remote data, caching, retries, and invalidation.

### Acceptance criteria

- [x] Generic query/mutation infrastructure has unit tests for keys, mapping,
      invalidation, and error propagation.
- [x] Customers, services, and appointments use the generic infrastructure.
- [x] Shared UI state has a typed Zustand store with reducer-like actions.
- [x] Existing feature behavior and E2E flows remain unchanged.
- [x] No new `any` is introduced in the refactored path.
- [x] Typecheck, unit tests, lint, build, docs, and mock E2E pass.
- [x] Changes are committed and pushed on `feat/api-version-contract`.

## FSD feature and capability API boundaries

### Goal

Keep shared HTTP behavior in `@emme/api-client`, capability adapters in
`@emme/contracts`, and UI behavior in FSD feature hooks and components.

### Decisions

- [x] Keep `HttpClient` as the shared transport port.
- [x] Use capability factories such as `createAppointmentApi` and
      `createServiceApi` for endpoint ownership.
- [x] Do not add a duplicate `domainClient` or scoped client layer when the
      capability adapter already exists.
- [x] Keep provider naming for replaceable external adapters, not browser API
      wrappers.
- [x] Keep endpoint contracts in `@emme/contracts` and feature-specific view
      mapping in FSD feature hooks/adapters.

### Acceptance criteria

- [x] Appointments, customers, and services have canonical capability adapters.
- [x] Migrate appointments, customers, and services feature hooks from raw
      paths to those adapters.
- [x] Shared auth, tenant, API-version, parsing, and error behavior remains in
      the transport client.
- [x] No salon-specific endpoint methods are added to `@emme/api-client`.
- [x] FSD/API dependency direction is documented.
- [x] Full verification and push are complete.
