# Package Ownership

| Package | Owns | Must not own |
| --- | --- | --- |
| `@emme/kernel` | `Result`, typed errors, branded IDs, nullable types, clock protocols | React, browser APIs, HTTP, API DTOs, app/runtime code, adapters |
| `@emme/ui` | generic tokens, visual components, accessibility, layouts, forms, platform exports | business names or feature/API/application/infrastructure imports |
| `@emme/core` | auth/session, tenant context, permission guards, runtime/module config, routing, logging, flags, normalized errors | feature business policy or concrete HTTP/storage |
| `@emme/i18n` | engine, shared catalogs, locale providers, formatters, translation test provider | reusable feature namespace copy or app-only workflow copy |
| `@emme/api` | transport protocols, envelopes, API errors, pagination, contract validation, auth/tenant request contracts, generated types | concrete `fetch`, browser storage, React providers, feature use cases |
| `@emme/infrastructure` | global HTTP/provider clients, auth/session storage, tenant resolution, browser storage, telemetry | business policy or feature repository implementations |
| `@emme/features` | reusable vertical business modules and their public barrels | a second global application/domain layer or app routes/workflows |
| `@emme/test-support` | test-only providers, fakes, fixtures, handlers, setup | production runtime dependencies or real credentials/providers |

## Business ownership

Reusable business concepts, policies, use cases, ports, schemas, feature API
mappers, feature repository adapters, reusable presentation, translations, and
tests stay together under `packages/features/src/<feature>`.

Apps own routes, layouts, navigation, branding, role-specific permission
composition, forms/filters tied to one workflow, and workflow orchestration.
Promotion from an app to `@emme/features` requires demonstrated reuse and a
dedicated migration plan.

## Transitional packages

`@emme/domain`, `@emme/application`, and `@emme/validation` are migration
sources, not target package boundaries. Their content moves as follows:

| Transitional content | Canonical owner |
| --- | --- |
| domain entities, value objects, policies, services, typed errors | owning feature `domain/` |
| commands, queries, ports, and DTOs | owning feature `application/` |
| API contract schemas and envelopes | `@emme/api/contracts` |
| business input schemas | owning feature `validation/` |
| one-app form schemas | owning app workflow |
| generic schema helper with no business ownership | explicitly documented shared boundary only |

The historical
[ADR-001](adr-001-library-ownership.md) and
[shared library architecture](library-architecture.md) describe the superseded
global-package model and are not normative for new work.

## Ownership checklist

- [ ] A file has exactly one package, feature, or app owner.
- [ ] Generic UI contains no business vocabulary.
- [ ] Business policy is not implemented by API or infrastructure adapters.
- [ ] Feature repository adapters stay with the feature whose ports they
      implement.
- [ ] App role/workflow policy is not promoted merely to reduce imports.
- [ ] Test support is absent from production dependency lists and bundles.
