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
- [ ] Remove or retain remaining legacy E2E scaffolding only after the full
      suite is green and every candidate is confirmed unreachable.
- [ ] Audit the sibling `emme-service` repository for duplicate metadata,
      unused source candidates, and generated artifacts.

### Working notes

- Demo recordings intentionally use the deterministic `MockProvider`; they do
  not require Keycloak, a backend, or credentials.
- Videos and reports remain ignored locally and are uploaded only as short-lived
  GitHub Actions artifacts.
