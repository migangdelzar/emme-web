# Repository and Package Structure

> **Status: Canonical current structure.** This page describes the active
> `feat/api-version-contract` topology. Source code is authoritative for files
> not listed in these directory-level summaries.

The three applications are physical, independently deployable application
roots. Their package names match their deployable directory names:
`admin-app`, `client-app`, and `salon-app`.

## Repository root

```text
emme-web/
├── apps/
│   ├── admin-app/
│   ├── client-app/
│   └── salon-app/
├── packages/
│   ├── api/
│   ├── auth/
│   ├── business/
│   ├── core/
│   ├── i18n/
│   ├── infrastructure/
│   ├── kernel/
│   ├── test-support/
│   ├── ui/
│   └── validation/
├── configs/
│   ├── eslint/
│   ├── prettier/
│   ├── typescript/
│   └── vite/
├── deploy/
│   ├── compose/
│   ├── docker/
│   └── kubernetes/
├── e2e/
├── docs/
├── scripts/
├── tasks/
├── package.json
└── bun.lock
```

Apps are composition roots, packages are reusable boundaries, `configs` owns
shared tooling, and `e2e` owns cross-app browser journeys. No package may
import an app and no app may import another app.

## Package source trees

### `@emme/kernel`

```text
packages/kernel/src/
├── errors/
├── result/
├── time/
├── types/
└── index.ts
```

Pure primitives include typed errors, `Result`/`Ok`/`Err`, branded IDs, and
clock protocols. Kernel may not import React, browser APIs, transport clients,
DTOs, application code, or infrastructure.

### `@emme/business`

```text
packages/business/src/
├── __tests__/
├── appointments/
│   ├── application/
│   └── domain/
├── clients/
│   ├── application/
│   └── domain/
├── services/
│   └── domain/
└── index.ts
```

Business is framework-free. Capabilities own their internal domain and
application layers. It contains rules, types, use cases, ports, and business
DTOs—not React pages, browser adapters, or app routes.

### `@emme/api`

```text
packages/api/src/
├── __tests__/
├── appointments/
├── auth/
├── client/
├── clients/
├── common/
├── configuration/
├── contracts/
│   ├── appointments/
│   ├── auth/
│   ├── clients/
│   ├── common/
│   ├── errors/
│   ├── services/
│   └── tenants/
├── integrations/
│   ├── calendar-sync/
│   ├── google-oauth/
│   └── google-sheets/
├── ports/
├── services/
├── tenant/
├── testing/
└── index.ts
```

API owns transport contracts, request context, parsing, typed API errors, and
operation-facing protocols. It does not own concrete browser I/O, storage,
React providers, or business policy.

### `@emme/infrastructure`

```text
packages/infrastructure/src/
├── api/
├── auth/
├── http/
├── platform/
├── storage/
├── telemetry/
└── index.ts
```

Infrastructure owns concrete HTTP, auth, tenant/session storage, platform
integration, telemetry, retries, cancellation, and provider mechanics. It
implements protocols from API/application boundaries and does not decide
business policy.

### `@emme/core` and `@emme/auth`

```text
packages/core/src/
├── access-control/
├── auth/
├── configuration/
├── errors/
├── feature-flags/
├── permissions/
├── routing/
├── runtime/
├── tenancy/
└── index.ts

packages/auth/src/
├── __tests__/
├── components/
└── index.ts
```

`@emme/core` owns shared runtime behavior: session/auth context, tenancy,
permissions, configuration, routing primitives, feature flags, and normalized
errors. `@emme/auth` owns the shared `AuthGate` boundary only. Login and
tenant-selection pages remain app-local.

### `@emme/i18n`, `@emme/validation`, and `@emme/test-support`

```text
packages/i18n/src/
├── __tests__/
├── data/
├── formatters/
├── testing/
└── index.ts

packages/validation/src/
├── __tests__/
├── common/
├── errors/
├── helpers/
├── types/
└── index.ts

packages/test-support/src/
├── fakes/
├── fixtures/
├── providers/
└── index.ts
```

`@emme/i18n` owns shared catalogs, translation runtime, and formatters.
`@emme/validation` owns generic schema helpers. `@emme/test-support` is
test-only and owns deterministic fakes, fixtures, and providers.

### `@emme/ui`

```text
packages/ui/src/
├── __tests__/
├── components/
├── data-display/
├── date-time/
├── feedback/
├── forms/
├── hooks/
├── lib/
├── native/
├── theme/
├── web/
└── index.ts
```

`@emme/ui` uses Component-Driven Development. Components are generic,
accessible, and business-agnostic. The package must not import API, business,
application, infrastructure, feature, or app code.

## App source trees

All apps use `src/app` for composition and `src/features` for app-owned
workflows. The complete salon feature structure is documented in
[app shell structure](app-shell-structure.md) and
[feature module structure](feature-module-structure.md).

```text
apps/salon-app/src/
├── api/
├── app/
├── features/
├── hooks/
├── services/
├── shared/
├── theme/
└── main.tsx

apps/client-app/src/
├── app/
├── features/
├── theme/
└── main.tsx

apps/admin-app/src/
├── app/
├── features/
└── main.tsx
```

## Historical names

The following names are historical migration sources, not current ownership
destinations:

```text
packages/domain
packages/application
packages/features
@emme/domain
@emme/application
@emme/features
apps/emme-salon-app
apps/platform-admin-app
```

Use [`architecture-patterns.md`](architecture-patterns.md) and
[`package-ownership.md`](package-ownership.md) for the current replacement
rules. Historical ADRs remain in the repository because they explain why the
topology changed; they do not authorize reintroducing those names.

## Structure checklist

- [ ] Every top-level directory has one documented owner.
- [ ] Apps are independently buildable and deployable.
- [ ] Salon product presentation remains under `apps/salon-app/src/features`.
- [ ] Client/admin features remain local to their respective apps.
- [ ] Reusable business behavior remains under `@emme/business/<capability>`.
- [ ] No app-to-app or package-to-app imports exist.
- [ ] Transitional global business packages are not current dependencies.
