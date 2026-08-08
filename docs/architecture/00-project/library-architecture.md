# Shared Library Architecture

The workspace uses Hexagonal Architecture across three application shells.
The business boundary is deliberately split into pure domain logic and
application orchestration.

```text
packages/
├── ui/              # reusable visual components
├── core/            # auth, tenancy, permissions, runtime
├── domain/          # pure entities, rules, and business models
├── application/     # use cases and required ports
├── api/             # typed DTOs, routes, HTTP ports, API adapters
├── infrastructure/  # fetch, auth storage, browser and external adapters
├── i18n/            # typed localization resources
└── test-support/    # test-only shared fixtures
```

Dependency direction:

```text
React feature hooks
        ↓
@emme/application
        ↓
@emme/domain + application ports
        ↑
@emme/api adapters
        ↓
@emme/infrastructure
        ↓
Backend API
```

`@emme/domain` never imports React, API DTOs, HTTP, storage, Apollo, or browser
APIs. `@emme/application` never creates concrete dependencies; it receives
repository and service ports. `@emme/api` maps transport payloads and defines
the HTTP port. `@emme/infrastructure` implements concrete HTTP and browser
behavior. Apps wire these pieces in `AppProviders.tsx`.

The active app is `apps/emme-salon-app`, the tenant-owner/staff application.
`platform-admin-app` and `client-app` remain future shells until their product
requirements are implemented.
