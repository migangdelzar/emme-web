# Salon-first consolidation checklist

- [x] Confirm three independent deployable app shells remain.
- [x] Consolidate reusable framework-free business logic into `@emme/business`.
- [x] Move current product features into `apps/salon-app/src/features`.
- [x] Add shared `@emme/auth` gate with app-local login pages.
- [x] Localize client placeholders and remove `@emme/features`.
- [x] Keep admin and client product routes deferred; their shells expose auth
      only until those products are intentionally started.
- [x] Update architecture handbook, root documentation, and boundary checks.
- [ ] Run the complete quality, build, coverage, and Playwright verification.
- [ ] Verify the latest salon app with the real backend/provider deployment.
- [ ] Build/validate the three independent frontend artifacts and compose setup.
- [ ] Commit and push all remaining changes.

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

- `@emme/auth` typecheck and four AuthGate tests pass.
- Final verification passed: workspace typecheck, full unit/integration tests,
  production builds for all three apps, architecture/docs checks, salon
  coverage (79.05% statements), and mocked Playwright (36 passed, 3 skipped).
- Dockerfile boundary tests pass and Compose configuration validates. Image
  startup was attempted, but the installed legacy Docker daemon stalled during
  the large build context; no backend/Keycloak containers are running for real
  provider E2E.
- Admin, client, and salon app typechecks pass.
- Client ownership test passed after localizing its two placeholder components.
- Architecture validator passes after adding the retired-feature and business
  package boundaries.
