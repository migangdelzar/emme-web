# Implementation Plan: Package-First Application Migration

## Overview

Move reusable salon capabilities out of `apps/emme-salon-app` into workspace packages. The salon app becomes a composition shell containing providers, routing, layouts, runtime configuration, theme entrypoints, and only behavior that is genuinely unique to this application.

## Architecture Decisions

- `@emme/ui` owns reusable visual primitives and shared UI adapters.
- `@emme/validation` owns reusable runtime schemas and validation helpers.
- `@emme/i18n` owns translations, locale behavior, and shared formatters.
- `@emme/domain` owns pure business types and rules.
- `@emme/application` owns use cases and ports.
- `@emme/api` owns typed contracts and backend operations.
- `@emme/infrastructure` owns concrete HTTP, auth, storage, and integration adapters.
- `@emme/core` owns shared providers and application runtime behavior.
- `@emme/features` owns reusable feature modules, including feature components, hooks, query adapters, mappers, contexts, and feature tests.
- The app owns composition only: providers, routes, layouts, runtime configuration, app theme, branding, navigation configuration, and app-specific orchestration.
- Tests remain colocated with the code they exercise; package-level `src/__tests__` is reserved for cross-module package contracts.

## Target Application Shape

```text
apps/emme-salon-app/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── router.tsx
│   ├── layouts/
│   ├── config/
│   └── error-boundary/
├── config/
├── theme/
├── main.tsx
└── vite-env.d.ts
```

## Target Feature Package Shape

```text
packages/features/src/
├── appointments/
├── auth/
├── clients/
├── dashboard/
├── finances/
├── google-workspace/
├── onboarding/
├── services/
├── settings/
├── shared/
└── index.ts
```

## Task List

### Phase 1: Inventory and package boundaries — ✅ Complete

- [x] Classify every app source file as composition, reusable feature, shared platform, or tenant-only behavior.
- [x] Define package dependencies and public exports for the moved modules.
- [x] Add migration boundary tests that prohibit reusable feature code from importing app aliases.

### Phase 2: Move shared app utilities and platform adapters — ✅ Complete

- [x] Move query factory and API error presentation helpers to reusable packages.
- [x] Move shared error UI, phone input, toaster adapter, and generic utilities to `@emme/ui` or `@emme/features/shared`.
- [x] Move locale, translation composition, and persistence behavior to `@emme/i18n` where reusable.

### Phase 3: Move feature modules — ✅ Complete

- [x] Move appointments and services, including domain, API query adapters, hooks, mappers, components, and tests.
- [x] Move clients, including forms, list views, query adapters, hooks, and tests.
- [x] Move dashboard, finances, onboarding, settings, and Google Workspace modules.
- [x] Move auth feature UI and reusable auth session adapters while keeping app composition in `AppProviders`.
- [x] Update all package exports and eliminate `@/features/*` imports.

### Phase 4: Reduce the application shell — ✅ Complete

- [x] Update routes and providers to import features only through package public APIs.
- [x] Keep only app-specific navigation configuration, branding, runtime configuration, theme entrypoint, and route composition in the app.
- [x] Remove migrated app directories and obsolete app-only tests.
- [x] Update package manifests and TypeScript/Vite aliases.

### Phase 5: Verification — ✅ Complete (real E2E environment pending)

- [x] Run package and application typechecks.
- [x] Run all unit and integration tests.
- [x] Run build and lint checks.
- [x] Run mock E2E.
- [ ] Run real E2E when backend and Keycloak variables are available.
- [x] Verify no reusable package imports app paths or app aliases.
- [x] Commit and push the completed migration increment.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Feature modules currently import app aliases | High | Rewrite imports to package public APIs and add boundary tests before deleting app copies |
| Feature components depend on app-specific translation/auth helpers | High | Move generic behavior to `@emme/i18n`/`@emme/core`; inject app-specific behavior at composition boundaries |
| Package dependency cycles | High | Keep dependency direction domain → application ports → infrastructure adapters; features consume public package APIs only |
| Vite package source resolution differences | Medium | Typecheck and build after each package migration slice |
| Real E2E unavailable locally | Medium | Preserve the real-mode guardrail and run it when required environment variables are supplied |

## Final verification

The completed migration was verified with `bun run typecheck`, `bun run test`, `bun run docs:check`, `bun run i18n:check`, `bun run format:check`, `bun run lint`, `bun run security:check`, `bun run build`, and `bun run --filter @emme/e2e test`. The mock browser suite passed 36 tests with 3 intentional skips. Real E2E is still blocked by missing environment credentials, not by a code failure.
