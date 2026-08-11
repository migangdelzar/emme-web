# Package Ownership

| Package | Owns | Must not own |
| --- | --- | --- |
| `@emme/kernel` | `Result`, typed errors, branded IDs, nullable types, clock protocols | React, browser APIs, HTTP, API DTOs, app/runtime code, adapters |
| `@emme/ui` | generic tokens, visual components, accessibility, layouts, forms, platform exports | business names or feature/API/application/infrastructure imports |
| `@emme/core` | auth/session, tenant context, permission guards, runtime/module config, routing, logging, flags, normalized errors | feature business policy or concrete HTTP/storage |
| `@emme/auth` | shared authentication gate primitive and auth boundary types | login pages, tenant selector presentation, salon product features, session storage, authorization decisions |
| `@emme/i18n` | engine, shared catalogs, locale providers, formatters, translation test provider | reusable feature namespace copy or app-only workflow copy |
| `@emme/api` | transport protocols, envelopes, API errors, pagination, contract validation, auth/tenant request contracts, generated types | concrete `fetch`, browser storage, React providers, feature use cases |
| `@emme/infrastructure` | global HTTP/provider clients, auth/session storage, tenant resolution, browser storage, telemetry | business policy or feature repository implementations |
| `@emme/business` | framework-free business capabilities, domain rules, application use cases, ports, and business DTOs | React, browser APIs, transport clients, app workflows |
| `@emme/validation` | shared schema primitives and contract-independent validation helpers | salon pages, feature workflows, authorization |
| `@emme/test-support` | test-only providers, fakes, fixtures, handlers, setup | production runtime dependencies or real credentials/providers |

## Business ownership

Reusable business concepts, policies, use cases, ports, and business DTOs stay
together under `packages/business/src/<capability>`. Salon API operations,
mappers, repository adapters, presentation, translations, and tests stay with
the owning feature under `apps/salon-app/src/features/<feature>`.

Apps own routes, layouts, navigation, branding, role-specific permission
composition, forms/filters tied to one workflow, and workflow orchestration.
Only framework-free behavior with demonstrated reuse belongs in
`@emme/business`. Do not create a shared React feature package until a future
product decision explicitly establishes a second consuming app.

## Transitional packages

`@emme/domain` and `@emme/application` were migration sources, not target
package boundaries. Their content moves as follows:

| Transitional content | Canonical owner |
| --- | --- |
| domain entities, value objects, policies, services, typed errors | `@emme/business/<capability>/domain/` |
| commands, queries, ports, and DTOs | `@emme/business/<capability>/application/` |
| API contract schemas and envelopes | `@emme/api/contracts` |
| business input schemas | `@emme/business/<capability>/validation/` when reusable |
| one-app form schemas | owning salon app workflow |
| generic schema helper with no business ownership | explicitly documented shared boundary only |

The superseded global-package decision is retained outside the active handbook
in [`docs/archive/architecture`](../../archive/architecture/). It is not
normative for new work.

## Ownership checklist

- [ ] A file has exactly one package, feature, or app owner.
- [ ] Generic UI contains no business vocabulary.
- [ ] Business policy is not implemented by API or infrastructure adapters.
- [ ] Feature repository adapters stay with the feature whose ports they
      implement.
- [ ] App role/workflow policy is not promoted merely to reduce imports.
- [ ] Test support is absent from production dependency lists and bundles.
