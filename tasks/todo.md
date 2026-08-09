# Package-First Migration Checklist

- [ ] Restate goal and acceptance criteria
- [x] Locate existing implementation and package patterns
- [x] Design package ownership and dependency direction
- [x] Migrate shared utilities and platform adapters
- [x] Migrate reusable feature modules
- [x] Reduce the salon app to composition and tenant-specific code
- [x] Add or update package boundary tests
- [x] Run typecheck, unit tests, lint, build, and mock E2E
- [ ] Build and serve the latest `salon-app` production image
- [ ] Run real E2E against the deployed salon image using provisioner-generated storage state
- [ ] Build all three independent frontend images
- [ ] Validate Kubernetes manifests and deployment topology
- [x] Summarize changes and verification evidence

## Acceptance criteria

- Reusable feature code is owned by packages, not `apps/salon-app/src/features`.
- The salon app contains only composition, configuration, theme, branding, and genuinely tenant-specific code.
- No package imports from `apps/salon-app` or the `@/` alias.
- Public package APIs are exported through package barrels.
- Existing behavior remains covered by tests and builds successfully.

## Results

- Reusable feature code, shared UI adapters, locale behavior, session logic, and cache storage now live in workspace packages.
- `apps/salon-app/src` contains the salon app shell: providers, routes, layout, runtime config, theme entrypoint, branding, and app-specific error presentation.
- Tailwind package source scanning is explicit through `@source` declarations in `src/theme/globals.css`.
- Package and application boundary tests were moved with their owning modules and updated for the new roots.
- Verification passed: typecheck, unit tests, documentation validation, i18n validation, formatting, security audit, lint (warnings only), production build, and mock E2E (36 passed, 3 intentionally skipped).
- Real E2E authenticated successfully against the local backend and Keycloak stack; final verification must use the deployed `salon-app` image.

## Known follow-up

- `@emme/features` currently imports the concrete client repository adapter from `@emme/infrastructure` for its client query composition. This keeps the reusable feature self-contained for the current migration; a later strict hexagonal refinement can inject that adapter from each app composition root.

## Working notes

- Current branch: `feat/api-version-contract`.
- Package manager: Bun workspaces; Turbo is not used.
- Real E2E requires `E2E_BASE_URL`, `E2E_API_URL`, and one provisioner-generated auth JSON file per selected salon; username/password variables remain bootstrap fallbacks only.
- The web runner consumes the per-salon storage-state contract; `emme-service` still needs to emit those artifacts from its provisioner.
- Production frontend topology is three package-name-aligned apps built by one parameterized Dockerfile under `deploy/docker/`.
