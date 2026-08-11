# EMME Web Project Architecture Specification

| Field | Value |
| --- | --- |
| Status | Canonical index and handoff map |
| Date | 2026-08-10 |
| Current source branch | `feat/api-version-contract` |
| Repository | [`migangdelzar/emme-web`](https://github.com/migangdelzar/emme-web) |
| Detailed handbook | [`README.md`](README.md) |

This file is intentionally an index. The architecture is split into focused
documents under `docs/architecture` so each boundary can be updated without
duplicating the complete project specification.

## Read in this order

1. [Architecture handbook](README.md) — source hierarchy and document map.
2. [Repository structure](00-project/repository-structure.md) — actual apps,
   packages, and root folders.
3. [Architecture patterns](00-project/architecture-patterns.md) — where
   FSD-inspired slicing, Hexagonal/Clean, DDD, and CDD apply.
4. [App shell structure](00-project/app-shell-structure.md) — composition roots
   and the three deployable application shells.
5. [Feature module structure](00-project/feature-module-structure.md) — local
   vertical slices and public feature boundaries.
6. [Package ownership](00-project/package-ownership.md) — what each shared
   package owns and forbids.
7. [Dependency rules](00-project/dependency-rules.md) — allowed dependency
   directions and protocol-based injection.
8. [Runtime authentication and tenancy](01-runtime/auth-and-tenancy.md) —
   security boundaries and recovery behavior.
9. [API and infrastructure](03-integration/api-and-infrastructure.md) — request
   flow, adapters, and typed transport failures.
10. [Testing architecture](00-project/testing-architecture.md) — test lanes,
    doubles, and required scenario coverage.
11. [AI Studio handoff](00-project/ai-studio-handoff.md) — import links, prompts,
    exclusions, and replication invariants.

## Architecture summary

EMME is a Bun workspace containing three independently deployable React/Vite
applications:

```text
apps/admin-app    → platform administration
apps/client-app   → customer-facing experience
apps/salon-app    → tenant-owner/staff salon management
```

The frontend is organized by app and business capability. Shared business rules
are framework-free and grouped by capability in `@emme/business`. API contracts
and concrete infrastructure are separate. Generic UI is isolated in
`@emme/ui`. Apps are composition roots and packages never import app code.

The accurate pattern description is:

> FSD-inspired vertical feature slices in the frontend, Hexagonal/Clean
> boundaries for shared business and infrastructure, pragmatic
> capability-oriented DDD for business modeling, and Component-Driven
> Development for the shared UI system.

## Current branch warning

At the time of this specification, `main` contains an older package topology.
Use [`feat/api-version-contract`](https://github.com/migangdelzar/emme-web/tree/feat/api-version-contract)
for the current architecture or merge it into `main` before importing into
AI Studio.

Historical names such as `apps/emme-salon-app`, `apps/platform-admin-app`,
`packages/domain`, `packages/application`, and `@emme/features` are preserved
only in historical migration documents. They are not current ownership
destinations.

## Maintenance rule

Update the focused handbook page when a boundary changes, then update this
index only when the document map or architecture summary changes. Run:

```bash
bun run docs:check
bun run architecture:check
```

For external AI agents, use the [AI Studio handoff](00-project/ai-studio-handoff.md)
instead of copying this index alone.
