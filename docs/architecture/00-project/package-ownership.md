# Package Ownership

| Package | Owns | Must not own |
| --- | --- | --- |
| `@emme/kernel` | `Result`, typed errors, branded IDs, clock protocols | React, browser, HTTP, DTOs, adapters |
| `@emme/ui` | generic tokens, visual components, accessibility, platform exports | business names or feature/API/runtime imports |
| `@emme/core` | auth/session, tenant context, permission guards, runtime config, routing contracts, normalized errors | feature business policy |
| `@emme/i18n` | engine, shared catalogs, locale providers and formatters | reusable feature namespace copy |
| `@emme/api` | transport protocols, envelopes, API errors, contract validation, auth/tenant request contracts | `fetch`, storage, React providers, feature use cases |
| `@emme/infrastructure` | HTTP, storage, telemetry and external-provider adapters | business policy or feature repositories |
| `@emme/features` | reusable vertical business modules and their public barrels | a second global application/domain layer |
| `@emme/test-support` | test-only fakes, fixtures, handlers and providers | production runtime dependencies |

The legacy `@emme/domain`, `@emme/application`, and `@emme/validation` packages are migration sources. Future domain, use-case, and business-schema ownership moves to the owning feature; API schemas move to `@emme/api/contracts`.
