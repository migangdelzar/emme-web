# Salon-first consolidation checklist

## Approved identity architecture implementation — 2026-08-10

- [x] Map current Keycloak, customer authentication, provisioning, frontend OIDC, and tests.
- [x] Add failing tests for the shared `emme-customers` social-login contract.
- [x] Implement tenant `admin` and `owner` seed users with explicit full-salon access (`tenant_owner`).
- [x] Configure the shared customer realm/client and tenant-local customer association boundary.
- [x] Update frontend client authentication configuration and E2E/provider contracts.
- [x] Update architecture documentation and naming diagrams.
- [x] Run focused backend/frontend tests, full suites, builds, and real-provider verification.
- [x] Commit and push all intended changes while preserving unrelated worktree changes.

### Working notes

- Backend branch: `feat/enterprise-module-template-conformance`.
- Frontend branch: `feat/api-version-contract`.
- Preserve the pre-existing backend modification to `AppointmentController.java`.
- Approved realm model: `emme-core` for `admin`, per-tenant realms for salon staff,
  and shared `emme-customers` for social-login customers.
- Customer identity is global in Keycloak; customer business rows remain tenant-scoped.

- [x] Confirm three independent deployable app shells remain.
- [x] Consolidate reusable framework-free business logic into `@emme/business`.
- [x] Move current product features into `apps/salon-app/src/features`.
- [x] Add shared `@emme/auth` gate with app-local login pages.
- [x] Localize client placeholders and remove `@emme/features`.
- [x] Keep admin and client product routes deferred; their shells expose auth
      only until those products are intentionally started.
- [x] Update architecture handbook, root documentation, and boundary checks.
- [x] Run the complete quality, build, coverage, and Playwright verification.
- [x] Verify the latest salon app with the real backend/provider deployment.
- [x] Build/validate the three independent frontend artifacts and compose setup.
- [x] Commit and push all remaining changes.

## Acceptance criteria

- `admin-app`, `salon-app`, and `client-app` remain separate deployable roots.
- All current product features are owned by `apps/salon-app/src/features`.
- All three apps can render the shared `@emme/auth` gate with distinct local
  login pages.
- `@emme/business` contains reusable rules/use cases and has no React/browser
  dependencies.
- No source or manifest imports `@emme/features`, `@emme/domain`, or
  `@emme/application`.
- Architecture docs, package trees, and validators describe the same structure.

## Working notes

- Branch: `feat/api-version-contract`.
- Package manager: Bun workspace; `bun.lock` is authoritative.
- Auth/session state remains in `@emme/core`; concrete storage/provider adapters
  remain in `@emme/infrastructure`.
- `@emme/auth` only gates auth states; app login UI is local and backend
  authorization remains authoritative.
- Real E2E requires the provisioner-generated per-salon auth storage state and a
  running `emme-service` backend.

## Results

- Fresh local Compose state was reprovisioned with real Keycloak, Postgres, Redis,
  and the backend image containing the tenant realm session configuration.
- The provisioner created separate `admin` and `owner` credentials for both
  `e2e-studio` and `e2e-salon`; the generated JSON artifacts are mode `0600`.
- `mise run test:e2e:real:local` passed all 40 Playwright tests in one worker
  against salon HMR, the local backend, and real Keycloak using the tenant owner.
- Tenant-owner authorization now covers salon workflows while appointment
  endpoints reject customer-role tokens; focused salon and tenancy tests pass.
- Backend focused identity/provisioner tests pass; frontend typecheck, client
  tests/build, E2E unit tests, architecture validation, and Markdown validation pass.

- `@emme/auth` typecheck and four AuthGate tests pass.
- Earlier verification passed: workspace typecheck, production builds for all
  three apps, architecture/docs checks, salon coverage (79.05% statements),
  and mocked Playwright (36 passed, 3 skipped).
- Dockerfile boundary tests and Compose configuration validate. The final clean
  run also rebuilt and started the local backend/Keycloak stack successfully.
- Admin, client, and salon app typechecks pass.
- Client ownership test passed after localizing its two placeholder components.
- Architecture validator passes after adding the retired-feature and business
  package boundaries.
