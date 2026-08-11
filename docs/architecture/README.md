# EMME Web Architecture Handbook

This handbook is the normative architecture for the EMME Bun workspace. The
[project architecture specification](PROJECT-ARCHITECTURE-SPEC.md) is its
index; the pages below own the detailed rules for each boundary.

The handbook governs the current salon-first ownership model. The three apps
remain independently deployable, but `salon-app` is the only app that owns
product features today. `@emme/business` contains reusable framework-free
business behavior, and `@emme/auth` contains only the shared authentication
gate primitive. Each app owns its own login page and authentication
presentation. The backend remains authoritative for authorization, tenant
isolation, validation, persistence, and business invariants.

For an AI Studio-ready consolidated explanation of the current structure, use
the [Project Architecture Specification](PROJECT-ARCHITECTURE-SPEC.md). It
captures the current branch topology, the FSD-inspired/Hexagonal/DDD/Component-
Driven Development scopes, package boundaries, and the client/admin replication
contract in one document.

The detailed handbook is split by concern. Use the [architecture pattern
map](00-project/architecture-patterns.md) to understand the four pattern
scopes, and the [AI Studio handoff](00-project/ai-studio-handoff.md) when
importing the repository into another coding agent.

## Handbook status key

| Status | Meaning |
| --- | --- |
| Canonical | Normative target structure or rule. |
| Updated | A retained reference reconciled with the canonical vertical-feature model. |
| Retained | Compatible operational detail that remains normative in its stated scope. |

## Handbook map

Every page listed here is active guidance. Archived decisions are outside this
handbook and must not guide new implementation.

### Project

| Page | Status | Scope |
| --- | --- | --- |
| [Repository structure](00-project/repository-structure.md) | Canonical | Complete root and package trees. |
| [Package ownership](00-project/package-ownership.md) | Canonical | Package responsibilities and forbidden ownership. |
| [Dependency rules](00-project/dependency-rules.md) | Canonical | Allowed dependency graph and boundary checklist. |
| [Naming conventions](00-project/naming-conventions.md) | Canonical | Directory, file, symbol, schema, test, and barrel names. |
| [Architecture patterns](00-project/architecture-patterns.md) | Canonical | FSD-inspired, Hexagonal/Clean, DDD, and CDD scope mapping. |
| [AI Studio handoff](00-project/ai-studio-handoff.md) | Canonical | Import links, prompts, exclusions, and agent invariants. |
| [Boundary verification](00-project/boundary-verification.md) | Canonical | Boundary-to-test and architecture-validator coverage. |
| [Feature module structure](00-project/feature-module-structure.md) | Updated | Salon-local feature structure and business package boundary. |
| [App shell structure](00-project/app-shell-structure.md) | Canonical | Salon, client, and admin workflow trees. |
| [Testing architecture](00-project/testing-architecture.md) | Canonical | Test locations, lanes, doubles, and completion checklist. |
| [Web/native UI boundary](00-project/web-native-ui-boundary.md) | Canonical | Portable UI contract and platform extension points. |
| [Documentation and decisions](00-project/documentation-and-decisions.md) | Updated | Source hierarchy, ADR lifecycle, and review policy. |
| [Frontend architecture model](00-project/architecture-model.md) | Updated | Two-repository and vertical-feature overview. |
| [Bun workspace and toolchain](00-project/frontend-build-bun.md) | Updated | Workspace ownership, hooks, and commands. |

### Runtime

| Page | Status | Scope |
| --- | --- | --- |
| [Authentication and tenancy](01-runtime/auth-and-tenancy.md) | Canonical | Session, tenant, request-context, and recovery flow. |
| [Permissions](01-runtime/permissions.md) | Canonical | Frontend capability checks and backend authority. |
| [Configuration](01-runtime/configuration.md) | Canonical | `defineAppConfig`, `defineModule`, and public runtime config. |
| [Error handling](01-runtime/error-handling.md) | Canonical | Typed outcomes, normalization, UI recovery, and redaction. |

### Frontend

| Page | Status | Scope |
| --- | --- | --- |
| [App](02-frontend/app.md) | Updated | Composition-root responsibilities and app verification. |
| [Feature](02-frontend/feature.md) | Updated | User-outcome states and feature presentation rules. |
| [Module](02-frontend/module.md) | Updated | Vertical module boundary and public API contract. |
| [State management](02-frontend/state-management.md) | Updated | Server, URL, workflow, local, and derived state ownership. |
| [Internationalization](02-frontend/i18n.md) | Updated | Shared, feature, and app-local message ownership. |
| [React](02-frontend/react.md) | Updated | React placement, side effects, accessibility, and performance. |
| [Testing](02-frontend/testing.md) | Updated | Presentation and integration test details. |
| [Vite](02-frontend/vite.md) | Updated | Build, proxy, public config, and package-boundary rules. |

### Integration

| Page | Status | Scope |
| --- | --- | --- |
| [Contracts](03-integration/contracts.md) | Updated | Contract ownership, validation layers, and compatibility. |
| [API and infrastructure](03-integration/api-and-infrastructure.md) | Canonical | Abstract transport versus concrete adapters. |
| [Feature adapters](03-integration/feature-adapters.md) | Canonical | Feature-owned mappers and repository adapters. |
| [End-to-end](03-integration/end-to-end.md) | Updated | Mock and real Playwright lanes and evidence policy. |
| [Frontend–backend](03-integration/frontend-backend.md) | Updated | Detailed request, Problem Details, and service flow. |
| [Real E2E auth artifacts](03-integration/real-e2e-auth-artifacts.md) | Canonical | Per-salon storage-state files and role selection. |

### Delivery

| Page | Status | Scope |
| --- | --- | --- |
| [Continuous integration](04-delivery/ci.md) | Updated | Required CI lanes and workflow responsibilities. |
| [Container](04-delivery/container.md) | Updated | Shared build recipe, three images, proxy, scan, and runtime rules. |
| [Frontend deployments](04-delivery/frontend-deployments.md) | Canonical | Three images, deployments, services, ingress, and runtime configuration. |
| [Release](04-delivery/release.md) | Updated | Independent app promotion, compatibility, smoke, and rollback. |
| [Secrets](04-delivery/secrets.md) | Retained | Frontend secret and browser-safe configuration boundary. |
| [Quality gates](04-delivery/quality-gates.md) | Canonical | Documentation through production-readiness gates. |

### Operations

| Page | Status | Scope |
| --- | --- | --- |
| [Observability](05-operations/observability.md) | Updated | Signals, privacy, correlation, and verification. |
| [Security](05-operations/security.md) | Canonical | Browser threat boundary and required evidence. |
| [Reliability](05-operations/reliability.md) | Updated | Timeout, retry, stale work, and recovery behavior. |
| [Production readiness](05-operations/production-readiness.md) | Retained | Approval matrix and exception policy. |
| [Dependency risk register](05-operations/dependency-risk-register.md) | Retained | Time-bounded dependency exceptions. |

## Canonical structure checklist

- [ ] The repository tree contains the three app shells and the package
      boundaries: kernel, UI, core, auth, i18n, API, infrastructure, business,
      validation, and test support.
- [ ] Each package matches its complete tree in
      [repository structure](00-project/repository-structure.md); summaries do
      not replace those trees.
- [ ] Reusable business behavior is capability-oriented under
      `packages/business/src/<capability>`, with internal `domain` and
      `application` layers.
- [ ] Product features, pages, hooks, workflows, and business-specific UI are
      under `apps/salon-app/src/features`.
- [ ] `@emme/auth` contains only shared authentication boundary primitives;
      login pages remain app-local and `@emme/features` does not exist.
- [ ] App routes, navigation, branding, role permissions, forms, filters, and
      workflow orchestration remain app-owned.
- [ ] Public imports use package or feature barrels; no consumer deep-imports a
      private implementation path or another app.
- [ ] Dependency direction matches the
      [dependency rules](00-project/dependency-rules.md), with explicit tenant
      context and protocol-injected adapters.
- [ ] Files, symbols, schemas, fixtures, and tests match the
      [naming conventions](00-project/naming-conventions.md).
- [ ] Every layer has tests in the locations defined by
      [testing architecture](00-project/testing-architecture.md), and all
      applicable quality gates pass without skipped tests.
- [ ] Any retained page that conflicts with this model is labeled historical or
      is updated before the conflicting rule is relied upon.

## Normative policy links

- [Web principles](../principles.md)
- [Web security](../security.md)
- [Web testing](../testing.md)
- [Git and review](../git.md)
- [Frontend code splitting](../code-splitting.md)
- [Frontend feature template](../templates/frontend-feature-template.md)
- [Secrets and configuration boundary](04-delivery/secrets.md)
