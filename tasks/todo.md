# Package-First Migration Checklist

- [ ] Restate goal and acceptance criteria
- [x] Locate existing implementation and package patterns
- [x] Design package ownership and dependency direction
- [x] Migrate shared utilities and platform adapters
- [x] Migrate reusable feature modules
- [x] Reduce the salon app to composition and tenant-specific code
- [x] Add or update package boundary tests
- [x] Run typecheck, unit tests, lint, build, and mock E2E
- [ ] Run real E2E when credentials and endpoints are configured
- [x] Summarize changes and verification evidence

## Acceptance criteria

- Reusable feature code is owned by packages, not `apps/emme-salon-app/src/features`.
- The salon app contains only composition, configuration, theme, branding, and genuinely tenant-specific code.
- No package imports from `apps/emme-salon-app` or the `@/` alias.
- Public package APIs are exported through package barrels.
- Existing behavior remains covered by tests and builds successfully.

## Results

- Reusable feature code, shared UI adapters, locale behavior, session logic, and cache storage now live in workspace packages.
- `apps/emme-salon-app/src` contains the app shell: providers, routes, layout, runtime config, theme entrypoint, branding, and app-specific error presentation.
- Tailwind package source scanning is explicit through `@source` declarations in `src/theme/globals.css`.
- Package and application boundary tests were moved with their owning modules and updated for the new roots.
- Verification passed: typecheck, unit tests, documentation validation, i18n validation, formatting, security audit, lint (warnings only), production build, and mock E2E (36 passed, 3 intentionally skipped).
- Real E2E remains environment-gated and was not executed successfully because the required backend, tenant, and Keycloak credentials are not configured locally.

## Known follow-up

- `@emme/features` currently imports the concrete client repository adapter from `@emme/infrastructure` for its client query composition. This keeps the reusable feature self-contained for the current migration; a later strict hexagonal refinement can inject that adapter from each app composition root.

## Working notes

- Current branch: `feat/api-version-contract`.
- Package manager: Bun workspaces; Turbo is not used.
- Real E2E requires `E2E_BASE_URL`, `E2E_API_URL`, `E2E_TENANT_SLUG`, `E2E_KEYCLOAK_USERNAME`, and `E2E_KEYCLOAK_PASSWORD`.
