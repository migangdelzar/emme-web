# Architecture Patterns and Scope

This project uses four complementary patterns at different scopes. They are
not four independent application architectures and should not be applied as
four mandatory folder systems.

## Pattern map

| Pattern | Scope | Project usage |
| --- | --- | --- |
| FSD-inspired feature slicing | Frontend apps | Organizes each app by shell and vertical business capability. It is not canonical FSD with mandatory `entities`, `widgets`, and `pages` layers. |
| Hexagonal / Clean Architecture | Business and integration boundaries | Separates framework-free domain/application behavior from API contracts and concrete infrastructure adapters. |
| Pragmatic capability-oriented DDD | `@emme/business` and feature boundaries | Groups rules and use cases by capabilities such as appointments, clients, and services. |
| Component-Driven Development | `@emme/ui` | Builds generic accessible components independently, then composes them inside app features. |

Use this description in technical documentation:

> EMME uses FSD-inspired vertical feature slices in the frontend,
> Hexagonal/Clean boundaries for shared business and infrastructure,
> pragmatic capability-oriented DDD for business modeling, and
> Component-Driven Development for the shared UI system.

Do not describe the project as pure FSD, pure Hexagonal Architecture, pure DDD,
or pure CDD. Each pattern governs a different boundary.

## FSD-inspired frontend structure

The frontend is organized by deployable application and user outcome:

```text
apps/<app>/src/
├── app/                         # composition root, providers, routing, layouts
├── features/                    # app-owned vertical capabilities
├── theme/                       # app-specific global styling when needed
└── main.tsx                     # browser entry point
```

An app feature may contain only the responsibilities it needs:

```text
features/<capability>/
├── pages/                       # route-level composition when needed
├── components/                 # capability-specific UI
├── hooks/                      # React/query/workflow orchestration
├── api/                        # feature query and mutation composition
├── mappers/                    # transport/application output to view models
├── domain/                     # app-only rules/types when justified
├── application/                # app-only orchestration/ports when justified
├── infrastructure/             # adapter for a local application port
├── presentation/              # capability-specific presentation
├── state/                      # local workflow/UI state when needed
├── validation/                 # form, URL, and filter schemas
├── shared/                     # feature-local reusable pieces
└── index.ts                    # public feature boundary
```

Rules:

- features deliver coherent user outcomes, not database tables;
- app-specific pages, routes, navigation, roles, forms, and workflows remain
  in the owning app;
- feature-to-feature imports use public `index.ts` exports only;
- no feature deep-imports another feature's private implementation;
- optional folders are created only when the feature needs them;
- shared extraction requires a real second consumer and a stable contract;
- do not create a global shared React feature package.

## Hexagonal/Clean boundary

```text
app composition root
  → concrete infrastructure and providers
  → API/transport protocols
  → application use cases and ports
  → domain rules and types
  → kernel primitives
```

The responsibilities are:

- `domain`: rules, invariants, entities/value objects where useful, typed
  domain errors, and business types;
- `application`: use cases, orchestration, DTOs, and protocols/ports;
- `api`: transport contracts, request context, parsing, and typed transport
  errors;
- `infrastructure`: concrete HTTP, auth, storage, telemetry, and provider
  adapters;
- composition root: creates concrete dependencies and injects them.

Application services depend on protocols. They never instantiate HTTP clients,
storage, clocks, auth clients, or providers internally.

## Capability-oriented DDD

Reusable business behavior is grouped by capability inside one package:

```text
packages/business/src/<capability>/
├── domain/
│   ├── *.types.ts or entities/
│   ├── *.rules.ts or policies/
│   ├── value-objects/ when needed
│   ├── errors/ when needed
│   └── index.ts
├── application/
│   ├── commands/ or use-case modules
│   ├── queries/ or use-case modules
│   ├── ports/
│   ├── dto/ when a stable business DTO is needed
│   └── index.ts
└── index.ts
```

Current capabilities include `appointments`, `clients`, and `services`.
Domain/application code is framework-free and can be consumed by more than one
application. Similar UI is not enough reason to share a React feature.

This is pragmatic DDD: use capability boundaries, business vocabulary, rules,
typed errors, and explicit ports where they improve ownership. Do not add
aggregate/repository/value-object ceremony without a business need.

## Component-Driven Development

CDD applies to `packages/ui`:

```text
packages/ui/src/
├── components/                 # Button, Table, Modal, Calendar, etc.
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

Reusable component directories normally contain:

```text
Component/
├── Component.tsx
├── Component.test.tsx
├── Component.types.ts          # optional
└── index.ts
```

The UI package is generic and accessible. It must not import business,
application, API, infrastructure, feature, or app code. Business-specific
composition belongs in `apps/<app>/src/features/<capability>`.

## Combined dependency rule

```text
business application → business domain → @emme/kernel
feature/application code → @emme/api protocols
@emme/infrastructure → @emme/api and business ports
app feature → @emme/business + @emme/api + @emme/core + @emme/i18n + @emme/ui
app composition root → concrete adapters and runtime providers
```

Packages never import apps. Apps never import another app. Expected business
outcomes use typed results/errors, and raw transport failures do not leak into
presentation.
