# ADR-001: Cohesive Library Ownership

| Field | Decision |
| --- | --- |
| Status | Superseded on 2026-08-08 |
| Date | 2026-08-07 |
| Scope | Historical frontend workspace package boundaries |
| Superseded by | [Complete monorepo design](../../superpowers/specs/2026-08-08-complete-monorepo-architecture-and-plan-portfolio-design.md) |

> **Historical / superseded.** This ADR is retained as decision history. Its
> global `@emme/domain`, `@emme/application`, and `@emme/validation` ownership
> must not guide new implementation. Use
> the current [package ownership](../../architecture/00-project/package-ownership.md),
> [dependency rules](../../architecture/00-project/dependency-rules.md), and
> [feature module structure](../../architecture/00-project/feature-module-structure.md)
> instead.

## Historical context

The workspace served a tenant-owner application and anticipated platform-admin
and client applications. The previous `contracts` and `api-client` names did
not communicate Hexagonal boundaries or distinguish typed backend contracts
from concrete browser integrations.

## Superseded decision

The 2026-08-07 model used eight cohesive libraries:

- `@emme/ui` for reusable visual primitives;
- `@emme/core` for auth, tenancy, permissions, runtime configuration, and
  providers;
- `@emme/domain` for pure business rules and models;
- `@emme/application` for framework-agnostic use cases and ports;
- `@emme/api` for typed backend contracts, capability adapters, and ports;
- `@emme/infrastructure` for concrete HTTP, auth-token, storage, and browser
  integrations;
- `@emme/i18n` for typed localization resources;
- `@emme/test-support` for development-only test fixtures and fakes.

Its dependency direction was:

```text
UI -> application hooks/adapters -> @emme/application -> @emme/domain
                                  ^                  ^
                         @emme/infrastructure -> @emme/api
```

## Why it was superseded

The global domain/application split separated one business capability across
technical packages and made ownership, exports, migrations, and tests harder
to reason about. The approved replacement keeps Hexagonal layers but nests them
inside reusable vertical features. It also adds `@emme/kernel` and moves API,
business, and app-specific validation to their actual owners.

The retained consequences still apply where compatible: apps are composition
roots, backend contracts remain reusable, protocol injection keeps business
logic testable, and Bun remains the workspace tool.
