# Library Architecture and Salon App Integration Design

| Field | Value |
|---|---|
| Status | Written; awaiting user review |
| Date | 2026-08-08 |
| Repository | `emme-web` |
| Current integration target | `apps/emme-salon-app` |
| Tooling decision | Bun workspaces and Bun scripts; no pnpm or Turbo migration |

## 1. Purpose

This design defines a reusable frontend architecture for three React
applications:

- `platform-admin-app`: platform-level administration.
- `emme-salon-app`: the current generic tenant-owner/staff application.
- `client-app`: client self-service inside a tenant.

The architecture is a modular monorepo using feature-based application
organization, Hexagonal Architecture, DDD-inspired domain modules, and a
shared component system. It is backend-authoritative for tenant resolution,
authorization, and business invariants.

The design preserves the detailed feature structure requested for complex
capabilities while avoiding empty enterprise folders. Each implementation plan
will identify which files are required for the first slice and which files are
reserved for later complexity.

## 2. Reference documents and reconciliation

The design was reviewed against the following reference documents supplied in
`/Users/miguelangeldelgadillozarate/Downloads`:

- `00-architecture-overview.md`
- `apps-client.md`
- `apps-salon.md`
- `apps-platform-admin.md`
- `packages-ui.md`
- `packages-test-support.md`
- `packages-i18n.md`
- `packages-features.md`
- `packages-infrastructure.md`
- `packages-api.md`
- `packages-domain.md`
- `packages-core.md`

The references describe the intended architecture. The following repository
decisions reconcile them with the current codebase:

1. Bun remains the package manager and workspace task runner. The reference
   mentions pnpm and Turbo, but this migration does not introduce either.
   Bun already supports workspace dependencies, filtered scripts, parallel or
   sequential execution, and dependency-aware script ordering.
2. The physical application directory remains `apps/emme-salon-app` and the
   package remains `@emme/emme-salon-app`. `salon-app` is the conceptual role
   name used in architecture documents.
3. The target has ten libraries, including the optional promotion boundary
   `@emme/features`:
   `ui`, `validation`, `i18n`, `test-support`, `domain`, `application`, `api`,
   `infrastructure`, `core`, and `features`.
4. `@emme/features` receives shared React business adapters only after at least
   two applications genuinely need the same behavior. Its plan exists now so
   the promotion boundary is explicit; it must not become a second business or
   application layer.
5. Existing app behavior, routes, API paths, E2E provider seams, and Bun
   scripts remain compatibility constraints during migration.

## 3. Target workspace

```text
emme-web/
├── apps/
│   ├── platform-admin-app/
│   ├── emme-salon-app/
│   └── client-app/
├── packages/
│   ├── ui/
│   ├── validation/
│   ├── i18n/
│   ├── test-support/
│   ├── domain/
│   ├── application/
│   ├── api/
│   ├── infrastructure/
│   ├── core/
│   └── features/
├── e2e/
├── docs/
├── tasks/
├── package.json
└── bun.lock
```

No frontend codebase or deployment is created per tenant. All salons use the
same generic salon application. Tenant identity, membership, isolation, and
authorization are resolved and enforced by the backend.

## 4. Package responsibilities

| Package | Responsibility | Primary dependencies |
|---|---|---|
| `@emme/ui` | Generic visual components, accessibility behavior, design tokens, and generic UI hooks | React and visual/accessibility libraries |
| `@emme/validation` | Shared Zod schemas, schema helpers, common validation errors, and reusable boundary validation | Zod |
| `@emme/i18n` | Translation provider, typed catalogs, locale selection, locale-aware presentation formatting, and pluralization | React and formatting libraries |
| `@emme/test-support` | Test providers, fakes, factories, fixtures, handlers, and reusable test setup | Test libraries and selected workspace packages as development dependencies |
| `@emme/domain` | Pure business models, entities, value objects, statuses, rules, and invariants | No workspace dependencies |
| `@emme/application` | Framework-independent use cases, orchestration, and outbound ports | `@emme/domain` |
| `@emme/api` | Backend DTOs, requests, responses, routes, typed SDK factories, parsers, and transport ports | Framework-agnostic transport types only |
| `@emme/infrastructure` | Concrete HTTP, auth storage, request context, application adapters, analytics, observability, browser, and external integrations | `@emme/api`, `@emme/application` |
| `@emme/core` | Authentication, tenancy, permissions, runtime configuration, providers, and shared application errors | Core contracts; API ports may be consumed without concrete infrastructure |
| `@emme/features` | Reusable React business components, hooks, mappers, and query adapters promoted from applications | `@emme/ui`, `@emme/core`, `@emme/application`, `@emme/api`, `@emme/i18n`, `@emme/validation` |

The application shells own routes, pages, layouts, composition roots, and
role-specific workflows. They may consume all required libraries but no
library may import an application's internal files.

## 5. Dependency rules

```text
@emme/ui              → React and visual dependencies
@emme/validation      → Zod and shared validation types
@emme/i18n            → locale data, provider, presentation formatters, and localized messages
@emme/test-support    → test-only adapters and fixtures

@emme/domain          → no workspace dependencies
@emme/application     → @emme/domain
@emme/api             → backend contracts and transport ports
@emme/infrastructure  → @emme/api + @emme/application
@emme/core            → runtime contracts and providers
@emme/features        → UI and reusable React business adapters

apps                  → selected packages and concrete composition
```

Required invariants:

1. `@emme/domain` never imports React, React Query, Apollo, fetch, Axios,
   storage, browser APIs, API DTOs, infrastructure, or application code.
2. `@emme/application` defines ports and accepts dependencies from the outside;
   it never creates concrete clients or adapters.
3. `@emme/api` describes the backend boundary but does not implement concrete
   fetch, browser storage, React Query, or React hooks.
4. `@emme/infrastructure` implements external behavior and application ports.
5. `@emme/core` may expose React context and hooks for cross-cutting runtime
   behavior, but it does not call concrete external systems directly.
6. `@emme/ui` never imports business, API, application, infrastructure, or
   tenant code.
7. `@emme/features` never contains pure domain rules, pages, application
   routes, tenant-specific branches, or raw transport setup.
8. Shared server state is owned by TanStack Query or Apollo; client-only state
   belongs to local state or a focused app store.
9. Frontend guards improve user experience only. Backend authorization remains
   mandatory.
10. Public package and feature behavior is exported through `index.ts`; private
    internals are not imported by consumers.

## 6. Package target structures

### 6.1 `@emme/ui`

```text
packages/ui/src/
├── components/
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── Checkbox/
│   ├── RadioGroup/
│   ├── Textarea/
│   ├── FormField/
│   ├── Modal/
│   ├── Drawer/
│   ├── Tabs/
│   ├── Tooltip/
│   ├── Dropdown/
│   ├── Table/
│   ├── DataGrid/
│   ├── Pagination/
│   ├── DatePicker/
│   ├── Calendar/
│   ├── Avatar/
│   ├── Badge/
│   ├── Card/
│   ├── Spinner/
│   ├── Skeleton/
│   ├── EmptyState/
│   ├── ErrorState/
│   └── ConfirmDialog/
├── hooks/
├── tokens/
├── styles/
└── index.ts
```

Complex components normally contain `Component.tsx`, `Component.types.ts`,
`Component.test.tsx`, and `index.ts`. Generic components are extracted from
`apps/emme-salon-app/src/shared/ui`; salon-specific components remain in their
features.

### 6.2 `@emme/validation`

```text
packages/validation/src/
├── common/
├── errors/
├── helpers/
├── schemas/
├── messages/
└── index.ts
```

This package owns reusable boundary validation and error utilities. Feature
schemas remain local, for example
`features/clients/schemas/create-client.schema.ts`.

### 6.3 `@emme/i18n`

```text
packages/i18n/src/
├── i18n.ts
├── i18n-provider.tsx
├── use-translation.ts
├── locale-context.tsx
├── formatters/
│   ├── date/
│   │   ├── format-date.ts
│   │   ├── format-time.ts
│   │   ├── format-relative-time.ts
│   │   └── index.ts
│   ├── number/
│   │   ├── format-number.ts
│   │   ├── format-currency.ts
│   │   └── index.ts
│   ├── messages/
│   │   ├── format-validation-message.ts
│   │   └── index.ts
│   ├── formatters.types.ts
│   └── index.ts
├── locales/
├── data/
├── testing/
│   └── i18n-test-provider.tsx
└── index.ts
```

`@emme/i18n` owns locale-aware presentation concerns: translation lookup,
pluralization, date and time display, relative time, numbers, currencies, and
localized validation messages. The formatter API accepts an explicit
`FormatContext` containing the locale and optional time zone or currency, so
formatting remains deterministic in tests and does not silently read browser
globals.

The shared formatter contract is intentionally small and framework-independent:

```ts
export interface FormatContext {
  locale: string;
  timeZone?: string;
  currency?: string;
}

export function formatDate(
  value: Date | string | number,
  context: FormatContext,
  options?: Intl.DateTimeFormatOptions,
): string;

export function formatCurrency(
  value: number,
  context: FormatContext,
  options?: Intl.NumberFormatOptions,
): string;
```

The concrete formatter functions may add capability-specific options, but they
must preserve explicit locale and time-zone inputs. React hooks are thin
adapters over these functions, not a second formatting implementation.

The package may also expose provider-backed hooks for normal UI usage. The
provider supplies the current locale and display defaults; callers may still
override them for a specific value. Formatter modules are grouped by concern
so date/time and number/currency behavior can grow without creating a flat
directory of unrelated helpers.

The boundaries are deliberate:

- `@emme/i18n` formats values for people; it does not decide what a value
  means in the business domain.
- `@emme/domain` owns business calculations and rules such as appointment
  duration, availability, cancellation windows, and service eligibility.
- `@emme/infrastructure` or `@emme/core` detects browser locale/time zone and
  supplies those runtime values to the i18n provider; i18n does not read
  `navigator`, `Intl.DateTimeFormat().resolvedOptions()`, storage, or APIs.
- `@emme/validation` and feature schemas own structural validation. i18n owns
  the localized message catalog and presentation of validation issues.

The existing JSON catalogs under `data/translations/` remain the migration
source of truth. If catalogs become too large, they can be split into the
typed `locales/` modules shown above without changing formatter consumers.
Tenant time zone, currency, and locale are runtime values. They do not create
tenant-specific frontend branches.

### 6.4 `@emme/test-support`

```text
packages/test-support/src/
├── render-with-providers.tsx
├── test-wrapper.tsx
├── mock-auth.ts
├── mock-tenancy.ts
├── mock-api.ts
├── mock-permissions.ts
├── fixtures/
│   ├── users.fixture.ts
│   ├── tenants.fixture.ts
│   ├── clients.fixture.ts
│   ├── appointments.fixture.ts
│   └── services.fixture.ts
├── handlers/
└── index.ts
```

This package contains no production runtime code, configuration, credentials,
or real external calls.

### 6.5 `@emme/domain`

```text
packages/domain/src/
├── appointments/
│   ├── appointment.types.ts
│   ├── appointment-status.ts
│   ├── appointment.entity.ts
│   ├── appointment.rules.ts
│   ├── cancellation.rules.ts
│   ├── rescheduling.rules.ts
│   └── index.ts
├── clients/
├── services/
├── staff/
├── payments/
├── notifications/
├── common/
└── index.ts
```

Domain types represent the frontend business model, not backend serialization.
DTO-to-domain mapping occurs outside this package.

### 6.6 `@emme/application`

```text
packages/application/src/
├── appointments/
│   ├── salon/
│   ├── client/
│   └── ports/
├── clients/
├── services/
├── staff/
├── payments/
├── platform/
├── notifications/
└── index.ts
```

Use cases receive repository and service ports through dependency injection.
Simple CRUD may use a direct port operation; complex workflows orchestrate
multiple ports and domain rules.

### 6.7 `@emme/api`

```text
packages/api/src/
├── contracts/
│   ├── common/
│   ├── auth/
│   ├── tenants/
│   ├── clients/
│   ├── appointments/
│   ├── services/
│   ├── staff/
│   ├── payments/
│   ├── integrations/
│   └── errors/
├── ports/
├── auth/
├── tenants/
├── clients/
├── appointments/
├── services/
├── staff/
├── payments/
├── integrations/
├── create-api.ts
├── testing/
└── index.ts
```

The API package may define `AppointmentDto`, `CreateAppointmentRequest`, and
`AppointmentResponse`; it must not define cancellation rules or React hooks.

### 6.8 `@emme/infrastructure`

```text
packages/infrastructure/src/
├── http/
│   ├── fetch-http-client.ts
│   ├── request-builder.ts
│   ├── api-error.ts
│   ├── timeout.ts
│   ├── retry.ts
│   └── interceptors/
├── graphql/
├── application-adapters/
│   ├── appointments/
│   ├── clients/
│   ├── services/
│   └── payments/
├── auth/
├── storage/
├── analytics/
├── feature-flags/
├── observability/
├── browser/
└── index.ts
```

GraphQL, analytics, feature flags, and advanced retry infrastructure are
planned boundaries; they are implemented only when the application requires
them. The package must not become an unbounded miscellaneous utility folder.

### 6.9 `@emme/core`

```text
packages/core/src/
├── auth/
├── tenancy/
├── access-control/
├── runtime/
├── configuration/
├── errors/
├── types/
└── index.ts
```

Core exposes reusable auth, tenant, permission, runtime, and error contracts
and may contain React providers and cross-cutting hooks. It does not read
`localStorage` directly or call concrete HTTP clients.

### 6.10 `@emme/features`

```text
packages/features/src/
├── appointments/shared/
│   ├── components/
│   ├── hooks/
│   ├── mappers/
│   └── index.ts
├── services/shared/
├── clients/shared/
├── payments/shared/
└── index.ts
```

This package is promotion-driven. Role-specific workflows remain in the
consuming app until a second app needs the same behavior.

## 7. Salon app integration structure

```text
apps/emme-salon-app/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── api.ts
│   ├── query-client.ts
│   ├── router.tsx
│   ├── route-paths.ts
│   ├── routes/
│   ├── layouts/
│   ├── guards/
│   └── error-boundary/
├── pages/
├── features/
│   ├── dashboard/
│   ├── appointments/
│   ├── clients/
│   ├── services/
│   ├── staff/
│   ├── finances/
│   ├── analytics/
│   ├── settings/
│   ├── google-workspace/
│   ├── auth/
│   └── onboarding/
├── state/
├── config/
├── styles/
└── main.tsx
```

App ownership:

- `AppProviders.tsx` is the composition root.
- `app/api.ts` creates typed API capabilities with infrastructure adapters.
- `app/query-client.ts` configures server-state behavior.
- `guards/` composes `@emme/core` guards for salon routes.
- `pages/` performs route-level composition only.
- `features/` owns salon-specific workflows.
- `state/` owns client-only application state.
- `config/` owns application-specific environment parsing.
- `styles/` owns salon application theme composition.

The integration plan covers dashboard, appointments, clients, services,
finances, settings, Google Workspace, authentication, and onboarding. It does
not invent product behavior for staff, analytics, platform administration, or
client self-service.

## 8. Feature structure and naming

Complex features use this reusable convention:

```text
features/clients/
├── components/
├── pages/
├── hooks/
├── api/
├── services/
├── domain/
├── schemas/
├── mappers/
├── validators/
├── constants/
├── permissions/
├── store/
├── __tests__/
└── index.ts
```

Naming rules:

- PascalCase for React components, pages, layouts, and component directories.
- kebab-case for hooks, services, schemas, mappers, validators, constants,
  permissions, and store modules.
- Plural capability directories: `clients`, `services`, `appointments`.
- Singular model filenames: `client.types.ts`, `appointment.rules.ts`.
- Capability API files use `clients.api.ts`, never `client-api.ts`.
- Query and mutation modules use `clients.queries.ts` and
  `clients.mutations.ts`.
- Public behavior is exposed through the nearest `index.ts`.
- `utils.ts` is avoided when a capability-specific name is possible.

## 9. Runtime flow and error handling

Simple query flow:

```text
Page/component → feature query hook → @emme/api → @emme/infrastructure → backend
```

Complex use-case flow:

```text
Page/component
  → feature hook
  → @emme/application use case
  → application port
  → infrastructure adapter
  → @emme/api capability operation
  → infrastructure HTTP client
  → backend
```

Error flow:

```text
network/transport error
  → infrastructure ApiError
  → API/application/domain error boundary
  → feature hook result
  → i18n user-facing message and UI state
```

The plans will define behavior for authentication expiry, authorization
failure, missing resources, invalid input, conflicts, rate limits, timeouts,
offline state, and server failures. Raw backend errors are not rendered
directly to users.

## 10. Tenant and state model

```text
Authentication
  → @emme/core auth state
  → backend tenant resolution and membership validation
  → @emme/core current tenant context
  → infrastructure request context
  → backend tenant isolation
  → tenant-scoped feature data
```

The frontend must never treat a local tenant identifier as proof of
authorization. No tenant-specific frontend branches are allowed.

State ownership:

- TanStack Query or Apollo owns server data and request state.
- Local state owns temporary UI and forms.
- Zustand or a focused app store owns client-only state shared by unrelated
  screens.
- `@emme/core` owns auth, tenancy, permissions, and runtime context.
- `@emme/domain` and `@emme/application` remain stateless and framework-free.

## 11. Testing model

Tests are colocated by default:

```text
source-module.ts
source-module.test.ts
Component.tsx
Component.test.tsx
```

`__tests__/` is reserved for package-level cross-module integration and
contract tests:

```text
packages/api/src/__tests__/capability-apis.test.ts
```

End-to-end tests remain under the root `e2e/` directory.

Package test responsibilities:

- `ui`: interaction, accessibility, keyboard, loading, and disabled states.
- `validation`: schema acceptance/rejection and error mapping.
- `i18n`: key parity, fallback, locale, time-zone, currency, number, relative
  time, and localized validation-message behavior. Formatter tests pass an
  explicit context and do not depend on the host machine's locale.
- `domain`: deterministic business rules and edge cases.
- `application`: use cases with fake ports.
- `api`: request paths, payloads, DTO parsing, and error mapping.
- `infrastructure`: transport, storage, retry, timeout, and adapter behavior.
- `core`: provider state, auth transitions, tenancy, and permissions.
- `features`: shared React components, hooks, mappers, and cache behavior.
- apps: route guards, pages, feature workflows, and composition behavior.
- E2E: critical browser journeys and tenant isolation expectations.

New behavior follows Red → Green → Refactor. Test providers, fakes, factories,
and MSW handlers are shared through `@emme/test-support` instead of being
duplicated in each package.

## 12. Migration phases

### Phase A: Workspace conventions

Document package boundaries, public exports, naming, import restrictions, Bun
commands, test conventions, and the package dependency matrix.

### Phase B: Shared libraries

Migrate generic UI primitives, shared validation, i18n, and test infrastructure.
These packages must remain independent of business features.

### Phase C: Business core

Expand `@emme/domain` with pure capability models and rules, then implement
`@emme/application` use cases and ports with injectable dependencies.

### Phase D: Backend boundary and adapters

Reorganize `@emme/api` around contracts and capability SDKs. Move concrete HTTP,
storage, auth, and application adapters into `@emme/infrastructure`.

### Phase E: Runtime core

Move reusable authentication, tenancy, permissions, configuration, providers,
and error contracts into `@emme/core` without moving concrete browser behavior
into it.

### Phase F: Salon app integration

Migrate the current app composition root, routes, layouts, guards, pages,
features, forms, state, and test setup. Remove legacy paths only after import
scans and regression tests pass.

### Phase G: Shared feature promotion

Evaluate repeated React business adapters across apps. Promote only proven
shared behavior into `@emme/features`.

## 13. Plan deliverables

After this design document is reviewed, create these executable plans:

```text
docs/superpowers/plans/2026-08-08-emme-architecture/
├── 00-implementation-index.md
├── 01-ui-plan.md
├── 02-validation-plan.md
├── 03-i18n-plan.md
├── 04-test-support-plan.md
├── 05-domain-plan.md
├── 06-application-plan.md
├── 07-api-plan.md
├── 08-infrastructure-plan.md
├── 09-core-plan.md
├── 10-features-plan.md
└── 11-emme-salon-app-integration-plan.md
```

Every plan must include current state, target tree, migration mapping, public
API, allowed dependencies, naming rules, TDD tasks, tests, Bun verification
commands, acceptance criteria, and definition of done. The index owns the
dependency order and identifies parallelizable work.

## 14. Verification and completion criteria

The complete migration plan is successful when:

- Every package has a clear owner and public barrel.
- No forbidden dependency direction exists.
- Generic UI is reusable without business knowledge.
- Shared validation is reusable while feature schemas remain feature-owned.
- Domain and application code are framework-independent.
- API contracts are independent from concrete transport.
- Infrastructure contains concrete external integrations only.
- Core contains cross-cutting runtime behavior only.
- Features are promoted only after genuine cross-app reuse.
- The current salon app preserves routes and user behavior during migration.
- Tests are colocated by default and package integration suites use
  `__tests__/`.
- Bun typecheck, tests, build, lint, documentation checks, and E2E checks are
  represented in the plans.
- The future apps are architecturally ready without invented product behavior.

The design intentionally does not include a pnpm migration, Turbo setup,
microfrontends, per-tenant builds, or speculative feature implementations.
