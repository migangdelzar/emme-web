# emme-salon-app Integration Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Migrate the current tenant application at `apps/emme-salon-app` onto the reusable package architecture while preserving its routes, tenant behavior, UI, API behavior, and tests.
**Architecture:** App shell and role-specific composition stay in the app; shared UI, validation, i18n, runtime, domain, application, API, and infrastructure capabilities come from packages.
**Tech Stack:** React, TypeScript, Vite, Bun, Vitest, React Testing Library, React Query, the existing app router and generated API contracts.

## Global Constraints

- This plan targets the current tenant app only. It prepares compatible boundaries for `platform-admin-app` and `client-app` without creating those apps.
- Preserve existing route URLs, authentication states, tenant resolution, localization behavior, query keys, and user-visible workflows unless a package migration requires a type-only change.
- Use colocated tests for app features/components/hooks; use `apps/emme-salon-app/e2e/` for end-to-end flows if present.
- App pages may compose feature components and application hooks but may not contain direct HTTP calls, backend DTO mapping, or reusable domain rules.
- Keep `src/api` only while an active migration consumer exists; remove each duplicate after the replacement is verified.

---

## 1. Current Inventory and Target Structure

Current app areas include `src/app`, `src/features` for auth, dashboard, appointments, clients, services, settings, finances, Google Workspace, and onboarding; `src/shared/ui`; `src/api`; `src/stores`; `src/services`; and app-owned i18n/config/auth modules.

Target structure:

```text
apps/emme-salon-app/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── router.tsx
│   ├── routes/
│   ├── layouts/
│   └── error-boundary/
├── features/
│   ├── auth/{components,pages,hooks,schemas,index.ts}
│   ├── dashboard/{components,pages,hooks,index.ts}
│   ├── appointments/{components,pages,hooks,api,mappers,schemas,index.ts}
│   ├── clients/{components,pages,hooks,api,mappers,schemas,index.ts}
│   ├── services/{components,pages,hooks,api,mappers,schemas,index.ts}
│   ├── settings/{components,pages,hooks,api,schemas,index.ts}
│   ├── finances/{components,pages,hooks,index.ts}
│   ├── google-workspace/{components,hooks,api,index.ts}
│   └── onboarding/{components,pages,hooks,schemas,index.ts}
├── shared/{components,hooks,utils,types,styles}
├── state/{store.ts,slices/,selectors/,middleware.ts}
├── config/{environment.ts,app-config.ts}
├── types/global.types.ts
└── main.tsx
```

The app owns pages, layouts, route configuration, role-specific compositions, and tenant-specific presentation. Packages own reusable contracts and behavior.

## 2. Ordered Tasks

### Task 1: Establish app composition and package aliases

**Files:** `apps/emme-salon-app/package.json`, `tsconfig.json`, `vite.config.*`, `src/app/AppProviders.tsx`, `src/main.tsx`, `src/app/App.tsx`.

Write a failing provider-composition test that renders the app with test-support fakes. Add package aliases and dependencies for `@emme/ui`, `@emme/validation`, `@emme/i18n`, `@emme/core`, `@emme/api`, `@emme/infrastructure`, `@emme/domain`, and `@emme/application`. Build the composition root in this order: infrastructure clients, API SDK, repository adapters, query client, core runtime/auth/tenant/permission providers, i18n provider, app router, and error boundary.

Preserve the current `HashRouter` behavior unless an existing route test proves a different router contract is already required.

### Task 2: Migrate shared UI and validation

**Files:** `src/shared/ui/**`, feature form components, imports, and tests.

Move generic primitives to `@emme/ui` through the UI plan. Migrate forms to `@emme/validation` shared primitives while keeping create/update/filter schemas inside their owning feature. Write component tests before changing imports, then remove app-local duplicates after all consumers compile and tests pass.

### Task 3: Migrate i18n and formatting

**Files:** `src/i18n.ts`, `src/app/translation.ts`, `src/app/locale.ts`, `src/app/translation.test.ts`, `src/app/locale.test.ts`, feature consumers.

Replace app-local translation and locale helpers with `@emme/i18n` providers and utilities. Preserve locale fallback, translation-key behavior, date/time formatting, and currency display. Keep tenant-specific translation resources in the app or feature package; keep reusable locale mechanics in the library.

### Task 4: Migrate clients, services, and appointments as vertical slices

**Files:** current feature components/hooks/API/query/mappers/domain files under `src/features/clients`, `services`, and `appointments`.

For each capability, execute Red→Green→Refactor in this order:

1. Add or update hook/component tests against test-support fakes.
2. Move pure types/rules to `@emme/domain` and application operations to `@emme/application`.
3. Replace feature API calls with `@emme/api` capability clients through infrastructure repository adapters.
4. Keep feature schemas, mappers from domain models to view models, pages, and components app-owned.
5. Preserve loading, empty, error, mutation, and invalidation behavior.

Use the original feature-oriented substructure where complexity warrants it: `components`, `pages`, `hooks`, `api`, `services`, `domain`, `schemas`, `mappers`, `validators`, `constants`, `permissions`, `store`, and `index.ts`. Do not create an unused category solely to match a tree.

### Task 5: Migrate dashboard, settings, finances, Google Workspace, and onboarding

**Files:** `src/features/dashboard/**`, `settings/**`, `finances/**`, `google-workspace/**`, `onboarding/**`.

Route existing data access through `@emme/api` and infrastructure adapters. Keep dashboard aggregation and screen-specific view state in app hooks/services. Move reusable domain rules only when they are shared by another app or capability. Preserve Google integration flows, tenant configuration, business profile context, cache behavior, and onboarding guards through focused tests.

### Task 6: Normalize state, permissions, and app-owned configuration

**Files:** `src/stores/**`, `src/app/auth/**`, `src/app/config/**`, route guards, feature permission checks.

Use React Query for server state. Retain global store state only for client-only UI concerns such as selection, table preferences, and cross-screen filters. Replace app permission duplication with `@emme/core` permission primitives and keep route-level policy composition in the app. Remove direct token/storage access from feature code.

### Task 7: Remove duplicate modules and enforce boundaries

**Files:** obsolete `src/api/**`, duplicate app UI/config/auth modules, package exports, import tests.

Run import scans and remove each duplicate only after its replacement has a passing consumer test. Add app boundary tests that reject direct imports from infrastructure internals, generated contract internals, and another feature’s private files. Preserve public feature barrels and use them for route composition.

### Task 8: Run full verification and migration review

**Files:** package scripts, test configuration, migration notes.

Run focused tests after every vertical slice, then the complete unit/type/lint/build suite and critical browser flows. Compare route coverage and user-visible states against the pre-migration baseline. Record any intentionally changed behavior in the migration notes before declaring completion.

## 3. Verification

- `bunx vitest run apps/emme-salon-app/src`
- `bunx tsc -p apps/emme-salon-app/tsconfig.json --noEmit`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `bun run test:e2e` when the app’s E2E script is available
- `rg -n "from ['\"]\.\./\.\./(api|shared/ui)|fetch\(|localStorage|sessionStorage" apps/emme-salon-app/src/features` returns no forbidden feature-level access.

## 4. Definition of Done

- [ ] App shell uses the package composition root and preserves routing/auth/tenant behavior.
- [ ] Generic UI, validation primitives, i18n mechanics, runtime, API, and infrastructure are consumed from packages.
- [ ] Clients, services, appointments, dashboard, settings, finances, Google Workspace, and onboarding retain tested behavior.
- [ ] Feature code does not perform direct HTTP, backend DTO mapping, or duplicated domain validation.
- [ ] Obsolete app-local duplicates are removed and boundary scans pass.
- [ ] Unit tests, typecheck, lint, build, and available E2E tests pass.

