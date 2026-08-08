# EMME Web Architecture Handbook

This handbook is the normative target architecture for the EMME Bun workspace.
It implements [Plan 01](../superpowers/plans/2026-08-08-01-workspace-and-architecture-handbook.md) from the approved [complete monorepo design](../superpowers/specs/2026-08-08-complete-monorepo-architecture-and-plan-portfolio-design.md). Existing migration documents remain historical evidence; this handbook governs future business-code ownership.

## Handbook map

| Area | Pages |
| --- | --- |
| Project | [Repository structure](00-project/repository-structure.md), [package ownership](00-project/package-ownership.md), [dependency rules](00-project/dependency-rules.md), [naming](00-project/naming-conventions.md), [feature modules](00-project/feature-module-structure.md), [app shells](00-project/app-shell-structure.md), [testing architecture](00-project/testing-architecture.md), [web/native UI](00-project/web-native-ui-boundary.md), [documentation and decisions](00-project/documentation-and-decisions.md) |
| Runtime | [Auth and tenancy](01-runtime/auth-and-tenancy.md), [permissions](01-runtime/permissions.md), [configuration](01-runtime/configuration.md), [error handling](01-runtime/error-handling.md) |
| Frontend | [App](02-frontend/app.md), [feature](02-frontend/feature.md), [module](02-frontend/module.md), [state management](02-frontend/state-management.md), [i18n](02-frontend/i18n.md), [React](02-frontend/react.md), [testing](02-frontend/testing.md), [Vite](02-frontend/vite.md) |
| Integration | [Contracts](03-integration/contracts.md), [API and infrastructure](03-integration/api-and-infrastructure.md), [feature adapters](03-integration/feature-adapters.md), [end-to-end](03-integration/end-to-end.md) |
| Delivery | [CI](04-delivery/ci.md), [release](04-delivery/release.md), [quality gates](04-delivery/quality-gates.md) |
| Operations | [Observability](05-operations/observability.md), [security](05-operations/security.md), [reliability](05-operations/reliability.md) |

The implementation sequence and rule ownership are indexed in the [complete monorepo plan portfolio](../superpowers/plans/2026-08-08-00-complete-monorepo-index.md).
