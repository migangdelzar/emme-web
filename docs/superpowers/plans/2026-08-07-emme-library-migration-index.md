# Emme Library Migration Plan Index

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement each plan task-by-task. Use the package plans in dependency order.

**Goal:** Migrate the Bun workspace into ten reusable libraries and integrate the current tenant application without breaking existing routes, contracts, or E2E behavior.

**Architecture:** Pure domain rules and application use cases remain framework-independent. API contracts describe the backend boundary, infrastructure implements external systems, core owns runtime concerns, UI owns generic components, and features are promoted only after cross-app reuse is proven.

**Tech Stack:** TypeScript, React 19, Vite, Bun workspaces, Vitest, Testing Library, Playwright, TanStack Query, Zod 4, i18next, Zustand.

## Global Constraints

- Keep Bun workspaces and `bun.lock`; do not add pnpm or Turbo.
- Preserve `apps/emme-salon-app` and `@emme/emme-salon-app` names.
- Preserve backend routes, API payload behavior, tenant isolation, and current E2E selectors.
- Use Red → Green → Refactor for new behavior.
- Colocate unit/component tests; use `src/__tests__/` for package integration tests; keep E2E under `e2e/`.
- Use PascalCase for React components/pages and kebab-case for hooks, services, schemas, domain files, mappers, validators, permissions, and stores.
- Use plural capability folders and singular model filenames.
- `@emme/domain` has no workspace dependencies; `@emme/application` depends only on `@emme/domain`.
- `@emme/api` has no concrete network implementation; `@emme/infrastructure` implements external adapters.
- `@emme/test-support` is never a production dependency.
- Use Zod 4 consistently across the workspace.
- Do not create tenant-specific frontend branches or application folders.

## Plan order

| Order | Plan | Depends on |
|---:|---|---|
| 1 | [UI](2026-08-07-01-ui-plan.md) | none |
| 2 | [Validation](2026-08-07-02-validation-plan.md) | none |
| 3 | [i18n](2026-08-07-03-i18n-plan.md) | none |
| 4 | [Test support](2026-08-07-04-test-support-plan.md) | UI/core test contracts as needed |
| 5 | [Domain](2026-08-07-05-domain-plan.md) | none |
| 6 | [Application](2026-08-07-06-application-plan.md) | domain |
| 7 | [API](2026-08-07-07-api-plan.md) | transport contracts only |
| 8 | [Infrastructure](2026-08-07-08-infrastructure-plan.md) | API, application |
| 9 | [Core](2026-08-07-09-core-plan.md) | API ports where runtime providers need them |
| 10 | [Features](2026-08-07-10-features-plan.md) | UI, core, application, API, i18n, validation |
| 11 | [Salon integration](2026-08-07-11-emme-salon-app-integration-plan.md) | all required packages |

`@emme/features` is conditional. Its plan establishes promotion criteria and a
package boundary; feature code is promoted only when two applications need the
same React behavior.

## Cross-plan migration contract

```text
Component/page
  → feature hook
  → application use case (when orchestration is needed)
  → application port
  → infrastructure adapter
  → API capability operation
  → infrastructure HTTP client
  → backend
```

Every plan must finish with:

```bash
bun run --filter <package> typecheck
bun run --filter <package> test
```

The integration plan additionally runs:

```bash
bun run docs:check
bun run i18n:check
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
bun run security:check
bun run test:e2e:mock
```

## Definition of done

- [ ] Every plan task is complete and independently verified.
- [ ] Public package exports are used by consumers; private internals are not imported across boundaries.
- [ ] Old app-owned duplicate implementations are deleted only after import scans pass.
- [ ] Package and app tests pass with no skipped unit tests.
- [ ] Existing mock E2E coverage remains green.
- [ ] Each logical task is committed with a conventional commit message.
