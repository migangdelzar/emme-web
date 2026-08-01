# Web Architecture Completion Plan

| Field | Value |
|---|---|
| Repository | `emme-web` |
| Base | `main` with approved architecture/i18n/CI commits |
| Branch | `feat/web-architecture-completion` |
| Status | In progress — transport boundary normalized |
| Date | 2026-07-31 |

## Objective

Complete the frontend side of the two-repository architecture. The web
application consumes the service through typed contracts and feature adapters;
it does not reproduce backend domain or persistence packages. The shared
boundary must have one HTTP implementation, explicit transport models, stable
Problem Details handling, and tests that prove the dependency direction.

## Work packages

### A. Normalize package ownership and dependency direction

- ✅ Remove the `@emme/contracts` → `@emme/api-client` dependency cycle.
- ✅ Correct stale package documentation that described the REST boundary as
  GraphQL/gRPC.
- ✅ Keep route constants and transport types in `@emme/contracts`.
- ✅ Keep request execution and error translation in `@emme/api-client`.

### B. Consolidate the HTTP boundary

- ✅ Add a public `createHttpClient` factory to `@emme/api-client`.
- ✅ Preserve lazy token and tenant providers, JSON/problem parsing, and empty
  response behavior.
- ✅ Make the application REST facade delegate to this shared boundary rather
  than reimplementing headers and error handling.
- ✅ Add focused tests before implementation for the new factory behavior.

### C. Make transport adapters explicit and typed

- ✅ Replace `any` in shared contract mappers with `unknown` plus narrow guards.
- ✅ Keep transport response types separate from feature view models.
- ✅ Preserve compatibility with the current service response aliases while making
  unsupported payloads fail predictably.
- ✅ Add boundary tests for canonical responses and legacy-compatible aliases.

### D. Verify and document

- ✅ Update the frontend integration handbook with the concrete package boundary.
- ✅ Run Markdown validation, typecheck, lint, unit tests, build, and security audit.
- ✅ Record results in `tasks/todo.md` and push the branch.

## Dependency graph

```mermaid
flowchart LR
    Feature[Feature hook / component] --> Adapter[Feature API adapter]
    Adapter --> Contract[@emme/contracts\ntransport types + routes]
    Adapter --> Client[@emme/api-client\nHTTP + Problem Details]
    Client --> Network[Browser fetch]
    Service[emme-service] --> Contract
```

## Definition of done

- [x] No package dependency cycle exists between contracts and API client.
- [x] Shared HTTP behavior is covered by tests and used by the app facade.
- [x] Shared mappers do not use implicit `any`.
- [x] Quality gates pass with zero failures.
- [x] Changes are committed and pushed from the feature branch.
