# Dependency Rules

```text
feature domain         -> @emme/kernel
feature application    -> feature domain + @emme/kernel
feature API            -> @emme/api + feature contracts/mappers
feature infrastructure -> @emme/api + feature application ports
feature presentation   -> @emme/ui + @emme/core + @emme/i18n + feature APIs
apps                   -> selected features + core + ui + infrastructure + i18n
```

- Domain is React-, browser-, transport-, storage-, DTO-, infrastructure-, and app-free.
- Application receives protocol dependencies and never constructs adapters.
- UI has no business, API, application, infrastructure, or app dependency.
- Features use only other features' public contracts and barrels; packages never import app code; apps never import each other.
- Tenant context is explicit at API/application boundaries. Backend authorization, tenant isolation, validation, persistence, and invariants remain authoritative.
- Expected outcomes use `Result<T, E>` and typed feature errors. Unexpected faults reach the core error boundary and safe logging.

Plan 01 adds source-level enforcement for these rules; public exports are the only supported cross-boundary imports.
