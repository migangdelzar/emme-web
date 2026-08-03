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
