# Feature Adapters

Each feature owns its API queries, mutations, fragments, mappers, and capability composition. Its infrastructure adapter implements application ports through injected `@emme/api` protocols; it does not move business policy into `@emme/infrastructure`.

Feature adapters translate DTOs to feature types, preserve typed errors, and take explicit tenant/auth context. Mapper and contract tests cover successful, empty, malformed, validation, conflict, permission, tenant mismatch, and retryable transport responses.
