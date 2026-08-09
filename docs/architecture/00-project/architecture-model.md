# Frontend Architecture Model

> **Status: Updated.** This retained overview now reflects the canonical
> salon-first ownership model. The previous global `@emme/domain`,
> `@emme/application`, and shared React feature-package diagrams are superseded.

## Two-repository ownership

The web repository owns presentation, interaction, browser composition, and
transport consumption. The service repository owns authorization, tenant
isolation, canonical validation, persistence, business invariants, and event/
HTTP contracts.

```mermaid
flowchart LR
    User --> Web["emme-web\nReact + Vite / Nginx"]
    Web -->|"typed, versioned API contract"| Service["emme-service\nbackend authority"]
    Service --> Data[(PostgreSQL / Redis)]
    Web --> WebTelemetry["browser telemetry"]
    Service --> ServiceTelemetry["service telemetry"]
```

The repositories release independently while contracts remain compatible. A
breaking contract requires a coordinated compatibility window and migration.

## Vertical ownership

```mermaid
flowchart TB
    Shell["App shell"] --> SalonFeature["salon-app local feature"]
    SalonFeature --> Business["@emme/business capability"]
    SalonFeature --> Api["@emme/api contracts"]
    SalonFeature --> UI["@emme/ui"]
    Shell --> Auth["@emme/auth gate + app-local login"]
    Auth --> Core["@emme/core session"]
    Shell --> GlobalInfrastructure["@emme/infrastructure"]
    GlobalInfrastructure --> Service["emme-service"]
```

The invariant is explicit ownership: salon workflows and presentation remain in
the salon app; framework-free rules and use cases with demonstrated reuse live
in `@emme/business`; only authentication UI is shared across the app shells.

## Rules

- A frontend feature owns a user or business outcome, not a backend table.
- UI consumes typed contracts and adapters, never service internals.
- Shared packages are stable and deliberately reusable; framework awareness is
  allowed only where documented.
- Authentication and authorization decisions remain server-side; route guards
  improve UX but are not security controls.
- Browser configuration distinguishes public values from private secrets.
- Network, time, storage, and browser APIs remain visible at adapter boundaries.
- App workflows consume feature public exports and never another app's internals.

## Verification

- TypeScript strict checks and package dependency review.
- Public-export and forbidden-import boundary tests.
- Domain, application, schema, mapper, adapter, and component tests.
- Playwright for critical mocked and configured real-stack journeys.
- Accessibility, security, delivery, and operational evidence for changed flows.
