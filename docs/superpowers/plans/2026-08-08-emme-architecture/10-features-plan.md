# Salon-Owned Feature Migration Plan

> This document replaces the previous plan to promote a shared React feature package. The approved design is salon-first: the salon application owns presentation and workflows, while shared packages own only stable business foundations.

## Goal

Move salon pages, hooks, feature state, and salon-specific components from `@emme/features` into `apps/salon-app/src/features`, while preserving reusable rules, use cases, and API contracts in `@emme/business` and `@emme/api`.

## Target ownership

```text
apps/salon-app/src/features/
  appointments/
  clients/
  dashboard/
  finances/
  onboarding/
  services/
  settings/
  auth/

packages/business/     # domain and application layers by capability
packages/api/          # transport contracts and API operations
packages/features/     # temporary compatibility facade; remove later
```

## Migration phases

| Phase | Scope | Exit criteria |
|---|---|---|
| 1 | Add local salon feature boundaries and move app shell-owned UI | Routes import local modules; app tests pass |
| 2 | Move appointments presentation and salon workflow logic | Agenda behavior and real-provider Playwright pass |
| 3 | Move clients and services presentation | Feature tests, build, and Playwright pass |
| 4 | Move finances and integrations where appropriate | No accidental shared UI extraction remains |
| 5 | Remove `@emme/features` | No app imports remain; architecture checks and full quality suite pass |

## Rules

- Do not create a shared React feature for hypothetical future consumers.
- Do not move business rules into the salon app.
- Do not split `@emme/business` into separate domain/application packages without independent consumers or release requirements.
- Do not add empty `pages`, `hooks`, `state`, or `validation` folders.
- Preserve current routes, API behavior, test selectors, and real-provider flows.
- Add a second consumer before extracting a React component or hook to a shared package.

## Verification per phase

```bash
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:e2e:mock
# Run the real-provider Playwright project when the local provider is available.
```

The detailed design is documented in:

[`2026-08-09-salon-first-architecture-design.md`](../../specs/2026-08-09-salon-first-architecture-design.md)
