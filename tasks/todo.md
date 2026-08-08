# Package-First Migration Checklist

- [ ] Restate goal and acceptance criteria
- [x] Locate existing implementation and package patterns
- [x] Design package ownership and dependency direction
- [ ] Migrate shared utilities and platform adapters
- [ ] Migrate reusable feature modules
- [ ] Reduce the salon app to composition and tenant-specific code
- [ ] Add or update package boundary tests
- [ ] Run typecheck, unit tests, lint, build, and mock E2E
- [ ] Run real E2E when credentials and endpoints are configured
- [ ] Summarize changes and verification evidence

## Acceptance criteria

- Reusable feature code is owned by packages, not `apps/emme-salon-app/src/features`.
- The salon app contains only composition, configuration, theme, branding, and genuinely tenant-specific code.
- No package imports from `apps/emme-salon-app` or the `@/` alias.
- Public package APIs are exported through package barrels.
- Existing behavior remains covered by tests and builds successfully.

## Working notes

- Current branch: `feat/api-version-contract`.
- Package manager: Bun workspaces; Turbo is not used.
- Real E2E requires `E2E_BASE_URL`, `E2E_API_URL`, `E2E_TENANT_SLUG`, `E2E_KEYCLOAK_USERNAME`, and `E2E_KEYCLOAK_PASSWORD`.
