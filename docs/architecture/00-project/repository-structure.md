# Repository and Package Structure

This is the canonical target tree. The compact root tree is an index; the
package trees below are normative implementation and review checklists.
`apps/emme-salon-app` and package name `@emme/emme-salon-app` are preserved;
“salon app” is only the conceptual role name.

## Repository root

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

Apps are composition roots, packages are reusable boundaries, `configs` owns
shared tooling, and root `e2e` owns cross-app browser journeys. No package may
import an app.

## `@emme/kernel`

```text
packages/kernel/src/
├── result/{Result,Ok,Err,index}.ts
├── errors/{DomainError,ValidationError,index}.ts
├── types/{Brand,EntityId,Nullable}.ts
├── time/{Clock,SystemClock,index}.ts
└── index.ts
```

Kernel is framework-independent. It contains only stable primitives and may not
import React, browser APIs, transport clients, DTOs, application code, or
infrastructure.

## `@emme/ui`

```text
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
```

Every component directory has the same complete shape:

```text
Component/
├── Component.tsx
├── Component.test.tsx
├── Component.types.ts       # optional
└── index.ts
```

The package is generic: business names and feature/API/application/
infrastructure dependencies are forbidden.

## `@emme/core`

```text
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
```

Core owns shared application runtime behavior. It may contain React providers,
but concrete network and storage behavior is injected at an app composition
root.

## `@emme/i18n`

```text
packages/i18n/src/
├── setup/{createI18n,I18nProvider,language-detector}.ts[x]
├── locales/{en,es}/{common,navigation,errors}.json
├── formatters/{formatCurrency,formatDate,formatTime,formatPhone}.ts
├── types/translation.types.ts
└── index.ts
```

Shared catalogs remain here; feature namespaces stay with their vertical
feature and app-only workflow copy stays with the owning app.

## `@emme/api`

```text
packages/api/src/
├── client/{ApiClient,ApiRequest,ApiResponse,index}.ts
├── graphql/{generated/{graphql,schema-types,operations},scalars,pagination,graphql.types}.ts
├── contracts/{ApiError,PageInfo,Cursor,index}.ts
├── auth/{AuthToken,AuthSession}.ts
├── tenant/TenantRequestContext.ts
└── index.ts
```

API owns abstract communication contracts, envelopes, pagination, generated
types, and contract validation. It does not own concrete `fetch`, storage,
React providers, or feature use cases.

## `@emme/infrastructure`

```text
packages/infrastructure/src/
├── apollo/{createApolloClient,cache,index}.ts
├── apollo/links/{authLink,tenantLink,errorLink,retryLink}.ts
├── auth/{AuthTokenStorage,AuthService,index}.ts
├── tenant/{TenantResolver,TenantStorage,index}.ts
├── storage/{LocalStorageAdapter,SecureStorageAdapter,index}.ts
├── telemetry/{AnalyticsAdapter,ErrorTrackingAdapter,index}.ts
└── index.ts
```

Infrastructure owns global technical adapters. A repository that implements a
feature application port remains in that feature's `infrastructure/` folder.

## `@emme/features`

```text
packages/features/src/
├── appointments/
├── catalog/
├── customers/
├── staff/
├── payments/
├── communications/
├── integrations/
├── tenant-configuration/
├── onboarding/
├── analytics/
├── __tests__/package-boundary.test.ts
└── index.ts
```

Every module uses the complete Hexagonal structure in
[feature module structure](feature-module-structure.md). The package barrel
exports feature barrels only; it does not recreate global domain, application,
or validation layers.

## `@emme/test-support`

```text
packages/test-support/src/
├── fakes/
│   ├── fake-http-client.ts
│   ├── fake-http-client.test.ts
│   ├── fake-clock.ts
│   ├── fake-clock.test.ts
│   ├── fake-storage.ts
│   └── fake-storage.test.ts
├── fixtures/
│   ├── appointment.fixture.ts
│   ├── customer.fixture.ts
│   ├── service.fixture.ts
│   └── tenant.fixture.ts
├── providers/
│   ├── test-wrapper.tsx
│   ├── test-query-provider.tsx
│   ├── test-auth-provider.tsx
│   └── test-tenancy-provider.tsx
├── handlers/
│   ├── auth.handlers.ts
│   ├── tenant.handlers.ts
│   ├── appointment.handlers.ts
│   ├── customer.handlers.ts
│   └── service.handlers.ts
├── setup/
│   ├── setup-tests.ts
│   └── reset-test-state.ts
├── __tests__/provider-contracts.test.tsx
└── index.ts
```

Test support is test-only. Non-trivial fakes are tested beside their source;
simple local record-and-return fakes may remain beside the consuming test.

## Structure checklist

- [ ] Every top-level directory has one documented owner.
- [ ] All eight package trees are represented without omitted technical layers.
- [ ] Each feature uses the complete vertical structure and exports one feature
      barrel.
- [ ] App-only routes and workflows stay under `apps/<app>/src/features`.
- [ ] No app-to-app or package-to-app imports exist.
- [ ] Transitional global business packages are removed only after consumers
      migrate to feature public exports.
