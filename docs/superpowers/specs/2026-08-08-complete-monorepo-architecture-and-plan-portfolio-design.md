# Complete Monorepo Architecture and Plan Portfolio Design

| Field | Value |
|---|---|
| Status | Approved — corrected to preserve the canonical detailed structure |
| Date | 2026-08-08 |
| Branch | `feat/api-version-contract` |
| Repository | `emme-web` |
| Package manager | Bun workspaces |
| Runtime | React 19, TypeScript 5, Vite, Vitest, Playwright |

## 1. Purpose

Define the complete target architecture for the EMME frontend monorepo and
split the work into independently executable plans. The target includes the
salon, client, and platform-admin applications; reusable shared packages;
vertical business feature modules; architecture documentation; and a test
strategy that covers every module at the appropriate test layer.

This design extends the existing package-first migration work on the current
branch. It changes the ownership of business code from global technical
packages to vertical feature modules while preserving the current Bun
workspace, application behavior, backend contracts, and test tooling as
compatibility constraints.

## 2. Goals and non-goals

### Goals

- Make generic UI reusable without business dependencies.
- Organize reusable business behavior by feature/domain.
- Apply Hexagonal Architecture inside complex business modules.
- Keep application workflows and role-specific pages local to each app.
- Define naming, folder, export, dependency, and testing conventions in
  `docs/architecture`.
- Plan the complete future monorepo, including all currently documented studio,
  client, and admin requirements.
- Make every package and feature independently testable with protocol-based
  dependencies and deterministic test doubles.
- Preserve backend authority for authorization, tenant isolation, validation,
  persistence, and business invariants.

### Non-goals

- No frontend deployment per salon tenant.
- No pnpm or Turbo migration; Bun remains the workspace tool.
- No invention of backend endpoints. Missing backend capabilities are tracked
  as explicit contracts or dependencies in the relevant plan.
- No requirement to expose every business feature from every application.
- No immediate implementation in this design phase.

## 3. Current context and reconciliation

The current branch already contains a partial extraction into:

```text
packages/
  api/
  application/
  core/
  domain/
  features/
  i18n/
  infrastructure/
  test-support/
  ui/
  validation/
```

The current `@emme/domain` and `@emme/application` packages are migration
sources, not the final home for business behavior. Domain rules, use cases,
ports, and feature adapters will move into their owning vertical module under
`packages/features/src/<feature>`.

The current `@emme/validation` package is transitional. API contract schemas
move to `@emme/api/contracts`; business schemas move into the owning feature;
and app-specific form schemas remain with the app workflow. Shared schema
helpers may remain only if they have no business ownership and are explicitly
documented.

Existing `2026-08-07` migration plans remain historical artifacts. The new
`2026-08-08` plan portfolio supersedes their business-ownership decisions for
future work without rewriting history.

## 4. Target repository structure

```text
emme-web/
├── apps/
│   ├── platform-admin-app/
│   ├── emme-salon-app/
│   └── client-app/
├── packages/
│   ├── kernel/
│   ├── ui/
│   ├── core/
│   ├── i18n/
│   ├── api/
│   ├── infrastructure/
│   ├── features/
│   └── test-support/
├── configs/
│   ├── eslint/
│   ├── typescript/
│   ├── prettier/
│   └── vite/
├── e2e/
├── docs/
├── scripts/
├── tasks/
├── package.json
└── bun.lock
```

The physical salon application remains `apps/emme-salon-app` and its package
name remains `@emme/emme-salon-app`. `salon-app` is the conceptual role name in
architecture documents.

The root tree is only the index. The architecture handbook must preserve the
canonical detailed structures below rather than replacing them with summaries.
Those structures are normative checklists for implementation and review.

### Canonical package structures

```text
packages/kernel/src/
├── result/{Result,Ok,Err,index}.ts
├── errors/{DomainError,ValidationError,index}.ts
├── types/{Brand,EntityId,Nullable}.ts
├── time/{Clock,SystemClock,index}.ts
└── index.ts

packages/ui/src/
├── primitives/{Button,Input,Textarea,Select,Checkbox,Radio,Switch,Badge,Avatar,Spinner}/
├── layout/{Stack,Grid,Container,Page,SplitPane}/
├── forms/{Form,FormField,FormLabel,FormError,FormActions}/
├── data-display/{Table,DataGrid,EmptyState,StatCard,Pagination}/
├── feedback/{Alert,Toast,Skeleton,ErrorState,LoadingState}/
├── navigation/{Tabs,Breadcrumbs,Sidebar,Menu,Stepper}/
├── overlays/{Modal,Drawer,ConfirmDialog,Popover}/
├── date-time/{DatePicker,DateRangePicker,TimePicker,Calendar}/
├── hooks/{useMediaQuery,useDisclosure,useControllableState}.ts
├── theme/{tokens,colors,typography,spacing}.ts
├── icons/
├── styles/
├── web/
├── native/
├── ui.types.ts
└── index.ts

packages/core/src/
├── auth/{AuthProvider,AuthContext,useAuth,auth.types,index}.ts[x]
├── tenant/{TenantProvider,TenantContext,useTenant,tenant.types,index}.ts[x]
├── permissions/{PermissionProvider,useCan,PermissionGuard,permissions.types,index}.ts[x]
├── configuration/{AppConfig,ModuleConfig,defineAppConfig,defineModule,index}.ts
├── errors/{ErrorBoundary,ErrorProvider,normalizeError}.ts[x]
├── feature-flags/{FeatureFlagProvider,useFeatureFlag,feature-flags.types}.ts[x]
├── routing/
├── logging/
└── index.ts

packages/i18n/src/
├── setup/{createI18n,I18nProvider,language-detector}.ts[x]
├── locales/{en,es}/{common,navigation,errors}.json
├── formatters/{formatCurrency,formatDate,formatTime,formatPhone}.ts
├── types/translation.types.ts
└── index.ts

packages/api/src/
├── client/{ApiClient,ApiRequest,ApiResponse,index}.ts
├── graphql/{generated/{graphql,schema-types,operations},scalars,pagination,graphql.types}.ts
├── contracts/{ApiError,PageInfo,Cursor,index}.ts
├── auth/{AuthToken,AuthSession}.ts
├── tenant/TenantRequestContext.ts
└── index.ts

packages/infrastructure/src/
├── apollo/{createApolloClient,cache,index}.ts
├── apollo/links/{authLink,tenantLink,errorLink,retryLink}.ts
├── auth/{AuthTokenStorage,AuthService,index}.ts
├── tenant/{TenantResolver,TenantStorage,index}.ts
├── storage/{LocalStorageAdapter,SecureStorageAdapter,index}.ts
├── telemetry/{AnalyticsAdapter,ErrorTrackingAdapter,index}.ts
└── index.ts
```

Each component directory uses `Component.tsx`, `Component.test.tsx`, optional
`Component.types.ts`, and `index.ts`. The handbook must show the complete
appointment module, including `domain/entities`, `domain/value-objects`,
`domain/policies`, `domain/services`, `domain/errors`, application
`commands/queries/ports/dto`, API `queries/mutations/fragments/mappers`,
feature infrastructure, validation schemas, presentation components and view
models, feature translations, and test fixtures.

### Canonical app workflow structures

The handbook must show the role-specific trees exactly as ownership examples:

```text
apps/emme-salon-app/src/features/appointments/{calendar,manage,availability}/
apps/emme-salon-app/src/features/{catalog,customers,staff,settings,onboarding,analytics,integrations}/

apps/client-app/src/features/
├── booking/{BookAppointmentPage,ServiceSelectionStep,DateSelectionStep,TimeSelectionStep,BookingConfirmation,useBookingFlow,booking.schema}.tsx
├── my-appointments/{MyAppointmentsPage,AppointmentDetailsPage,useMyAppointments,appointmentFilters.schema}.tsx
└── cancellation/{CancelAppointmentDialog,useCancelOwnAppointment}.tsx

apps/platform-admin-app/src/features/
├── search/{PlatformAppointmentsPage,TenantAppointmentFilters,usePlatformAppointments}.tsx
└── audit/{AppointmentAuditPage,AppointmentAuditTimeline,useAppointmentAudit}.tsx
```

Every app feature also documents `routes.tsx`, `navigation.ts`,
`permissions.ts`, `module.ts`, and its composition-root registration. The
handbook must include `defineAppConfig`/`defineModule` examples, dependency
diagrams, validation-layer diagrams, and test-location checklists.

## 5. Package ownership

### `@emme/kernel`

`@emme/kernel` is a deliberate name for the smallest framework-independent
shared layer. It is not a framework convention or runtime requirement.

It owns:

- `Result`, `Ok`, and `Err` primitives;
- typed domain/application errors;
- branded IDs, nullable types, and other stable primitives;
- clock protocols and framework-free time abstractions.

It must not import React, React DOM, browser APIs, HTTP clients, API DTOs,
Apollo, application code, or infrastructure.

`@emme/core` is intentionally separate: core owns application runtime concerns,
while kernel owns pure primitives. `@emme/shared-kernel` is the conceptual DDD
term but is not the package name.

### `@emme/ui`

Owns generic visual components, design tokens, accessibility behavior, generic
layout/forms/data-display/feedback/navigation/overlay/date-time components,
generic hooks, icons, and styles.

It must never contain or import `Appointment`, `Salon`, `Tenant`, `Customer`,
`Payment`, `Booking`, or any feature/API/application/infrastructure code.

Web and native implementations share tokens, accessibility rules, and public
component contracts where practical. DOM-specific implementations are kept
behind a web boundary and are not forced into React Native.

The package boundary is represented explicitly:

```text
packages/ui/src/
├── primitives/
├── layout/
├── forms/
├── data-display/
├── feedback/
├── navigation/
├── overlays/
├── date-time/
├── hooks/
├── theme/
├── web/
├── native/
└── index.ts
```

The current repository implements the web side. The native directory and
platform export contract are planned extension points; they do not require a
React Native app in the first migration slice.

### `@emme/core`

Owns cross-cutting application runtime behavior:

- authentication and session state;
- tenant context and tenant resolution contracts;
- frontend permission checks and guards;
- runtime configuration and module registration;
- routing contracts;
- error boundaries and normalized presentation errors;
- logging and feature-flag providers.

Frontend permissions improve user experience only. Backend authorization and
tenant isolation remain mandatory.

### `@emme/i18n`

Owns the translation engine, shared catalogs, locale selection, providers,
shared formatters, and translation test providers. Feature-specific namespaces
remain in their feature module; app-specific workflow copy remains with the
app when it is not reusable.

### `@emme/api`

Owns the abstract communication boundary:

- HTTP and transport protocols;
- shared API errors and response envelopes;
- API contract validation;
- tenant request context and auth session contracts;
- pagination/cursor types;
- generated or shared backend types;
- feature capability contracts exposed through the public API boundary.

It does not own concrete `fetch`, browser storage, React hooks, React Query,
Apollo React providers, or feature-specific business use cases.

Feature queries, mutations, fragments, mappers, and capability composition are
owned by the feature that uses them.

### `@emme/infrastructure`

Owns concrete technical adapters:

- HTTP implementation and retry/error behavior;
- auth token and session storage;
- tenant storage/resolution adapters;
- browser storage and secure-storage boundaries;
- telemetry and error tracking;
- global external-provider clients.

Feature-specific repository implementations remain in the relevant feature
module when they implement that feature's application ports.

### `@emme/features`

Contains reusable vertical business modules. Each feature is internally
structured and exposes public behavior through its own barrel and the package
barrel. It must not become a second global application or domain layer.

### `@emme/test-support`

Owns test-only providers, fakes, factories, fixtures, handlers, and setup. It
must not be a production runtime dependency.

## 6. Vertical feature structure

The reusable feature package uses this shape:

```text
packages/features/src/<feature>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── policies/
│   ├── services/
│   ├── errors/
│   └── index.ts
├── application/
│   ├── commands/
│   ├── queries/
│   ├── ports/
│   ├── dto/
│   └── index.ts
├── api/
│   ├── queries/
│   ├── mutations/
│   ├── fragments/
│   ├── mappers/
│   └── index.ts
├── infrastructure/
├── validation/
├── presentation/
│   ├── components/
│   ├── hooks/
│   └── view-models/
├── i18n/
├── test/
│   ├── fixtures/
│   ├── domain/
│   └── application/
└── index.ts
```

The domain and application folders remain React-free. Infrastructure depends
on protocols and implements concrete adapters. Presentation may use React,
`@emme/ui`, `@emme/core`, and `@emme/i18n`, but it does not contain app routes
or role-specific page workflows.

The initial shared module inventory is:

| Module | Responsibility |
|---|---|
| `appointments` | lifecycle, availability, booking, cancellation, rescheduling, statuses, policies |
| `catalog` | services, prices, durations, active state, design catalog contracts |
| `customers` | customer identity/profile and tenant-scoped customer behavior |
| `staff` | staff profiles, scheduling ownership, and staff contracts |
| `payments` | totals, deposits, payment state, refund contracts, provider ports |
| `communications` | chat, messages, notifications, reminders, AI interaction boundaries |
| `integrations` | Google Calendar/Sheets, OAuth, and external workspace contracts |
| `tenant-configuration` | profile, hours, booking policy, and preferences |
| `onboarding` | reusable onboarding state and capability contracts |
| `analytics` | dashboard, finance, and reporting read-model contracts |

An app-only feature follows the same internal separation when its complexity
requires it, but remains under `apps/<app>/src/features` until a second app
needs the behavior. Promotion requires demonstrated reuse and a dedicated plan.

## 7. App shells and workflow ownership

Each app is a composition root:

```text
apps/<app>/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── app-config.ts
│   ├── router.tsx
│   ├── routes/
│   ├── layouts/
│   └── error-boundary/
├── features/
├── config/
├── theme/
└── main.tsx
```

Apps own routes, layouts, navigation, branding, app-specific forms and
filters, role-specific permission composition, and workflow orchestration.
They instantiate concrete dependencies only in composition roots.

### Salon app

The salon app serves tenant owners and staff. It consumes shared appointments,
catalog, customers, staff, payments, integrations, tenant-configuration,
onboarding, and analytics modules. Its local workflows include the calendar,
appointment management, availability management, client management, settings,
onboarding, dashboard, finances, and staff-facing integrations.

### Client app

The client app serves customers of a tenant. It consumes auth/tenancy/core and
shared customer, catalog, appointments, payments, communications,
integrations, and notification contracts. Its local workflows include profile,
discovery, booking, appointment history/details, cancellation/rescheduling,
web chat, and calendar-related views.

### Platform-admin app

The platform-admin app owns platform-specific workflows for tenant lifecycle,
feature flags, memberships/access, audit/operations, provisioning, and
subscriptions. It consumes shared API, core, UI, i18n, and relevant feature
contracts but does not force platform-only pages into reusable tenant features.

## 8. Dependency and boundary rules

```text
feature domain         → @emme/kernel
feature application    → feature domain + @emme/kernel
feature API            → @emme/api + feature contracts/mappers
feature infrastructure → @emme/api + feature application ports
feature presentation   → @emme/ui + @emme/core + @emme/i18n + feature APIs
apps                   → selected features + core + ui + infrastructure + i18n
```

Required invariants:

1. Domain code never imports React, browser APIs, transport clients, storage,
   API DTOs, infrastructure, or app code.
2. Application code depends on protocols and receives dependencies from the
   outside; it never constructs concrete adapters.
3. API code describes transport contracts and does not implement browser or
   provider behavior.
4. Infrastructure implements ports and external behavior but does not decide
   business policy.
5. UI has no business, API, application, infrastructure, or app dependency.
6. Features communicate through public exports and stable contracts, never
   private paths.
7. Apps never import another app's internals.
8. Tenant context is explicit at API/application boundaries and is never
   inferred from arbitrary UI state.
9. Expected domain/application outcomes use `Result<T, E>` values, with typed
   feature errors represented by `E`; raw transport errors do not leak into
   presentation.
10. Unexpected programmer/configuration faults are surfaced through the core
    error boundary and logged without exposing secrets.

## 9. Naming and file conventions

| Item | Convention | Example |
|---|---|---|
| package directory | kebab-case | `test-support` |
| package name | `@emme/<kebab-case>` | `@emme/test-support` |
| feature/layer directory | lowercase kebab-case | `tenant-configuration` |
| React component directory | PascalCase | `AppointmentStatusBadge/` |
| React component file | PascalCase | `AppointmentStatusBadge.tsx` |
| component types | PascalCase file suffix | `AppointmentStatusBadge.types.ts` |
| domain/application module | kebab-case | `cancel-appointment.ts` |
| hook | `use` + PascalCase symbol | `useAppointments.ts` |
| class/entity/type symbol | PascalCase | `Appointment`, `AppointmentId` |
| function/constant symbol | camelCase | `calculateAppointmentTotal` |
| schema module | kebab-case with `.schema` suffix | `book-appointment-input.schema.ts` |
| colocated test | source name plus `.test` | `cancel-appointment.test.ts` |
| cross-module test | `src/__tests__/` | `src/__tests__/package-boundary.test.ts` |
| fixture | explicit `.fixture` suffix | `appointment.fixture.ts` |
| public barrel | `index.ts` | `appointments/index.ts` |

Generic names such as `utils.ts`, `helpers.ts`, and `common.ts` are not used
unless the file has one clearly documented responsibility. Public imports use
package or feature barrels; consumers do not import private implementation
paths.

## 10. Testing architecture and TDD

Every implementation task follows Red → Green → Refactor → Verify. A plan
cannot mark a task complete without focused tests and applicable regression
checks.

| Layer | Location | Required behavior |
|---|---|---|
| kernel/domain | colocated unit tests | rules, value objects, invariants, typed errors |
| application | colocated unit tests | orchestration and protocol calls using fakes |
| validation | colocated schema tests | accepted, rejected, normalized, and boundary inputs |
| API | contract/mapper tests | request/response shapes, parsing, pagination, errors, tenant context |
| infrastructure | adapter tests | deterministic HTTP, storage, retry, and provider behavior |
| presentation | colocated component/hook tests | observable states, accessibility semantics, keyboard/focus behavior |
| package boundaries | `src/__tests__/` | exports, dependency direction, forbidden imports |
| integration | feature/app `__tests__/` | real package composition with fake transport |
| browser | root `e2e/` | critical mocked and real-backend journeys |
| CI quality | workflows/scripts | typecheck, lint, docs, i18n, build, coverage, security, E2E |

Test doubles are protocol-based and deterministic. Unit tests do not call real
HTTP, storage, Google, payment, messaging, AI, or backend services. Shared
fakes with non-trivial behavior live in `@emme/test-support`; simple local
record-and-return fakes remain near the test.

Every module plan must cover success, empty, boundary, validation failure,
transport failure, offline/retry, duplicate action, permission denied, tenant
mismatch, loading/error UI, and cleanup/isolation behavior when applicable.

## 11. Plan portfolio

The implementation plan phase creates the following linked documents under
`docs/superpowers/plans/`. Each plan contains current inventory, target tree,
migration matrix, public exports, forbidden dependencies, ordered TDD tasks,
test doubles, verification commands, acceptance criteria, and definition of
done.

| Plan | Scope |
|---|---|
| `00` | Master program index, dependency graph, traceability, and status dashboard |
| `01` | Workspace governance, package exports, configs, forbidden-import checks, migration cleanup |
| `02` | `@emme/kernel` and shared test conventions |
| `03` | `@emme/test-support`, fakes, fixtures, providers, handlers, and setup |
| `04` | `@emme/ui`, generic components, tokens, accessibility, and web/native boundary |
| `05` | `@emme/core`, auth, tenancy, permissions, runtime, routing, and errors |
| `06` | `@emme/i18n`, catalogs, feature namespaces, formatters, and locale tests |
| `07` | `@emme/api`, transport protocols, contracts, errors, tenant context, and types |
| `08` | `@emme/infrastructure`, HTTP, auth/session storage, tenant, telemetry, and adapters |
| `09` | `appointments` vertical module |
| `10` | `catalog` vertical module |
| `11` | `customers` vertical module |
| `12` | `staff` vertical module |
| `13` | `payments` vertical module |
| `14` | `communications` vertical module |
| `15` | `integrations` vertical module |
| `16` | `tenant-configuration` and `onboarding` modules |
| `17` | `analytics` module |
| `18` | `emme-salon-app` shell and studio workflows |
| `19` | `client-app` shell and `FR-WC001`–`FR-WC019` workflows |
| `20` | `platform-admin-app` shell and `FR-WA001`–`FR-WA016` workflows |
| `21` | cross-app E2E, accessibility, security, performance, CI, and release verification |

Execution order:

```text
01 → 02 → 03
          ├→ 04
          ├→ 05
          ├→ 06
          ├→ 07 → 08
          └→ 09–17
                    └→ 18–20
                              └→ 21
```

Plans `04`–`08` and independent feature plans may run in parallel after their
prerequisites. App plans depend on the feature modules they consume.

## 12. Architecture handbook

The durable architecture reference will live under `docs/architecture`:

```text
docs/architecture/
├── README.md
├── 00-project/
│   ├── repository-structure.md
│   ├── package-ownership.md
│   ├── dependency-rules.md
│   ├── naming-conventions.md
│   ├── feature-module-structure.md
│   ├── app-shell-structure.md
│   ├── testing-architecture.md
│   ├── web-native-ui-boundary.md
│   └── documentation-and-decisions.md
├── 01-runtime/
│   ├── auth-and-tenancy.md
│   ├── permissions.md
│   ├── configuration.md
│   └── error-handling.md
├── 02-frontend/
│   ├── app.md
│   ├── feature.md
│   ├── module.md
│   ├── state-management.md
│   ├── i18n.md
│   ├── react.md
│   ├── testing.md
│   └── vite.md
├── 03-integration/
│   ├── contracts.md
│   ├── api-and-infrastructure.md
│   ├── feature-adapters.md
│   └── end-to-end.md
├── 04-delivery/
│   ├── ci.md
│   ├── release.md
│   └── quality-gates.md
└── 05-operations/
    ├── observability.md
    ├── security.md
    └── reliability.md
```

The handbook defines the complete tree, ownership, naming, exports, dependency
rules, feature/app templates, runtime boundaries, testing lanes, and decision
records. Each execution plan links to the handbook pages it implements or
enforces, and the handbook links to the plan that establishes each rule.

## 13. Requirement traceability

- Studio requirements `FR-WS###` map to the shared feature plans and plan `18`.
- Client requirements `FR-WC###` map to the shared appointment/catalog/customer/
  payment/communication/integration plans and plan `19`.
- Admin requirements `FR-WA###` map to core/API contracts and plan `20`.
- Existing studio use cases remain the behavioral source for the current app.
- Client and admin requirements and use-case indexes are the source for future
  app workflows.
- Backend capability gaps are recorded as explicit dependencies; plans do not
  fabricate endpoints or provider behavior.

## 14. Verification and definition of done

The complete program is done when:

- all package and app boundaries match the handbook;
- business code is owned by vertical modules or explicitly app-local;
- generic UI has no business dependencies;
- all public behavior is exported through documented barrels;
- all module plans have completed TDD tasks and no skipped tests;
- package boundary tests pass;
- typecheck, lint, unit tests, integration tests, build, docs, i18n, security,
  and applicable E2E checks pass;
- mocked E2E is deterministic and real E2E runs when configured credentials and
  endpoints are available;
- tenant and permission failure states are covered;
- architecture docs and plan statuses are updated with verification evidence;
- changes are committed in logical conventional commits and pushed to the
  feature branch.

## 15. Open decisions

There are no blocking design questions remaining from brainstorming. The
implementation plans must still inventory actual backend capabilities before
adding any API adapter and must record any newly discovered external contract
or product ambiguity as a plan dependency rather than silently guessing.
