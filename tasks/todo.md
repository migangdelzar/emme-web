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
