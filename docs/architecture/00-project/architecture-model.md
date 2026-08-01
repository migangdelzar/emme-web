# Frontend Architecture Model

## Ownership

The web repository owns presentation and interaction. The service repository owns
authorization, tenancy, validation, persistence, business invariants, and event
contracts.

```mermaid
flowchart TB
    Shell["App shell"] --> Feature["User-facing feature"]
    Feature --> Client["Typed API client"]
    Client --> Contract["Versioned service contract"]
    Contract --> Service["emme-service"]
    Feature --> Shared["Stable shared package"]
```

## Rules

- A frontend feature MUST own a user outcome, not a backend table.
- UI code MUST consume typed contracts and adapters, never service internals.
- Shared packages MUST be stable, deliberately reusable, and framework-aware only
  when that is their documented responsibility.
- Authentication and authorization decisions remain server-side; route guards
  improve UX but are not security controls.
- Browser configuration MUST distinguish public values from private secrets.
- Network, time, storage, and browser APIs remain visible at adapter boundaries.

## Dependency direction

```mermaid
flowchart LR
    View["React view"] --> FeatureState["Feature state / hook"]
    FeatureState --> Adapter["Feature API adapter"]
    Adapter --> Client["@emme/api-client"]
    Client --> Contract["@emme/contracts"]
    Contract --> HTTP["HTTP boundary"]
```

## Verification

- TypeScript strict checks and package dependency review.
- Component tests for observable UI behavior.
- Contract tests for request/response mapping.
- Playwright for critical real-stack journeys.
- Accessibility and security checks for changed user flows.
