# Salon-First Frontend Architecture

| Field | Value |
|---|---|
| Date | 2026-08-09 |
| Status | Approved for implementation planning |
| Scope | `apps/salon-app` and the shared frontend packages |
| Primary product | Salon application |
| Related plan | `docs/superpowers/plans/2026-08-08-emme-architecture/10-features-plan.md` |

## 1. Summary

Emme keeps `admin-app`, `salon-app`, and `client-app` as separate deployable applications. The current implementation effort is salon-first: the salon application owns its complete user experience, while shared packages contain only stable business foundations and technical infrastructure.

The existing `@emme/features` package is too broad. It mixes React pages, hooks, feature state, business rules, API adapters, and application logic. It will become a temporary migration facade and will be retired after salon-owned presentation code has moved to `apps/salon-app/src/features`.

The shared business boundary remains the existing `@emme/domain` and `@emme/application` packages. No new `@emme/business` package is introduced. This preserves useful domain/application separation without adding another workspace package.

## 2. Architectural Decisions

### 2.1 Separate deployable applications remain

The three applications remain independent build artifacts and deployment units:

- `admin-app`
- `salon-app`
- `client-app`

The decision to keep separate deployables is independent from whether React features are shared. Separate authentication, permissions, release cadence, and runtime configuration justify separate application shells.

### 2.2 Salon owns salon presentation

All salon-specific pages, route workflows, hooks, feature state, view models, and components belong under `apps/salon-app/src/features`.

Shared React code is not created speculatively. A component or hook may move to a shared package only after there is a real second consumer and a stable public contract.

### 2.3 Shared business logic remains framework-independent

Business rules and use cases that may eventually be used by the client application remain reusable:

- `@emme/domain`: entities, value objects, rules, errors, and business types.
- `@emme/application`: use cases, DTOs, ports, and application orchestration.
- `@emme/api`: transport contracts and typed API operations.

The domain and application packages must not import React, browser APIs, routing, TanStack Query, or concrete infrastructure.

### 2.4 Technical layers are package responsibilities, not feature UI folders

The salon app does not need a `presentation`, `infrastructure`, or `hexagonal` folder in every feature. Local folders are added only when the feature has code for that responsibility.

For example, an appointments feature may start as:

```text
apps/salon-app/src/features/appointments/
├── pages/
│   └── AppointmentsPage.tsx
├── components/
│   ├── AppointmentCalendar.tsx
│   └── AppointmentTable.tsx
├── hooks/
│   └── useSalonAppointments.ts
├── state/
│   └── appointmentFilters.ts
├── validation/
│   └── appointmentFilters.schema.ts
└── index.ts
```

If a feature has no local state or validation, those directories are omitted.

## 3. Target Repository Structure

```text
emme/
├── apps/
│   ├── admin-app/
│   ├── salon-app/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── config/
│   │       │   ├── error-boundary/
│   │       │   ├── layouts/
│   │       │   ├── providers/
│   │       │   └── routing/
│   │       ├── features/
│   │       │   ├── appointments/
│   │       │   ├── clients/
│   │       │   ├── dashboard/
│   │       │   ├── finances/
│   │       │   ├── onboarding/
│   │       │   ├── services/
│   │       │   ├── settings/
│   │       │   └── auth/
│   │       ├── shared/
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   └── utils/
│   │       └── theme/
│   └── client-app/
├── packages/
│   ├── api/
│   ├── application/
│   ├── core/
│   ├── domain/
│   ├── features/          # temporary migration facade; remove later
│   ├── i18n/
│   ├── infrastructure/
│   ├── kernel/
│   ├── test-support/
│   ├── ui/
│   └── validation/
└── docs/
```

The `features` package is intentionally shown as temporary. The final architecture does not require a shared React feature package for the salon product.

## 4. Package Responsibilities

| Package | Owns | Must not own |
|---|---|---|
| `@emme/kernel` | Result types, base errors, brands, IDs, clocks | React, HTTP, browser APIs, business concepts |
| `@emme/domain` | Pure business rules and models grouped by capability | React, API clients, query libraries, storage |
| `@emme/application` | Use cases, ports, DTOs, orchestration grouped by capability | React, browser APIs, concrete HTTP clients |
| `@emme/api` | HTTP/API contracts, transport mappers, typed operations | Pages, React hooks, domain policy decisions |
| `@emme/infrastructure` | Concrete HTTP, storage, auth, telemetry adapters | Business rules and page workflows |
| `@emme/core` | Auth, tenant context, permissions, runtime providers, routing primitives | Appointment or salon-specific behavior |
| `@emme/ui` | Generic visual components and design tokens | Salon, appointment, customer, payment concepts |
| `@emme/i18n` | Translation engine, shared locales, formatters | Salon workflow decisions |
| `@emme/validation` | Reusable schema primitives and contracts | Page-specific form orchestration |
| `@emme/test-support` | Test providers, factories, fakes, fixtures | Production behavior |

Capability code inside `domain` and `application` is organized vertically:

```text
packages/domain/src/appointments/
├── appointment-status.ts
├── appointment.rules.ts
├── appointment.types.ts
└── index.ts

packages/application/src/appointments/
├── cancel-appointment.ts
├── salon/
│   └── list-salon-appointments.ts
├── ports/
│   └── appointment-repository.ts
└── index.ts
```

This keeps appointments, clients, and services together within each package instead of mixing all domains into global technical folders.

## 5. Salon Feature Responsibilities

The salon app owns the user-facing workflow. A local feature may contain:

- `pages/`: route-level screens and page composition.
- `components/`: business-specific visual components used by this app.
- `hooks/`: React Query, form, and UI orchestration hooks.
- `state/`: feature-local client state when needed.
- `validation/`: form and URL/filter schemas specific to the salon workflow.
- `mappers/`: conversion from shared application/API output to salon view models, when needed.
- `api/`: app-specific query composition, only when it is not a reusable transport operation.
- `index.ts`: the feature's local public boundary.

Do not create empty layer folders. Do not create a package for every feature. Do not move a page into `@emme/ui` or `@emme/features` merely because another app may eventually need a similar screen.

App-owned examples:

```text
apps/salon-app/src/features/appointments/
├── pages/CalendarPage.tsx
├── pages/ManageAppointmentsPage.tsx
├── components/AppointmentManagementTable.tsx
├── components/AppointmentCalendar.tsx
├── hooks/useSalonCalendar.ts
├── hooks/useManageAppointment.ts
├── state/calendarFilters.ts
├── validation/calendarFilters.schema.ts
└── index.ts
```

The future client app may use the same domain rules and API contracts but should build its own booking flow. Similarity is not sufficient evidence for sharing React UI.

## 6. Dependency Rules

```text
salon app feature
  → @emme/application
  → @emme/domain
  → @emme/api
  → @emme/core
  → @emme/ui
  → @emme/i18n

@emme/application → @emme/domain → @emme/kernel
@emme/infrastructure → @emme/api and @emme/application ports
@emme/api → @emme/kernel (where needed)
@emme/ui → no business packages
```

Additional rules:

1. A salon feature imports another salon feature only through its public `index.ts` and only when the dependency represents a real business relationship.
2. A feature never imports another feature's internal files.
3. Domain and application code never imports from `apps/`.
4. API response shapes are mapped at the API/application boundary before reaching domain rules or view models.
5. Backend authorization and tenant isolation remain authoritative. Frontend permission checks only control experience and navigation.
6. Composition roots instantiate concrete infrastructure and provide runtime dependencies.

## 7. Migration Strategy

Migration is incremental and behavior-preserving:

### Phase 1: Establish salon ownership

- Add local `features` boundaries and local public barrels.
- Move salon routing imports from `@emme/features` to the local feature modules.
- Move auth, onboarding, navigation, settings, and dashboard presentation into the salon app.
- Keep compatibility exports temporarily where needed.

### Phase 2: Migrate appointments

- Move appointments pages, components, hooks, state, and salon validation into `apps/salon-app/src/features/appointments`.
- Keep appointment rules, types, errors, and use cases in `@emme/domain` and `@emme/application`.
- Keep transport operations in `@emme/api`.
- Preserve existing route URLs and test selectors.

### Phase 3: Migrate clients and services

- Repeat the same ownership split for clients and services.
- Keep only code with a proven second consumer eligible for shared extraction.

### Phase 4: Migrate finances and integrations

- Keep finances, Google Workspace, and salon settings app-owned unless a stable shared contract emerges.

### Phase 5: Remove the facade

- Remove salon React imports from `@emme/features`.
- Delete the package when no app consumes it.
- Update package exports, architecture checks, documentation, and CI commands.

Every phase must preserve the existing mock and real-provider Playwright flows before moving to the next phase.

## 8. Testing Strategy

| Area | Location | Focus |
|---|---|---|
| Domain rules | `packages/domain/src/**` | Pure business invariants and edge cases |
| Application use cases | `packages/application/src/**` | Ports, orchestration, errors, and DTOs with fakes |
| API contracts/mappers | `packages/api/src/**` | Serialization, request contracts, response mapping |
| Salon feature logic | `apps/salon-app/src/features/**` | Hooks, view models, forms, state, and page behavior |
| Generic UI | `packages/ui/src/**` | Accessibility and component behavior independent of salon concepts |
| App integration | `apps/salon-app/src/app/**` | Providers, route boundaries, composition, and runtime configuration |
| Critical workflows | `e2e/**` | Mock provider and real backend/provider flows |

Tests remain close to the code they verify. Feature-level integration tests may live under a feature's `__tests__/` directory when they span multiple local modules. Do not create a `__tests__` folder for every single component.

Required verification for each migration slice:

```text
typecheck → focused unit tests → salon unit tests → build → mock Playwright → real-provider Playwright
```

## 9. Naming and Folder Conventions

- Folders use lowercase kebab-case: `appointment-management`, `runtime-config`.
- React components use PascalCase: `AppointmentCalendar.tsx`.
- Hooks use `use` plus PascalCase: `useSalonAppointments.ts`.
- Pure functions use camelCase: `mapAppointmentToViewModel.ts`.
- Types use descriptive PascalCase names and stay near their owning capability.
- Schemas use `.schema.ts`: `calendarFilters.schema.ts`.
- Tests use the source name plus `.test.ts` or `.test.tsx`.
- Public package and feature boundaries use `index.ts`.
- Avoid generic names such as `helpers`, `misc`, `common`, and `utils` unless the directory has a precise documented responsibility.
- Do not use `AppointmentCard` as a generic UI component. It belongs to the feature unless it has a proven cross-application contract.

## 10. Alternatives Rejected

### Shared React feature package as the primary architecture

Rejected because it forces salon workflows into a package before a second consumer exists. It also makes app-specific routing, permissions, and state appear reusable when they are not.

### One monolithic salon feature folder with no business packages

Rejected because client and admin will eventually need appointment rules and API contracts. Keeping pure business code reusable now avoids duplicating policy later.

### New `@emme/business` package

Rejected for now because the existing `@emme/domain` and `@emme/application` boundaries already express the required separation. Adding another package would increase migration cost without adding a capability.

### Global technical layers containing every feature

Rejected because it mixes appointments, clients, services, and payments. Capability code remains vertically organized inside domain and application packages.

## 11. Acceptance Criteria

- Salon pages, hooks, feature state, and salon-specific components are owned by `apps/salon-app/src/features`.
- `@emme/features` contains no permanent salon presentation responsibility.
- Shared business rules and use cases remain React-free.
- `@emme/ui` has no business concepts.
- Existing salon routes and behavior remain stable during migration.
- Unit, typecheck, lint, build, mock Playwright, and real-provider Playwright verification pass for each completed slice.
- The architecture documentation and migration plan describe the same structure.
- A future client app can consume domain/application/API contracts without importing salon UI.

