# Emme Library and Salon Application Migration Design

| Field | Decision |
|---|---|
| Status | Approved design |
| Date | 2026-08-07 |
| Repository | `emme-web` |
| Current application | `apps/emme-salon-app` |
| Package manager | Bun workspaces |
| Task orchestration | Bun scripts and filters; Turbo is out of scope |
| Architecture | Modular monorepo with Hexagonal Architecture, DDD-inspired domain modules, feature-based apps, and shared component design |

## 1. Purpose

The repository will provide three application shells that share stable,
reusable libraries:

- `platform-admin-app` manages the SaaS platform and all tenants.
- `emme-salon-app` is the current generic tenant-owner/staff application.
- `client-app` provides client self-service inside a tenant.

There is no frontend deployment or source tree per salon. Tenant identity,
membership, isolation, and authorization remain backend responsibilities. The
frontend receives validated runtime context and renders the generic experience
for that tenant.

This design turns the existing application and partially extracted packages
into a consistent, reusable architecture. It does not implement product
behavior for the future applications. It defines the boundaries and the
executable plans required to migrate the current salon application safely.

## 2. Approved decisions

### 2.1 Workspace and tooling

The repository remains a Bun workspace. No `pnpm-workspace.yaml`, `turbo.json`,
or pnpm/Turbo migration is included.

Bun already supports workspace dependency linking, filtered commands,
parallel/sequential script execution, and dependency-aware script ordering:

- [Bun workspaces](https://bun.sh/docs/pm/workspaces)
- [Bun filters](https://bun.sh/docs/pm/filter)

Turbo is an optional future task-cache optimization, not an architectural
dependency. The architecture must remain correct when invoked with Bun alone.

### 2.2 Package set

The target contains ten packages:

```text
@emme/ui
@emme/validation
@emme/i18n
@emme/test-support
@emme/domain
@emme/application
@emme/api
@emme/infrastructure
@emme/core
@emme/features
```

`@emme/features` is an optional promotion layer. It is planned and documented,
but business React code remains inside an application until at least two
applications genuinely need the same behavior.

### 2.3 Domain and application split

`@emme/domain` is the pure business core. `@emme/application` coordinates
use cases through ports. `@emme/business` is not a package.

```text
@emme/domain       pure rules, entities, value objects, and business types
@emme/application  use cases, orchestration, and outbound ports
```

Neither package imports React, browser APIs, HTTP clients, API DTOs, or
concrete infrastructure.

### 2.4 API and infrastructure split

`@emme/api` is the reusable backend boundary. It owns DTOs, request/response
contracts, routes, typed capability factories, parsers, and transport ports.

`@emme/infrastructure` owns concrete external implementations: HTTP, storage,
token persistence, browser behavior, analytics, observability, retries, and
adapters that implement application ports.

The API package does not contain a concrete `fetch` client. Infrastructure does
not define domain rules.

### 2.5 Validation split

Validation is layered:

```text
@emme/validation       reusable Zod primitives and shared boundary schemas
feature/schemas/       feature-specific form and filter schemas
@emme/domain           business invariants and domain rules
backend                authoritative validation and database constraints
```

No layer is allowed to be the only validation layer.

### 2.6 UI extraction

Generic visual primitives currently under
`apps/emme-salon-app/src/shared/ui` will migrate to `@emme/ui` when they do
not contain salon or business behavior. Feature-specific UI remains in the
owning application or is promoted to `@emme/features` only after reuse is
proven.

### 2.7 Test organization

Tests are colocated by default. `__tests__/` is reserved for package-level
integration and cross-module contract tests. Browser E2E tests remain in the
root `e2e/` workspace.

```text
feature/domain/client.rules.test.ts
feature/components/ClientForm.test.tsx
package/src/__tests__/package-boundary.test.ts
e2e/specs/critical-flow.spec.ts
```

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

The current folder and package name `apps/emme-salon-app` and
`@emme/emme-salon-app` are preserved. `salon-app` is the conceptual role name
used in architecture documents.

## 4. Dependency architecture

```text
@emme/ui              → React, React DOM, styling, accessibility libraries
@emme/validation      → Zod and shared validation types
@emme/i18n            → locale data, formatting libraries, React provider
@emme/test-support    → test-only adapters and reusable fixtures

@emme/domain          → no workspace dependencies
@emme/application     → @emme/domain
@emme/api              → transport contracts and framework-independent SDK
@emme/infrastructure  → @emme/api + @emme/application
@emme/core             → runtime contracts/providers and API ports where needed
@emme/features        → @emme/ui + @emme/core + @emme/application + @emme/api
                         + @emme/i18n + @emme/validation

apps                  → selected packages through composition roots
```

Hard rules:

1. `@emme/domain` cannot import React, browser APIs, network clients, storage,
   `@emme/api`, or `@emme/infrastructure`.
2. `@emme/application` defines protocols/interfaces for external behavior and
   receives dependencies from the composition root.
3. `@emme/api` cannot import concrete fetch, Axios, browser storage, React,
   React Query, or Apollo React hooks.
4. `@emme/infrastructure` implements ports and external integrations but does
   not decide business policy.
5. `@emme/core` may expose React contexts and hooks for runtime concerns, but
   it cannot contain feature-specific business rules.
6. `@emme/ui` cannot depend on business, API, infrastructure, or app code.
7. `@emme/test-support` cannot be a production runtime dependency.
8. One application cannot import another application's internal files.
9. A feature exposes public behavior only through its `index.ts` barrel.
10. Backend authorization, tenant isolation, and business invariants remain
    authoritative even when the frontend hides or disables UI actions.

The dependency graph will be enforced through package manifests, TypeScript
configuration, import restrictions, and CI checks. Bun is responsible for
workspace execution; it is not responsible for architectural enforcement.

## 5. Package design and migration plans

The implementation-plan phase will create one executable plan per package and
one application integration plan. Every plan uses the same sections:

1. Current inventory.
2. Target responsibility.
3. Complete source tree.
4. Current-file to target-file migration matrix.
5. Public exports.
6. Dependency and forbidden-import rules.
7. Ordered implementation tasks.
8. Test-first tasks and test doubles.
9. Verification commands.
10. Acceptance criteria and definition of done.

### 5.1 `@emme/ui`

Responsibility: generic visual components, accessibility behavior, design
tokens, and generic UI hooks.

Target tree:

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
│   ├── use-disclosure.ts
│   ├── use-media-query.ts
│   ├── use-controllable-state.ts
│   └── use-keyboard-navigation.ts
├── tokens/
├── styles/
└── index.ts
```

Migration sources:

- Generic primitives from `apps/emme-salon-app/src/shared/ui/**`.
- Generic loading, empty, error, and form-field components from app shared
  components.
- Accessibility behavior must be retained and tested before old files are
  removed.

Forbidden: API calls, business hooks, tenant context, permissions, salon
layouts, domain rules, and application workflows.

Every complex component follows:

```text
Component/
├── Component.tsx
├── Component.types.ts
├── Component.test.tsx
└── index.ts
```

### 5.2 `@emme/validation`

Responsibility: reusable Zod schemas, schema composition helpers, common
validation error mapping, and shared validation messages.

Target tree:

```text
packages/validation/src/
├── common/
│   ├── id.schema.ts
│   ├── email.schema.ts
│   ├── phone.schema.ts
│   ├── date.schema.ts
│   └── pagination.schema.ts
├── errors/
│   ├── validation-error.ts
│   └── validation-error.mapper.ts
├── helpers/
│   ├── create-schema.ts
│   └── format-issues.ts
├── types/
│   └── validation.types.ts
├── index.ts
└── __tests__/
    └── validation-boundary.test.ts
```

Feature schemas remain in their feature:

```text
features/clients/schemas/create-client.schema.ts
features/appointments/schemas/create-appointment.schema.ts
```

`@emme/validation` must not import domain rules, API clients, React, or
application features.

The workspace will standardize on one Zod major version. The current app uses
Zod 4 while the existing validation package declares Zod 3, so the validation
plan must align the package and app to Zod 4 before shared schemas are
extracted. No package may expose schemas compiled against incompatible Zod
majors.

### 5.3 `@emme/i18n`

Responsibility: typed translations, locale selection, fallback behavior,
pluralization, and presentation formatting for date, time, number, and
currency.

Target tree:

```text
packages/i18n/src/
├── i18n.ts
├── i18n-provider.tsx
├── use-translation.ts
├── locale-context.tsx
├── formatters/
│   ├── format-date.ts
│   ├── format-time.ts
│   ├── format-currency.ts
│   └── format-number.ts
├── locales/
│   ├── en/
│   ├── es/
│   └── index.ts
├── data/
├── index.ts
└── __tests__/
    └── translation-boundary.test.ts
```

Tenant time zone and currency are runtime values. They do not create tenant
specific code paths. The package does not contain API calls, permissions,
authentication, or business calculations.

### 5.4 `@emme/test-support`

Responsibility: reusable test providers, fakes, fixtures, factories, and
transport handlers. It must never contain production behavior or real
credentials.

Target tree:

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
│   ├── auth.handlers.ts
│   ├── tenant.handlers.ts
│   ├── appointment.handlers.ts
│   ├── client.handlers.ts
│   └── service.handlers.ts
├── memory-storage.ts
└── index.ts
```

Tests for non-trivial fakes are colocated with the fake. Package integration
tests may use `src/__tests__/`.

### 5.5 `@emme/domain`

Responsibility: pure business concepts and rules valid across all applications.

Target tree:

```text
packages/domain/src/
├── appointments/
│   ├── appointment.types.ts
│   ├── appointment-status.ts
│   ├── appointment.rules.ts
│   ├── cancellation.rules.ts
│   ├── rescheduling.rules.ts
│   └── index.ts
├── clients/
│   ├── client.types.ts
│   ├── client.rules.ts
│   └── index.ts
├── services/
│   ├── service.types.ts
│   ├── service.rules.ts
│   └── index.ts
├── staff/
│   ├── staff.types.ts
│   ├── staff.rules.ts
│   └── index.ts
├── payments/
│   ├── payment.types.ts
│   ├── payment-status.ts
│   ├── payment.rules.ts
│   └── index.ts
├── notifications/
│   ├── notification.types.ts
│   └── index.ts
└── index.ts
```

Examples: `canCancelAppointment`, `canRescheduleAppointment`,
`isServiceAvailable`, `calculateAppointmentTotal`, and
`isPaymentRefundable`.

API DTOs never enter this package. Mappers convert DTOs into domain models at
an adapter boundary. Domain tests are framework-free and deterministic.

### 5.6 `@emme/application`

Responsibility: framework-independent use cases, orchestration, and ports.

Target tree:

```text
packages/application/src/
├── appointments/
│   ├── salon/
│   │   ├── list-salon-appointments.ts
│   │   ├── update-appointment.ts
│   │   └── cancel-appointment.ts
│   ├── client/
│   │   ├── find-available-slots.ts
│   │   ├── create-booking.ts
│   │   └── cancel-own-appointment.ts
│   └── ports/
│       ├── appointment-repository.ts
│       ├── availability-service.ts
│       └── notification-service.ts
├── clients/
│   ├── create-client.ts
│   ├── update-client.ts
│   └── ports/client-repository.ts
├── services/
├── staff/
├── payments/
├── platform/
│   ├── create-tenant.ts
│   ├── suspend-tenant.ts
│   └── list-tenants.ts
└── index.ts
```

Use cases accept dependencies through explicit protocols. The package never
constructs API clients, reads browser storage, or imports React.

### 5.7 `@emme/api`

Responsibility: backend contracts and typed SDK factories. It represents the
transport boundary, not the complete frontend business domain.

Target tree:

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
│   ├── billing/
│   └── errors/
├── ports/
│   ├── http-client.ts
│   ├── graphql-client.ts
│   └── request-context.ts
├── auth/
├── tenants/
├── clients/
├── appointments/
├── services/
├── staff/
├── payments/
├── billing/
├── integrations/
├── create-api.ts
└── index.ts
```

API tests verify paths, payloads, response parsing, and transport errors using
fake ports. No React hooks or concrete network implementation is allowed.

### 5.8 `@emme/infrastructure`

Responsibility: concrete external adapters and browser capabilities.

Target tree:

```text
packages/infrastructure/src/
├── http/
│   ├── fetch-http-client.ts
│   ├── request-builder.ts
│   ├── api-error.ts
│   ├── timeout.ts
│   ├── retry.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       ├── tenant.interceptor.ts
│       ├── request-id.interceptor.ts
│       ├── error.interceptor.ts
│       └── retry.interceptor.ts
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

Existing fetch, token-storage, and client repository adapters migrate first.
GraphQL, analytics, feature flags, and advanced observability are added when a
real consumer requires them, not as empty placeholders.

Infrastructure tests mock transport and external providers. They test retry,
timeout, error normalization, storage behavior, DTO-to-domain mapping, and
application-port adapters.

### 5.9 `@emme/core`

Responsibility: shared runtime behavior for all application shells.

Target tree:

```text
packages/core/src/
├── auth/
│   ├── auth.types.ts
│   ├── auth-context.tsx
│   ├── auth-provider.tsx
│   ├── use-auth.ts
│   ├── use-current-user.ts
│   └── auth-events.ts
├── tenancy/
│   ├── tenant.types.ts
│   ├── tenant-context.tsx
│   ├── tenant-provider.tsx
│   ├── use-current-tenant.ts
│   ├── tenant-capabilities.ts
│   └── tenant-config.ts
├── access-control/
│   ├── roles.ts
│   ├── scopes.ts
│   ├── permissions.ts
│   ├── policies.ts
│   ├── can.ts
│   ├── PermissionGuard.tsx
│   ├── use-permission.ts
│   └── route-permission.ts
├── runtime/
│   ├── api-context.tsx
│   ├── api-provider.tsx
│   ├── runtime-context.tsx
│   └── runtime-provider.tsx
├── configuration/
│   ├── environment.ts
│   ├── app-config.ts
│   └── runtime-config.ts
├── errors/
│   ├── application-error.ts
│   ├── authorization-error.ts
│   └── error-codes.ts
├── types/
└── index.ts
```

`core` may contain React contexts and hooks because it is the application
runtime layer. It must not call `fetch`, read `localStorage` directly, or
implement business rules. Concrete storage and network behavior comes from
infrastructure and is injected by the app composition root.

### 5.10 `@emme/features`

Responsibility: reusable React business adapters promoted from applications
after genuine reuse.

Target tree:

```text
packages/features/src/
├── appointments/
│   └── shared/
│       ├── components/
│       │   ├── AppointmentCard.tsx
│       │   ├── AppointmentStatusBadge.tsx
│       │   └── AppointmentDate.tsx
│       ├── hooks/
│       ├── mappers/
│       └── index.ts
├── services/
├── clients/
└── index.ts
```

The package cannot contain pages, layouts, app routes, tenant branches, pure
domain rules, framework-independent use cases, or generic UI primitives.
Role-specific workflows remain in the consuming app.

## 6. Application integration design

The `emme-salon-app` plan migrates the current application into this shape:

```text
apps/emme-salon-app/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── router.tsx
│   ├── api.ts
│   ├── query-client.ts
│   ├── route-paths.ts
│   ├── routes/
│   ├── layouts/
│   ├── guards/
│   └── error-boundary/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── ClientsPage.tsx
│   ├── ServicesPage.tsx
│   ├── StaffPage.tsx
│   ├── FinancesPage.tsx
│   ├── AnalyticsPage.tsx
│   └── SettingsPage.tsx
├── features/
│   ├── dashboard/
│   ├── appointments/
│   ├── clients/
│   ├── services/
│   ├── staff/
│   ├── finances/
│   ├── analytics/
│   └── settings/
├── state/
├── config/
├── styles/
└── main.tsx
```

Current-to-target migration rules:

| Current source | Target owner |
|---|---|
| `src/shared/ui/**` | `@emme/ui` for generic primitives; feature/app for business UI |
| `src/api/restClient.ts` | app composition adapter using infrastructure |
| `src/api/apiClientInstance.ts` | app API factory wiring |
| `src/api/queryFactory.ts` | app adapter until a second consumer proves shared reuse |
| `src/app/auth/**` | `@emme/core` for reusable auth/tenant contracts; app for route-specific flow |
| `src/app/config/**` | `@emme/core` shared runtime contracts; app environment wiring |
| `src/features/*/domain/**` | `@emme/domain` when pure and reusable |
| `src/features/*/api/**` | feature query/mutation adapters over `@emme/api` |
| `src/features/*/hooks/**` | app feature by default; `@emme/features` after reuse |
| `src/features/*/mappers/**` | API anti-corruption mapper or feature view mapper |
| form validation | feature `schemas/` built with `@emme/validation` |
| feature permissions | `@emme/core` vocabulary plus feature policy composition |
| app stores | app-local client-only state unless genuinely cross-app |
| pages, layouts, routes | `emme-salon-app` |
| `src/services/cacheService.ts` | infrastructure adapter if reusable, otherwise app integration |

The app composition root wires concrete dependencies:

```text
AppProviders
  ├── QueryClientProvider
  ├── RuntimeProvider
  ├── AuthProvider
  ├── TenantProvider
  ├── PermissionProvider
  ├── I18nProvider
  ├── ThemeProvider
  └── ErrorBoundary
```

The existing HashRouter paths, authentication states, tenant selection, and
E2E behavior must remain compatible during migration.

## 7. Runtime data and error flow

Simple queries may use:

```text
Page/component → feature query hook → @emme/api → infrastructure HTTP → backend
```

Complex operations use:

```text
Page/component
  → feature mutation/use-case hook
  → @emme/application use case
  → application port
  → infrastructure adapter
  → @emme/api operation
  → infrastructure HTTP
  → backend
```

Errors are normalized at the outer boundary and translated at the UI boundary:

```text
network/HTTP error
  → infrastructure ApiError
  → application/domain typed error
  → feature hook result
  → i18n user-facing message
```

Required categories include network/timeout, invalid response, unauthenticated,
forbidden, not found, conflict, business validation, rate limit, and server
failure.

## 8. Security and tenancy

The frontend may attach tenant context to requests, but it must never treat a
local tenant ID as proof of authorization. The backend must resolve membership,
validate access, and enforce tenant isolation on every tenant-scoped operation.

Frontend permission guards are for navigation and user experience only. The
backend remains the security boundary.

No application may contain tenant-specific branches or hard-coded tenant
identifiers.

## 9. Testing and verification

Every implementation plan uses Red → Green → Refactor for new behavior.

Required workspace checks:

```bash
bun run docs:check
bun run i18n:check
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
bun run security:check
bun run test:e2e:mock
```

Package plans also define focused commands, for example:

```bash
bun run --filter @emme/domain test
bun run --filter @emme/application typecheck
bun run --filter @emme/api test
bun run --filter @emme/infrastructure test
```

No test may depend on real credentials or uncontrolled external services.
Infrastructure and API boundaries use protocol-based fakes. Application tests
use fake repositories and services. UI tests use Testing Library. E2E tests
cover critical cross-layer behavior.

## 10. Planned deliverables

The design is followed by one implementation plan per package and one app
integration plan:

```text
docs/superpowers/plans/
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

Each plan is independently readable but references the master order and
upstream package plans. The `features` plan is conditional: it defines the
promotion gate and shared package structure without forcing premature
extraction.

## 11. Scope exclusions

- No pnpm or Turbo migration.
- No implementation of future admin or client product workflows.
- No tenant-specific frontend code.
- No duplication of backend DDD entities as API DTOs.
- No creation of empty enterprise folders without a real consumer.
- No global state replacement unless the state is client-only and genuinely
  shared.

## 12. Success criteria

The migration design is successful when:

1. Every target package has one executable implementation plan.
2. The salon app has one explicit integration plan with current-file mappings.
3. Package boundaries and forbidden imports are unambiguous.
4. Naming and test placement are consistent across packages and apps.
5. Generic UI, validation, test support, domain, application, API,
   infrastructure, core, i18n, and reusable feature boundaries are documented.
6. Current salon routes and behavior remain verifiable during migration.
7. Future apps can consume the libraries without importing salon-app internals.
8. Bun remains the only required workspace and task tool.
