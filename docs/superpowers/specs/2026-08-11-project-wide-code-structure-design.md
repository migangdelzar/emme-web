# Project-Wide Code Structure Design

## Status

Proposed for review.

## Date

2026-08-11

## Context

The repository already separates applications, business logic, transport
contracts, infrastructure, runtime services, internationalization, UI, and
test support. The boundaries are sound, but the internal structure is uneven:

- `@emme/business` mixes different port layouts and has large use-case files.
- Domain concepts are represented by generic `*.types.ts` and `*.rules.ts`
  files even when they are entities, value objects, policies, or domain
  errors.
- Some capabilities have an application layer while others only have domain
  files.
- API contracts, infrastructure adapters, and application features do not use
  one consistent capability naming scheme.
- The current structure does not make every allowed dependency direction
  obvious to a human or an AI coding agent.

The project uses FSD-inspired frontend slicing, Hexagonal/Clean boundaries,
capability-oriented DDD, and Component-Driven Development at different
scopes. This design makes those scopes visible in the filesystem without
turning every capability into an over-engineered framework.

See the [architecture patterns](../../architecture/00-project/architecture-patterns.md),
[package ownership](../../architecture/00-project/package-ownership.md), and
[feature structure](../../architecture/00-project/feature-module-structure.md).

## Goals

- Establish one canonical structure across the complete monorepo.
- Make domain, application, contract, adapter, runtime, UI, and test
  boundaries visible from folder names alone.
- Move files and split oversized modules without changing product behavior.
- Preserve existing public imports with compatibility re-exports during the
  migration.
- Make empty future boundaries explicit with README boundary markers rather
  than undocumented empty directories.
- Add architecture validation for each boundary and preserve testability.
- Give AI Studio a deterministic structure to reproduce for client and admin
  applications.

## Non-goals

- Rewriting business behavior or changing product requirements.
- Introducing microservices, a second business package, or a new framework.
- Creating aggregates, value objects, events, or repositories where the domain
  has no corresponding business need.
- Moving generic UI into business packages or business logic into React apps.
- Removing compatibility exports until all consumers have migrated.

## Decision

Use a project-wide layered structure with capability ownership:

```text
frontend app workflow
  → API/application composition
  → application use cases and ports
  → domain model and policies
  → kernel primitives

composition root
  → concrete infrastructure adapters
  → application ports

frontend UI
  → generic @emme/ui components
  → app-owned feature composition
```

The filesystem reflects the dependency direction. A folder is not a license to
add code: each boundary has an owner, allowed dependencies, public exports,
and tests or architecture validation.

## Canonical monorepo structure

```text
emme-web/
├── apps/
│   ├── salon-app/
│   ├── client-app/
│   └── admin-app/
│
├── packages/
│   ├── kernel/                  # framework-free primitives and typed results
│   ├── business/                # DDD capabilities and application use cases
│   ├── api/                     # transport contracts and API protocols
│   ├── infrastructure/          # concrete external adapters
│   ├── core/                    # auth, tenancy, permissions, runtime
│   ├── auth/                    # shared authentication gate primitives
│   ├── i18n/                    # translation runtime, catalogs, formatters
│   ├── ui/                      # generic accessible component system
│   ├── validation/              # shared schema primitives
│   └── test-support/            # fakes, fixtures, test providers
│
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── superpowers/specs/
│   └── superpowers/plans/
│
├── scripts/                     # repository architecture and quality checks
└── e2e/                         # cross-app browser journeys and fixtures
```

## Business package structure

`@emme/business` is the canonical home for reusable business behavior. It is
framework-free and may depend only on `@emme/kernel` and business-owned shared
concepts.

```text
packages/business/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── shared/
    │   ├── README.md
    │   ├── domain/
    │   │   ├── README.md
    │   │   ├── errors/
    │   │   ├── policies/
    │   │   ├── value-objects/
    │   │   └── index.ts
    │   ├── application/
    │   │   ├── README.md
    │   │   ├── dto/
    │   │   ├── ports/
    │   │   └── index.ts
    │   └── index.ts
    │
    ├── appointments/
    ├── clients/
    ├── services/
    ├── staff/
    ├── payments/
    ├── communications/
    └── integrations/
```

`staff`, `payments`, `communications`, and `integrations` are reserved
capability boundaries. They may initially contain only a README describing
ownership and allowed dependencies. No behavior is invented merely to fill a
folder.

Each capability follows the same internal shape:

```text
<capability>/
├── README.md
├── index.ts
├── domain/
│   ├── README.md
│   ├── entities/                # identity and lifecycle behavior
│   ├── aggregates/              # consistency boundaries, only when needed
│   ├── value-objects/            # immutable validated concepts
│   ├── policies/                # business decisions and invariants
│   ├── services/                # domain operations spanning concepts
│   ├── events/                  # facts emitted by the domain
│   ├── errors/                  # typed business failures
│   ├── types/                   # discriminated unions and structural types
│   └── index.ts
└── application/
    ├── README.md
    ├── commands/                # state-changing use cases
    ├── queries/                 # read-only use cases
    ├── dto/
    │   ├── commands/            # command input contracts
    │   ├── queries/             # query input contracts
    │   └── results/             # application output contracts
    ├── ports/
    │   ├── repositories/        # persistence/query protocols
    │   ├── gateways/            # external system protocols
    │   ├── publishers/          # event/notification protocols
    │   └── services/            # injected capability protocols
    ├── mappers/                 # domain ↔ application DTO mapping
    └── index.ts
```

Empty directories are kept with a focused `README.md` that states when the
boundary may be used. A category is populated only when a real module belongs
there.

### Business naming conversions

Current generic names become intention-revealing names:

| Current pattern | Canonical destination |
| --- | --- |
| `domain/*.rules.ts` | `domain/policies/*.policy.ts` or `domain/services/*.service.ts` |
| `domain/*.types.ts` | `domain/entities/`, `domain/value-objects/`, or `domain/types/` |
| `domain/*-errors.ts` | `domain/errors/*.error.ts` |
| `domain/*-time-range.ts` | `domain/value-objects/*-time-range.ts` |
| `application/use-cases.ts` | `application/commands/` and `application/queries/` |
| `application/ports.ts` | `application/ports/{repositories,gateways,publishers,services}/` |
| `application/salon/` | capability application query/command folders; role belongs to the consuming app |
| `application/*.dto.ts` | `application/dto/{commands,queries,results}/` |

The migration chooses the destination based on behavior, not filename alone.
For example, an appointment time range is a value object, while appointment
cancellation is a policy. A plain data shape is not automatically an entity.

## API package structure

`@emme/api` owns transport-facing contracts, not domain entities or business
policies.

```text
packages/api/src/
├── index.ts
├── client/
│   ├── api-client.ts
│   ├── api-request.ts
│   ├── api-response.ts
│   └── index.ts
├── contracts/
│   ├── common/
│   ├── errors/
│   ├── auth/
│   ├── tenants/
│   ├── appointments/
│   │   ├── appointment.dto.ts
│   │   ├── appointment.requests.ts
│   │   ├── availability.dto.ts
│   │   └── index.ts
│   ├── clients/
│   ├── services/
│   ├── staff/
│   ├── payments/
│   └── integrations/
├── ports/
│   └── http-client.ts
├── providers/
│   ├── api-provider.tsx
│   └── index.ts
└── testing/
    ├── provider.ts
    └── index.ts
```

Transport DTOs remain distinct from business entities. Mappers at the
infrastructure or app boundary translate between them.

## Infrastructure package structure

`@emme/infrastructure` contains concrete implementations of ports. It may
depend on `@emme/api` and `@emme/business` port types but never defines domain
rules.

```text
packages/infrastructure/src/
├── index.ts
├── http/
│   ├── fetch-http-client.ts
│   ├── api-error.ts
│   └── index.ts
├── auth/
│   ├── token-storage.ts
│   └── index.ts
├── storage/
│   ├── local-storage.ts
│   ├── cache-service.ts
│   └── index.ts
├── telemetry/
│   └── index.ts
├── business/
│   ├── appointments/
│   │   ├── appointment-repository.adapter.ts
│   │   ├── availability-repository.adapter.ts
│   │   └── index.ts
│   ├── clients/
│   │   ├── client-repository.adapter.ts
│   │   └── index.ts
│   ├── services/
│   └── integrations/
└── providers/
    ├── google/
    └── index.ts
```

The app composition root constructs these adapters and injects them into
application use cases. Business code never imports these concrete modules.

## Runtime package structure

`@emme/core` remains the owner of cross-feature runtime concerns:

```text
packages/core/src/
├── index.ts
├── auth/
├── tenancy/
├── permissions/
├── routing/
├── configuration/
├── errors/
├── logging/
├── feature-flags/
└── runtime/
```

Authentication UI, login pages, and product authorization composition stay in
the consuming application. Core exposes protocols and providers, not product
workflows.

## UI package structure

`@emme/ui` remains generic and business-neutral:

```text
packages/ui/src/
├── index.ts
├── components/
│   └── <Component>/
│       ├── <Component>.tsx
│       ├── <Component>.test.tsx
│       ├── <Component>.types.ts
│       └── index.ts
├── data-display/
├── date-time/
├── feedback/
├── forms/
├── hooks/
├── layout/
├── navigation/
├── overlays/
├── theme/
├── web/
└── native/
```

Business-specific cards, forms, labels, and workflows remain in app features.
The UI package cannot import business, API, infrastructure, or app code.

## Application structure

Every app receives the same shell and feature boundary shape:

```text
apps/<app>/src/
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── composition/
│   ├── providers/
│   ├── routing/
│   ├── layouts/
│   ├── guards/
│   ├── error-boundary/
│   ├── config/
│   └── index.ts
├── features/
│   ├── appointments/
│   ├── clients/
│   ├── services/
│   ├── staff/
│   ├── payments/
│   ├── communications/
│   ├── integrations/
│   └── settings/
├── shared/
│   ├── shell/
│   ├── hooks/
│   ├── lib/
│   └── test/
└── theme/
```

Each app feature follows this optional structure:

```text
features/<capability>/
├── README.md
├── index.ts
├── pages/                       # route-level screen composition
├── components/                  # capability-specific React components
├── hooks/                       # workflow and query orchestration
├── api/                         # query/mutation composition
├── mappers/                     # transport/application → view model
├── domain/                      # app-only presentation rules, if justified
├── application/                 # app-only workflow ports, if justified
├── infrastructure/              # app-local adapter, if justified
├── presentation/                # screen-specific presentation modules
├── state/                       # feature-local state
├── validation/                  # form, URL, and filter schemas
├── shared/                      # feature-local reusable pieces
└── test/                        # feature fixtures and integration setup
```

The app feature owns the user outcome. It consumes `@emme/business` through
public capability exports and consumes `@emme/api` through the approved API
boundary. It never imports another app or another feature's private path.

## Test structure

Tests remain colocated with the behavior they protect, with explicit boundary
tests at package and app roots:

```text
packages/business/src/<capability>/
├── domain/.../*.test.ts
├── application/.../*.test.ts
└── boundary.test.ts

packages/<package>/src/__tests__/
├── package-boundary.test.ts
└── public-api.test.ts

apps/<app>/src/
├── app/*-boundary.test.ts
├── features/<capability>/**/*.test.tsx
└── features/<capability>/feature-boundary.test.ts
```

Each boundary must have either a focused test or a repository architecture
validator rule. Required invariants include:

- domain has no framework, transport, browser, or infrastructure imports;
- application depends on ports, not concrete adapters;
- infrastructure implements ports and owns side effects;
- API contracts do not leak into domain entities;
- UI contains no business policy;
- apps do not import other apps;
- feature private files are not imported across feature boundaries;
- package public exports are explicit and deep imports are rejected.

## Compatibility and migration strategy

The migration is behavior-preserving and proceeds in waves:

1. Add canonical folders, README boundary markers, public entry-point tests,
   and architecture validation.
2. Move and split `@emme/business` files by capability. Keep old paths as
   compatibility re-exports until all consumers use canonical exports.
3. Move infrastructure adapters beneath capability-owned business adapter
   folders while preserving package exports.
4. Normalize API contracts by capability without changing wire formats.
5. Normalize app shell and feature folders incrementally, preserving routes,
   UI behavior, and public feature entry points.
6. Update imports to canonical paths and remove compatibility re-exports only
   after repository-wide search proves no consumers remain.
7. Run focused tests after each capability and full repository verification at
   the end of every wave.

No file is deleted solely because it is in an old location. A move is complete
only when its replacement exists, consumers are migrated, tests cover the new
boundary, and a compatibility decision is recorded.

## Alternatives considered

### One global `domain/` and `application/` directory

Rejected. It mixes bounded contexts and makes ownership unclear. Capability
folders keep appointments, clients, and services from sharing accidental
models.

### Only create folders when code needs them

Rejected for this task. It preserves ambiguity for future agents and causes
each capability to invent a slightly different structure.

### Create all logic as entities and aggregates immediately

Rejected. The scaffold reserves these boundaries, but implementation creates
an entity, aggregate, or domain event only when its business semantics justify
it.

### Move concrete adapters into `@emme/business`

Rejected. That would violate Hexagonal dependency direction and make the
business package depend on HTTP, storage, or provider details.

## Acceptance criteria

- [ ] The canonical project tree is represented in the repository.
- [ ] Business capabilities use consistent domain/application boundaries.
- [ ] Reserved empty boundaries contain README ownership markers.
- [ ] Public compatibility exports preserve existing consumers during
      migration.
- [ ] Files are split by responsibility, not merely renamed.
- [ ] Every package and feature boundary has tests or architecture validation.
- [ ] `bun run docs:check` passes.
- [ ] `bun run architecture:check` passes.
- [ ] Full typecheck, tests, lint, and builds pass.
- [ ] No behavior or API wire contract changes are introduced.
