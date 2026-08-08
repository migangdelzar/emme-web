# Web Architecture Completion

## Current architecture migration — 2026-08-07

### Goal

Apply the approved eight-library architecture to the Bun workspace while
preserving the current tenant app behavior and package-level compatibility.

### Execution checklist

- [x] Update architecture plan and package ownership docs.
- [x] Rename `@emme/contracts` to `@emme/api` and reorganize its public modules.
- [x] Rename `@emme/api-client` to `@emme/infrastructure` and keep transport behavior.
- [x] Update all workspace consumers and remove legacy package imports.
- [x] Add tested `@emme/core` foundation modules.
- [x] Add tested `@emme/domain` rules and models.
- [x] Add tested `@emme/application` use cases and ports.
- [x] Add `@emme/test-support` for shared test fixtures and factories.
- [x] Migrate the tenant app composition root.
- [x] Migrate clients, services, and appointments incrementally.
- [x] Run focused and full verification; document unrelated lint warnings.

### Working notes

- Current app: `apps/emme-salon-app` is the tenant-owner/staff application.
- Future apps: platform admin and client/customer shells are planned, but no
  product behavior is invented in this migration.
- Current tooling: Bun workspaces; pnpm/Turbo remains a separate decision.
- Test convention: colocated `*.test.ts(x)` by default; `__tests__` only for
  cross-module package integration tests.

## Validation Task 3 — salon feature schema migration

### Goal

Migrate only existing salon feature schemas to `@emme/validation`; retain the
no-schema state explicitly when the app has no feature schemas to migrate.

### Execution checklist

- [x] Inspect the Task 3 brief, validation package surface, and all app source
      schema/validation references.
- [x] Add a regression guard for the discovered no-feature-schema state.
- [x] Run the guard in RED/GREEN evidence mode and record the result.
- [x] Run required validation-package and salon-app verification.
- [x] Self-review, report, commit, and push the scoped result.

### Working notes

- The complete app-source scan found no `schemas/` directory or `*.schema.*`
  file, and no `zod`, `z.*`, `@hookform/resolvers`, `useForm`, or
  `@emme/validation` source reference.
- `ClientForm`, `AppointmentForm`, and `Login` are state/native-constraint
  forms, not Zod schemas. Their local validation messages and fields remain
  unchanged.
- Do not add `@emme/validation` to the salon app until an actual feature schema
  imports it; adding an unused package edge would violate the package boundary.

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

## Task 7 — @emme/i18n typed provider boundary

### Goal

Implement Task 1 from `.superpowers/sdd/task-7-brief.md`: expose a typed React
provider, locale context, and translation hook over the existing catalogs.

### Acceptance criteria

- [x] Typed lookup resolves the active locale, then the configured fallback.
- [x] A missing translation returns its key.
- [x] Provider configuration is observable through the hook.
- [x] Public contracts are exported and package tests/typecheck pass.

### Execution checklist

- [x] Read task brief, current catalogs, existing lookup API, architecture plan, and lessons.
- [x] Write focused failing boundary tests.
- [x] Implement the minimum provider/context/hook boundary.
- [x] Run focused and package verification; self-review the diff.
- [x] Write the Task 7 report, commit the scoped changes, and push the current branch.

### Working notes

- The package must not add an i18n runtime dependency. React is the required rendering primitive for this provider boundary.

## Task 3 — @emme/ui salon consumer migration

### Goal

Move every salon-app consumer of generic `src/shared/ui` primitives to the
`@emme/ui` public barrel, while retaining only `PhoneInput` and `sonner` as
app-owned UI.

### Execution checklist

- [x] Inspect Task 3 brief, migration plan, prior-task report, UI public barrel, and current consumers.
- [x] Add and run a failing import-boundary guard; record every consumer import.
- [x] Add the workspace package dependency and migrate generic UI imports without changing props, selectors, or behavior.
- [x] Run the import guard and focused app/package verification.
- [x] Delete only generic app-local UI duplicates after no consumer references remain.
- [x] Run the required final verification, self-review the diff, write the Task 3 report, and commit.

### Working notes

- The prior task deliberately established behavior-compatible public exports for all generic source files.
- `PhoneInput` has salon-specific Mexican LADA/10-digit formatting; `sonner` configures app toast behavior. Both remain local.
- `widgets/Navigation` and `shared/components/ErrorBanner` are app consumers of generic Button, so their import-only changes are required before the duplicate Button source can be removed.
- The final source audit retained only five `PhoneInput` consumer imports and the app-level `sonner` import.

## Unified CI regression and deployment selection — 2026-08-04

### Goal

Unify regression validation around separate parallel jobs, run mock and real
provider lanes without silently switching modes, archive only real full-stack
recordings, and allow manual selection of Compose, k3d, or protected k3s
deployment targets with Compose as the default.

### Acceptance criteria

- [ ] `test:real` explicitly selects the real provider mode.
- [ ] Playwright provider fixtures are isolated per test and safe for parallel
      workers.
- [ ] Mock CI diagnostics never archive video recordings.
- [x] The single frontend workflow exposes deployment and runtime choices with
      Compose as the default.
- [ ] Compose is executable as the default real regression target.
- [ ] k3d and k3s selection is explicit, validated, and protected by the
      appropriate deployment environment rules.
- [ ] Real recordings remain a dedicated serial evidence lane.
- [x] Workflow contracts, YAML, TypeScript, and focused tests pass.

### Execution checklist

- [ ] Add red contract coverage for mode selection, real-only recording, and
      deployment inputs.
- [x] Refactor provider fixture lifecycle to remove shared global state; every
      MockProvider now owns an isolated in-memory database.
- [x] Implement the unified frontend workflow and deployment target contract.
- [x] Update CI and E2E architecture documentation.
- [x] Run workflow contracts, YAML formatting, and focused workflow tests.
- [x] Add and run a focused mock-provider isolation contract test.
- [ ] Run the complete mock E2E, typecheck, lint, build, and docs matrix after
      the workflow consolidation.
- [ ] Run service-side backend E2E against a provisioned runtime when available.
- [x] Record external-environment limitations without weakening CI gates.

- The web `main` branch contains six previously approved local commits and is
  the base for this feature branch.
- The service repository ref remains
  `feat/enterprise-module-template-conformance` until both feature branches are
  ready to move to `main`.

## Results

Implementation and repository-wide verification complete for this web
transport-boundary checkpoint. Further UI module decomposition remains a
separate planned slice because the existing features are not yet represented by
stable public module barrels.

The workflow consolidation keeps one normal frontend/full-stack CI run per web
push, pull request, or manual dispatch. The reusable real-E2E workflow no longer
has its own trigger; scheduled security, manual dependency review, release image
builds, and post-deploy smoke checks remain separate operational gates.

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

## Clara-style ephemeral full-stack recordings — 2026-08-04

- [x] Define the cross-repository workflow contract with explicit web/service
      refs, artifact retention, and always-run cleanup.
- [x] Keep the initial refs on `feat/api-version-contract` and
      `feat/enterprise-module-template-conformance`; switch them to `main` only
      after both branches merge.
- [x] Start the service-owned PostgreSQL, Redis, Keycloak, and migration stack
      from the workflow contract.
- [x] Start the immutable service image through service-owned Compose and the
      selected web ref through Playwright's dev server.
- [x] Invoke the service-owned typed `:tools:e2e-provisioner` for the
      tenant-owner identity and tenant membership baseline.
- [ ] Run all real tenant-owner recording journeys with credentials from
      GitHub Actions secrets.
- [x] Upload recordings, Playwright reports, traces, screenshots, and service
      logs, then verify teardown removes volumes and orphan containers in the
      workflow contract.
- [x] Add a service-owned E2E fixture contract covering all applicable module
      entities and scenario coverage.
- [ ] Add repository-specific CodeRabbit guidance and reduce review noise from
      generated artifacts.

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

## Developer workflow and coverage gates — 2026-08-03

### Goal

Keep local hooks, Mise tasks, and GitHub Actions aligned without making every
commit run the slowest browser or full-stack suites.

### Decisions

- [x] Use Husky only for repository-local JavaScript/TypeScript staged-file
      formatting and linting.
- [x] Use a fast pre-push quality subset; CI remains authoritative for build,
      audit, mock E2E, and real full-stack recording.
- [x] Use Vitest V8 coverage for the web application; JaCoCo belongs to the
      Java service repository.
- [x] Keep `spotlessApply` and Prettier write commands explicit; validation
      hooks use `spotlessCheck`, Prettier check, and ESLint.
- [x] Expose the same intent through stable Mise task names.
- [x] Add dependency update and secret scanning automation without printing
      credentials or password values.

### Implementation and verification

- [x] Add Husky pre-commit and pre-push hooks.
- [x] Add a web coverage command with an honest ratchet threshold.
- [x] Normalize Mise aliases for install, format, quality, coverage, and E2E.
- [x] Improve CI job and step names while retaining required check semantics.
- [x] Add Dependabot and repository security metadata.
- [x] Run local formatting, typecheck, lint, unit, coverage, build, audit, and
      mock E2E checks.
- [ ] Push and verify the GitHub Actions workflow.

## Same-origin API proxy — 2026-08-05

### Goal

Route browser API, OAuth, health, and SSE traffic through the web origin in
Vite development and production Nginx to avoid frontend CORS requirements.

### Implementation

- [x] Browser API base points to the web origin in local and E2E Vite runs.
- [x] Vite proxies API, OAuth, and health paths to the backend.
- [x] Production Nginx proxies API, OAuth, and health paths.
- [x] Nginx preserves SPA fallback only for non-API paths.
- [x] SSE uses a same-origin URL and Nginx supports streaming.
- [ ] Tests, typecheck, lint, build, and config validation pass.

### Results

- Same-origin API URL and dashboard SSE tests pass.
- App unit tests (31), API-client tests (12), app build, app lint, and rendered
  Nginx syntax validation pass.
- Full Docker build was attempted but stopped on an external npm registry
  integrity failure for `whatwg-mimetype@3.0.0`.
- Repository typecheck remains blocked by existing E2E fixture type errors and
  an existing `platformClient` import path mismatch.
- Docker Compose validation was unavailable because the local Docker CLI has no
  Compose plugin.

## Emme salon app architecture migration — 2026-08-07

### Goal

Apply the feature-oriented application architecture incrementally while
preserving current routes, API contracts, visual behavior, and browser flows.

### Acceptance criteria

- [x] App providers, routing, layouts, and error boundaries have explicit app
      shell ownership.
- [x] Clients, services, and appointments own their query hooks, API adapters,
      application services, types, and focused UI boundaries.
- [x] TanStack Query remains the only remote-data source of truth.
- [x] `AppContext`, duplicate API hook paths, and `DataProvider` are removed
      only after all consumers are migrated.
- [x] Existing mock E2E flows, tests, typecheck, lint, and build remain green.

### Working notes

- Current branch is `feat/api-version-contract`, clean and synchronized with
      its remote. The current branch already contains the typed transport and
      partial feature migration that this plan builds on.
- The first implementation slice is intentionally app shell plus clients;
      no mass folder creation or backend domain duplication is planned.
- Full details and dependency ordering are in [`tasks/plan.md`](plan.md).
- `@emme/contracts` already owns capability factories and response mapping;
      feature API modules must delegate to those factories instead of creating
      duplicate DTOs or endpoint clients. `@emme/api-client` remains transport
      only.
- Implementation is complete for the current tenant-owner/staff application.
  Future platform-admin and client/customer shells remain intentionally
  unimplemented until their product requirements exist.

### Checklist

- [x] Confirm delivery branch and first vertical slice.
- [x] Complete Phase 1 app-shell foundation.
- [x] Complete Phase 2 clients vertical slice.
- [x] Complete Phase 3 services and appointments slices.
- [ ] Complete Phase 4 infrastructure and client-state cleanup.
- [ ] Run final verification matrix and record results.
