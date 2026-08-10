# Salon-First Business Consolidation and UI Migration Plan

| Field | Detail |
| --- | --- |
| Scope | `@emme/business`, `@emme/auth`, salon-owned product features |
| Apps | `admin-app`, `salon-app`, `client-app` remain separate deployables |
| Package manager | Bun workspace |
| Status | Implementation complete; real-provider deployment remains environment-dependent |

## Architecture contract

- `@emme/business` is one framework-free package with capability-local
  `domain/` and `application/` layers.
- `apps/salon-app/src/features` owns all current product pages, hooks, state,
  API composition, workflows, and business-specific UI.
- `@emme/auth` provides the shared authentication gate and is used by all three
  app shells. Login and tenant-selection screens are app-local so each app can
  have distinct branding and flow.
- `@emme/ui`, `@emme/core`, `@emme/api`, `@emme/infrastructure`, and
  `@emme/i18n` remain shared technical packages.
- `@emme/features`, `@emme/domain`, and `@emme/application` are retired as
  ownership boundaries.

## Task list

| # | Task | Status |
| --- | --- | --- |
| 1 | Create `@emme/business` package boundary and tests | ✅ Done |
| 2 | Consolidate appointment domain/application code into business | ✅ Done |
| 3 | Move salon presentation and workflows into local feature folders | ✅ Done |
| 4 | Remove duplicate salon appointment business layers | ✅ Done |
| 5 | Create shared `@emme/auth` gate and wire app-local login screens | ✅ Done |
| 6 | Localize remaining client placeholder components | ✅ Done |
| 7 | Remove `@emme/features` and package dependencies | ✅ Done |
| 8 | Reconcile architecture handbook, docs, and validators | ✅ Done |
| 9 | Run full regression, build, coverage, and E2E verification | 🔵 Done locally; real provider blocked |

## Target structure

```text
packages/
├── kernel/
├── ui/
├── core/
├── auth/
├── i18n/
├── api/
├── infrastructure/
├── business/
├── validation/
└── test-support/

apps/
├── admin-app/                 # auth shell only for now
├── salon-app/                 # owns current product features
└── client-app/                # auth shell only for now
```

## Verification order

```text
bun install --frozen-lockfile
→ bun run architecture:check
→ bun run docs:check
→ bun run typecheck
→ bun run lint
→ bun run test
→ bun run test:coverage
→ bun run build
→ bun run test:e2e:mock
→ real-provider Playwright when emme-service is available
```

## Definition of done

- [x] Architecture docs and source tree describe the same ownership model.
- [x] No source or manifest imports `@emme/features`, `@emme/domain`, or
      `@emme/application`.
- [x] All three app shells typecheck and render the shared auth gate with local
      login pages.
- [x] Salon feature tests and existing regression tests pass with no skipped
      tests introduced by this migration.
- [x] Full typecheck, build, coverage, mock E2E, architecture, and docs checks
      pass; real provider is blocked because backend/Keycloak are not running.
- [ ] All changes are committed and pushed to `feat/api-version-contract`.
