# Shared Library Architecture (Historical)

> **Status: Historical / superseded.** This page preserves the 2026-08-07
> global technical-layer topology for migration archaeology only. It conflicts
> with the canonical vertical-feature model and is not normative. Use
> [repository structure](repository-structure.md),
> [package ownership](package-ownership.md),
> [dependency rules](dependency-rules.md), and
> [feature module structure](feature-module-structure.md).

## Superseded package topology

The previous workspace model split reusable business behavior into global
technical packages:

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

Its dependency direction was:

```text
React feature hooks
        |
        v
@emme/application
        |
        v
@emme/domain + application ports
        ^
        |
@emme/api adapters
        |
        v
@emme/infrastructure
        |
        v
Backend API
```

## Canonical replacement

The target has eight different boundaries: `@emme/kernel`, `@emme/ui`,
`@emme/core`, `@emme/i18n`, `@emme/api`, `@emme/infrastructure`,
`@emme/features`, and `@emme/test-support`. Domain rules, use cases, ports,
business validation, feature transport mapping, feature adapters, reusable
presentation, translations, and tests are colocated inside each vertical
feature. Existing global business packages are migration sources only.

The active physical apps are `apps/salon-app`, `apps/client-app`, and
`apps/admin-app`; they are independent composition roots implemented by their
portfolio plans.
