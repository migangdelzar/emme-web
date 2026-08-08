# ADR-001: Cohesive Library Ownership

| Field | Decision |
|---|---|
| Status | Accepted |
| Date | 2026-08-07 |
| Scope | Frontend workspace package boundaries |

## Context

The workspace serves a tenant-owner application now and is expected to host
platform-admin and client applications later. The previous `contracts` and
`api-client` package names did not communicate the Hexagonal boundaries or the
difference between typed backend contracts and concrete browser integrations.

## Decision

The workspace uses eight cohesive libraries:

- `@emme/ui` for reusable visual primitives.
- `@emme/core` for auth, tenancy, permissions, runtime configuration, and
  providers.
- `@emme/domain` for pure business rules and models.
- `@emme/application` for framework-agnostic use cases and ports.
- `@emme/api` for typed backend contracts, capability adapters, and ports.
- `@emme/infrastructure` for concrete HTTP, auth-token, storage, and browser
  integrations.
- `@emme/i18n` for typed localization resources.
- `@emme/test-support` for development-only test fixtures and fakes.

Applications own composition roots, routes, layouts, and role-specific UI.
Feature code remains inside the application until it earns extraction into a
shared library. Domain and application packages do not import React, browser
APIs, HTTP clients, or generated transport details.

## Dependency direction

```text
UI → application hooks/adapters → @emme/application → @emme/domain
                                  ↑                  ↑
                         @emme/infrastructure → @emme/api
```

`@emme/api` describes the typed backend boundary and HTTP port. Infrastructure
implements concrete transports and storage. TanStack Query owns remote data;
client-only UI state stays local or in the app store.

## Consequences

This keeps backend contracts reusable by all three future apps without sharing
browser implementations. It also permits domain rules and application use
cases to be tested without React or network mocks. The current app keeps a
single composition root, and future app shells can select only the providers
and feature modules they need.

## Rejected alternatives

- A single `@emme/business` package was rejected because it hides the boundary
  between pure domain rules and application orchestration.
- Separate packages for every feature and provider were rejected because they
  create excessive versioning and dependency overhead before a second consumer
  exists.
- A pnpm/Turbo migration was deferred; Bun workspace tooling remains the
  current repository convention.
