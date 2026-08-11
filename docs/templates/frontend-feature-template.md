# Feature Spec, Design, and Execution Plan

Copy this file for a new feature. Replace every `<placeholder>` and remove
sections that do not apply. Keep the document with the owning application or
domain capability.

Suggested location:

```text
docs/<app-or-domain>/features/<feature>/<feature>-spec-plan-design.md
```

The feature must follow the [architecture handbook](../architecture/README.md),
especially [feature ownership](../architecture/00-project/feature-module-structure.md),
[architecture patterns](../architecture/00-project/architecture-patterns.md),
and [boundary verification](../architecture/00-project/boundary-verification.md).

---

## Metadata

| Field | Value |
| --- | --- |
| Feature | `<feature-name>` |
| Product/app | `<salon-app \| client-app \| admin-app \| shared business>` |
| Owner | `<team/person>` |
| Status | Draft |
| Date | `<YYYY-MM-DD>` |
| Requirements | `<links or IDs>` |
| Related API contract | `<link or N/A>` |
| Related ADR | `<link or N/A>` |

## 1. Objective

### Problem

<What problem does this feature solve? Describe the user or business outcome.>

### Objective

<What will exist when this feature is complete?>

### Success criteria

- [ ] `<observable outcome 1>`
- [ ] `<observable outcome 2>`
- [ ] `<observable outcome 3>`

## 2. Scope

### In scope

- `<capability or workflow>`
- `<screen, route, API operation, or business rule>`

### Out of scope

- `<explicitly excluded behavior>`
- `<future behavior that must not be invented now>`

## 3. Requirements and acceptance criteria

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| `<REQ-01>` | `<requirement>` | Given `<context>`, when `<action>`, then `<observable result>`. |
| `<REQ-02>` | `<requirement>` | Given `<context>`, when `<action>`, then `<observable result>`. |

### Edge and failure cases

- Empty state: `<behavior>`
- Invalid input: `<behavior>`
- Unauthorized/forbidden: `<behavior>`
- Tenant mismatch: `<behavior>`
- Offline/timeout/provider failure: `<behavior>`
- Duplicate submit/idempotency: `<behavior>`
- Stale response or route/session change: `<behavior>`

## 4. Architecture placement

### Pattern scope

Select the patterns that apply and explain their scope:

- [ ] FSD-inspired vertical feature slice — app workflow and presentation.
- [ ] Hexagonal/Clean — ports, use cases, adapters, and dependency direction.
- [ ] Capability-oriented DDD — rules, invariants, domain types, and use cases.
- [ ] Component-Driven Development — generic reusable UI in `@emme/ui`.

### Ownership decision

| Responsibility | Owner | Reason |
| --- | --- | --- |
| Route/page/workflow | `apps/<app>/src/features/<feature>` | App owns user-facing behavior. |
| Reusable business rule | `@emme/business/<capability>` | Framework-free and used by multiple consumers. |
| Transport contract | `@emme/api` | Shared backend-facing contract. |
| Concrete HTTP/storage/provider adapter | `@emme/infrastructure` or feature adapter | Technical side effect behind a protocol. |
| Runtime auth/tenant/permissions | `@emme/core` | Cross-feature runtime concern. |
| Generic UI primitive | `@emme/ui` | No business vocabulary or policy. |

Do not move code to a shared package only because two screens look similar. A
shared extraction requires a real second consumer and a stable public contract.

## 5. Proposed structure

Only create folders for responsibilities the feature actually has.

```text
apps/<app>/src/features/<feature>/
├── pages/                         # route-level screens when needed
├── components/                    # feature-specific UI
├── hooks/                         # React/query/workflow orchestration
├── api/                           # query/mutation composition and mapping
├── mappers/                       # API/application output → view model
├── domain/                        # app-only business rules when justified
├── application/                   # app-only use cases/ports when justified
├── infrastructure/                # concrete adapter for a local port
├── presentation/                  # feature-specific view models/components
├── state/                         # feature-local workflow/UI state
├── validation/                    # form, URL, and filter schemas
├── shared/                        # feature-local reusable pieces
├── test/                          # feature fixtures/integration tests
└── index.ts                       # public feature boundary
```

### Current structure

```text
<Paste the relevant current tree here.>
```

### Target structure

```text
<Paste the proposed tree here. Mark NEW files with comments.>
```

### Route and module registration

```text
app/router.tsx
  → feature route/page
  → feature hook/workflow
  → feature API composition
  → shared contract/port
```

The app shell owns route registration and global providers. The feature owns
the user outcome from route entry through completion.

## 6. Feature workflow design

Describe the vertical flow:

```text
User action
  → page/component
  → feature hook or workflow state
  → feature validation
  → feature query/mutation
  → @emme/api contract or application port
  → injected adapter
  → backend/provider
  → mapper/view model
  → loading/success/error/recovery UI
```

### Feature owns

- [ ] Page/screen composition for the outcome.
- [ ] Loading, empty, error, forbidden, unavailable, and success states.
- [ ] Feature-specific form/filter validation.
- [ ] Query keys, mutation orchestration, and cache invalidation.
- [ ] View-model mapping and business-specific UI.
- [ ] Feature-local permissions/navigation metadata when applicable.
- [ ] Feature behavior and recovery tests.

### Feature does not own

- [ ] Global session, tenant, or permission providers.
- [ ] Concrete HTTP clients or browser storage.
- [ ] Generic buttons, tables, dialogs, or design tokens.
- [ ] Backend authorization or tenant isolation.
- [ ] Another app's private features.

## 7. Contracts and protocols

### Inputs

```ts
export interface <Feature>Input {
  // Define validated input at the feature boundary.
}
```

### Outputs/view model

```ts
export interface <Feature>ViewModel {
  // Define data required by the feature UI, not raw transport DTOs.
}
```

### Service/application protocol

```ts
export interface <Capability>Port {
  execute(input: <Feature>Input): Promise<Result<<Feature>Output, <Feature>Error>>;
}
```

Document:

- dependency injection requirements;
- tenant and auth context requirements;
- idempotency and cancellation behavior;
- timeout/retry behavior;
- typed error categories;
- public exports and forbidden deep imports.

## 8. State ownership

| State | Owner | Persistence/cache rule |
| --- | --- | --- |
| Server state | TanStack Query / feature API hook | `<query key and invalidation>` |
| URL state | Router | `<parse/serialize rule>` |
| Workflow state | Feature hook/state machine | `<lifecycle and reset rule>` |
| Local UI state | Component or feature-local store | `<why it is not global>` |
| Derived state | Mapper/selector | `<source of truth>` |

Do not duplicate server truth into unrelated global stores. Cancel or ignore
stale work when route, session, or tenant context changes.

## 9. Error and recovery design

| Scenario | Detection | User behavior | Logging/telemetry |
| --- | --- | --- | --- |
| Validation | `<schema/result>` | `<inline errors>` | `<redacted event or none>` |
| Unauthorized | `<status/error>` | `<sign-in recovery>` | `<safe event>` |
| Forbidden | `<status/error>` | `<no-access state>` | `<safe event>` |
| Tenant mismatch | `<typed error>` | `<clear/reselect tenant>` | `<correlation ID>` |
| Timeout/offline | `<transport error>` | `<retry/offline state>` | `<bounded event>` |
| Conflict | `<business error>` | `<refresh/reconcile>` | `<safe event>` |
| Unexpected fault | `<error boundary>` | `<generic recovery>` | `<redacted diagnostic>` |

## 10. Accessibility, security, and i18n

### Accessibility

- [ ] Accessible names and roles are defined.
- [ ] Keyboard and focus behavior is specified.
- [ ] Errors are associated with controls.
- [ ] Loading, empty, denied, and unavailable states are accessible.
- [ ] Reduced-motion behavior is defined when applicable.

### Security and tenancy

- [ ] No secret is placed in browser configuration, URLs, logs, or analytics.
- [ ] Backend authorization remains authoritative.
- [ ] Tenant context is explicit and validated by the backend.
- [ ] Sensitive data is absent from error, loading, and denied states.

### Internationalization

- [ ] Shared messages use `@emme/i18n`.
- [ ] Feature-specific messages have an explicit owner.
- [ ] Formatting is locale-aware and tested.

## 11. Test strategy

Every boundary needs a focused test or architecture-validator rule.

| Test level | Test location | Coverage |
| --- | --- | --- |
| Domain rules | `packages/business/<capability>` or feature `domain/` | Invariants and typed errors |
| Application/ports | `application/` or feature `test/` | Protocol orchestration with fakes |
| Validation | Beside schema | Accepted, rejected, normalized, boundary inputs |
| API/mappers | Beside API/mappers | DTO parsing, mapping, errors, tenant context |
| Adapters | Beside infrastructure | HTTP/storage/provider behavior, retry, timeout, redaction |
| Components/hooks | Beside source | Observable behavior, accessibility, recovery |
| Feature boundary | Feature `feature-boundary.test.ts` | Ownership, public exports, no private imports |
| Package boundary | `src/__tests__/package-boundary.test.ts` | Forbidden dependencies and public API |
| App boundary | `apps/<app>/src/__tests__` | No app-to-app imports, route isolation |
| E2E | `e2e/` | Critical mocked and configured real journeys |

### TDD task loop

Every behavior task follows:

1. **Red:** write the smallest failing test.
2. **Green:** implement the minimum behavior.
3. **Refactor:** simplify while tests remain green.
4. **Verify:** run focused, package, and repository checks.

## 12. Execution plan

| # | Task | Test first | Source/docs | Status |
| --- | --- | --- | --- | --- |
| 1 | `<vertical slice or contract>` | `<test path>` | `<source path>` | ⬚ Not Started |
| 2 | `<vertical slice or contract>` | `<test path>` | `<source path>` | ⬚ Not Started |
| 3 | `<boundary verification>` | `<boundary test/validator>` | `<docs or validator>` | ⬚ Not Started |

Status key: ⬚ Not Started · 🔴 Red · 🟢 Green · 🔵 Refactored · ✅ Done

### Dependencies

```text
Task 1 → Task 2 → Task 3
```

`<Explain what must be sequential and what can be parallel.>`

## 13. Verification commands

```bash
bun run docs:check
bun run architecture:check
bun run typecheck
bun run --filter <app-or-package> test
bun run --filter <app> build
bun run test
```

## 14. Decisions and open questions

### Decisions

- `<Decision>` — `<reason and consequence>`

### Open questions

- `<Question>` — `<owner and decision deadline>`

## 15. Definition of done

- [ ] Requirements and acceptance criteria are satisfied.
- [ ] Current and target structures are documented.
- [ ] Feature ownership and dependency direction are explicit.
- [ ] Protocols are injected; concrete dependencies are composition-root owned.
- [ ] Tests were written before behavior implementation.
- [ ] Boundary tests or architecture validation exist.
- [ ] Loading, empty, error, forbidden, unavailable, and success states are
      covered where applicable.
- [ ] Accessibility, security, tenancy, and i18n requirements are covered.
- [ ] `bun run docs:check` passes.
- [ ] `bun run architecture:check` passes.
- [ ] Focused tests, affected package/app tests, and build pass.
- [ ] No secrets or local-only artifacts are committed.
- [ ] Changes are committed in logical conventional commits and pushed.
