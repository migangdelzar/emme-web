# `@emme/emme-salon-app` Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Migrate the current tenant-owner/staff salon application to the shared Emme package architecture while preserving its routes, tenant behavior, feature behavior, visual behavior, and tests.

**Architecture:** The app is a composition shell. `src/app` owns providers, routes, layouts, error boundaries, and page composition. Feature folders own salon-specific components, hooks, API/query adapters, schemas, mappers, validators, permissions, and client-only state. Shared behavior comes from public package barrels; the app never imports package internals.

**Tech Stack:** Bun, Vite, React 19, React Router 7, TanStack Query 5, React Hook Form, Zod 4, Vitest 4, Playwright, `@emme/ui`, `@emme/validation`, `@emme/i18n`, `@emme/test-support`, `@emme/domain`, `@emme/application`, `@emme/api`, `@emme/infrastructure`, and `@emme/core`.

## Current State

The current app is `apps/emme-salon-app` with package name `@emme/emme-salon-app`. It already has `src/app/App.tsx`, `AppProviders.tsx`, `router.tsx`, auth, layout, error boundary, app-local API clients, i18n setup, feature folders, shared UI, services, and stores. Routes currently include `/dashboard`, `/agenda`, `/clients`, `/services`, `/finances`, and `/settings`, with `HashRouter` and lazy-loaded screens. Existing tests are colocated as `*.test.ts`/`*.test.tsx`; keep that convention.

## Target App Tree

```text
apps/emme-salon-app/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── router.tsx
│   ├── routes/
│   ├── layouts/
│   │   └── AppLayout.tsx
│   ├── auth/
│   │   ├── LoginBoundary.tsx
│   │   └── TenantSelector.tsx
│   ├── config/
│   └── error-boundary/
├── features/
│   ├── appointments/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── services/
│   │   ├── domain/
│   │   ├── schemas/
│   │   ├── mappers/
│   │   ├── validators/
│   │   ├── constants/
│   │   ├── permissions/
│   │   ├── store/
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── clients/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── services/
│   │   ├── domain/
│   │   ├── schemas/
│   │   ├── mappers/
│   │   ├── validators/
│   │   ├── constants/
│   │   ├── permissions/
│   │   ├── store/
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── services/
│   ├── dashboard/
│   ├── finances/
│   ├── settings/
│   ├── google-workspace/
│   ├── auth/
│   └── onboarding/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── styles/
├── stores/
├── main.tsx
├── setupTests.ts
└── vite-env.d.ts
```

The full feature tree is a convention, not a requirement to create empty directories. Add `pages`, `schemas`, `services`, `permissions`, or `store` only when the feature has that responsibility.

## Migration Mapping

| Current path | Target action |
|---|---|
| `src/app/App.tsx` | Keep as route/auth/layout composition; consume core and i18n hooks through public APIs. |
| `src/app/AppProviders.tsx` | Become the composition root: create HTTP client, API, repository adapters, query client, core providers, i18n provider, theme, and UI providers. |
| `src/app/router.tsx` | Keep route declarations; split route definitions into `src/app/routes/` only when route guards or lazy imports become difficult to navigate. |
| `src/app/layouts/AppLayout.tsx` | Keep app-specific navigation/layout; use generic UI primitives from `@emme/ui`. |
| `src/app/auth/AuthProvider.tsx` and `useAuth.ts` | Replace reusable behavior with `@emme/core`; keep login/tenant selector UI app-owned. |
| `src/app/config/runtimeConfig.ts` | Read Vite environment in app, validate through `@emme/core`. |
| `src/app/locale.ts` and `src/app/translation.ts` | Use `@emme/i18n` provider and explicit locale context. |
| `src/api/restClient.ts` and `apiClientInstance.ts` | Replace with infrastructure HTTP/API factories in `AppProviders`; delete after consumer migration. |
| `src/api/*` and feature `api/*.queries.ts` | API transport moves to `@emme/api`; query keys/cache adapters remain feature/app-owned. |
| `src/services/cacheService.ts` | Keep only salon-specific cache behavior; generic storage moves to infrastructure. |
| `src/stores/uiStore.ts` | Keep as client-only UI state; do not duplicate server users/appointments/services. |
| `src/shared/ui/*` | Promote generic primitives to `@emme/ui`; retain salon-specific UI locally. |
| `src/features/*/components/*.tsx` | Move screen composition to feature `pages/`; keep reusable components and hooks in their responsibility folders. |
| `src/features/*/domain/*` | Move pure rules/models to `@emme/domain`; keep view models local. |
| `src/features/*/mappers/*` | Keep feature view mappers unless they convert API DTOs to domain models, in which case use API/infrastructure adapters. |

## Package Wiring Contract

```tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  const runtimeConfig = readRuntimeConfig(import.meta.env);
  const httpClient = createHttpClient({
    baseUrl: runtimeConfig.apiUrl,
    accessTokenProvider: tokenStorage,
    tenantSlugProvider: tenantContext,
  });
  const api = createApi(httpClient);

  return (
    <ApiProvider api={api}>
      <AuthProvider session={authSession}>
        <TenantProvider value={tenantContextValue}>
          <PermissionProvider>
            <QueryClientProvider client={queryClient}>
              <I18nProvider locale={locale} timeZone={timeZone} currency={currency}>
                <ThemeProvider>{children}</ThemeProvider>
              </I18nProvider>
            </QueryClientProvider>
          </PermissionProvider>
        </TenantProvider>
      </AuthProvider>
    </ApiProvider>
  );
}
```

The final implementation may preserve existing `ErrorBoundary`, `TooltipProvider`, and `Toaster` nesting, but concrete providers and clients are created once in the composition root. No feature component creates an API client or global query client.

## TDD Tasks

### Task 1: Add app package dependencies and composition-root seams

**Files:** `apps/emme-salon-app/package.json`, `src/app/AppProviders.tsx`, `src/app/config/runtimeConfig.ts`, `src/app/config/runtimeConfig.test.ts`, `src/main.tsx`.

- [ ] Red: add an integration test that renders `AppProviders` with fake API/auth/tenant dependencies and asserts child content renders through the provider tree.
- [ ] Run `bun run --filter @emme/emme-salon-app test -- src/app/AppProviders.test.tsx`; expect failure until the seams and dependencies exist.
- [ ] Green: add `@emme/validation`, `@emme/test-support`, and `@emme/features` only when the first migrated consumer needs them; wire `createHttpClient`, `createApi`, core providers, i18n, query, theme, and UI providers through injectable composition values.
- [ ] Run the focused test and expect PASS.
- [ ] Refactor: keep environment reads in the app and concrete adapters in infrastructure; use one query client instance per app runtime.
- [ ] Run `bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(salon-app): establish shared composition root`.

### Task 2: Migrate authentication, tenancy, localization, and error boundaries

**Files:** `src/app/auth/*`, `src/app/locale.ts`, `src/app/translation.ts`, `src/i18n.ts`, `src/app/error-boundary/*`, related tests, `src/app/App.tsx`.

- [ ] Red: add tests for loading, signed-out, tenant-required, authenticated, locale change, unauthorized error, missing resource, conflict, and retry UI states.
- [ ] Run the affected app tests and confirm failures before implementation.
- [ ] Green: consume `@emme/core` auth/tenant/permission providers, `@emme/i18n` translation/formatter APIs, and normalized infrastructure/core errors while preserving Login, TenantSelector, and existing redirects.
- [ ] Run `bun run --filter @emme/emme-salon-app test`; expect PASS.
- [ ] Refactor: remove duplicate app providers/translation initialization and ensure runtime locale/time-zone values flow explicitly into i18n.
- [ ] Run `bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(salon-app): adopt core auth tenancy and i18n providers`.

### Task 3: Migrate generic UI and shared app utilities

**Files:** `src/shared/components/*`, `src/shared/ui/*`, `src/shared/lib/utils.ts`, affected feature components/tests, `@emme/ui` public exports.

- [ ] Red: add regression tests for each replaced generic control covering current labels, keyboard interaction, loading/disabled state, and visual state hooks.
- [ ] Run focused tests and confirm failure before replacing imports.
- [ ] Green: replace generic app-local controls with `@emme/ui`; keep PhoneInput/sonner app-local until their generic contracts are proven.
- [ ] Run affected feature tests and expect PASS.
- [ ] Refactor: delete duplicate generic files only after `rg` shows no imports and the UI package boundary test passes.
- [ ] Run `bun run --filter @emme/ui test && bun run --filter @emme/emme-salon-app test:ui-imports`.
- [ ] Commit with `refactor(salon-app): consume shared ui primitives`.

### Task 4: Migrate clients and services as complete vertical slices

**Files:** `src/features/clients/*`, `src/features/services/*`, `src/app/router.tsx`, feature tests, query modules, and application/infrastructure adapters.

- [ ] Red: add tests for list loading/error/empty states, create/update validation and submission, API query keys, mutation invalidation, domain normalization, and mapper output.
- [ ] Run focused tests and confirm failures before moving code.
- [ ] Green: route UI through feature hooks → application use cases → ports → infrastructure/API, use feature-local schemas/validators, and promote reusable components/hooks to `@emme/features` only when their props are generic.
- [ ] Run `bun run --filter @emme/emme-salon-app test -- src/features/clients src/features/services`; expect PASS.
- [ ] Refactor: split screen components into `pages/` and responsibility folders; remove direct HTTP/API-client calls from components.
- [ ] Run `bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(salon-app): migrate clients and services vertical slices`.

### Task 5: Migrate appointments, dashboard, finances, settings, integrations, onboarding

**Files:** `src/features/appointments/*`, `dashboard/*`, `finances/*`, `settings/*`, `google-workspace/*`, `onboarding/*`, route/layout files, and tests.

- [ ] Red: add or update tests for each existing route’s loading, error, empty, mutation, stream, form, and permission behavior before changing dependency wiring.
- [ ] Run each focused feature suite and record the baseline failure/success behavior.
- [ ] Green: migrate appointment behavior to application/domain/API/infrastructure boundaries; keep dashboard stream, finances, settings, Google Workspace, and onboarding app-specific where no approved reusable contract exists.
- [ ] Run the affected feature suites and expect PASS.
- [ ] Refactor: move only pure domain rules and generic adapters to packages; keep role-specific page composition in the app.
- [ ] Run `bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(salon-app): migrate remaining salon feature boundaries`.

### Task 6: Enforce app architecture and remove legacy paths

**Files:** `src/app/*boundary.test.ts`, feature `index.ts` files, package manifests, deleted legacy files, root scripts/docs.

- [ ] Red: add source scans that reject component-level HTTP calls, deep package imports, `api-client`/`client-api` names, duplicate server-state stores, and feature-to-feature internal imports.
- [ ] Run `bun run --filter @emme/emme-salon-app test`; expect failures for each remaining violation.
- [ ] Green: replace violations with public package imports, feature hooks, application use cases, or client-only UI stores.
- [ ] Run the app tests and expect PASS.
- [ ] Refactor: remove legacy API/client files only after import scans, build, and route tests pass; preserve recoverable commits.
- [ ] Run `rg -n "axios|fetch\(|api-client|client-api|src/api/restClient|src/api/apiClientInstance" apps/emme-salon-app/src --glob '*.{ts,tsx}'` and expect no forbidden component/legacy matches.
- [ ] Commit with `chore(salon-app): remove legacy architecture paths`.

### Task 7: Verify browser journeys and production build

**Files:** `e2e/` salon specs, app build/config files only if failures identify a necessary integration fix.

- [ ] Red: add/adjust Playwright mocked journeys for sign-in, tenant selection, dashboard, clients, services, appointments, settings, and permission denial; assert critical routes and tenant-scoped requests.
- [ ] Run `bun run test:e2e:mock`; confirm any missing behavior fails before the final fix.
- [ ] Green: fix only integration regressions caused by the migration and keep backend-authoritative tenant behavior.
- [ ] Run the E2E suite and expect PASS.
- [ ] Refactor: remove duplicated test setup by consuming `@emme/test-support` handlers/providers where the behavior is shared.
- [ ] Run the complete quality command listed below.
- [ ] Commit with `test(salon-app): verify migrated tenant journeys`.

## Acceptance Criteria

- [ ] Current routes and user-visible behavior are preserved.
- [ ] App composition creates concrete clients once and injects them into providers/adapters.
- [ ] Components do not contain HTTP calls, backend DTO mapping, business rules, or complex server state logic.
- [ ] Feature folders follow the reusable convention without creating empty speculative files.
- [ ] Server state is owned by TanStack Query; client-only UI state remains in focused stores.
- [ ] Tenant context is forwarded to requests but never treated as authorization proof.
- [ ] Existing unit, integration, and mocked E2E coverage remains green.

## Verification and Definition of Done

```bash
bun run docs:check
bun run i18n:check
bun run format:check
bun run --filter @emme/emme-salon-app typecheck
bun run --filter @emme/emme-salon-app lint
bun run --filter @emme/emme-salon-app test
bun run --filter @emme/emme-salon-app test:coverage
bun run --filter @emme/emme-salon-app build
bun run test:e2e:mock
bun run quality
```

- [ ] All routes render and critical tenant-owner workflows pass.
- [ ] No active `api-client` naming or app-local direct HTTP boundary remains.
- [ ] Coverage does not introduce skipped tests or unverified migration paths.
- [ ] All migration commits are pushed and the app is ready to be copied as the basis for future platform-admin and client app shells.

