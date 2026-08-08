# Workspace and Architecture Handbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Enforce workspace boundaries and document the complete repository structure, ownership, naming, and architecture rules.

**Architecture:** Keep Bun workspaces and add machine-checkable package boundaries. The handbook is the human-readable source of truth; package manifests, TypeScript configs, and boundary tests enforce it.

**Tech Stack:** Bun, TypeScript, Vitest, ESLint, Markdown validation.

## Global Constraints

- Preserve `apps/emme-salon-app` and `@emme/emme-salon-app`.
- Use kebab-case for package/layer directories and PascalCase for React component directories/files.
- Public imports use package and feature barrels.
- No package imports an app or another app's internals.
- Every boundary rule has a source-level test.
- The handbook preserves the canonical detailed package trees, feature trees, app workflow trees, diagrams, and checklists from the approved architecture proposal; summary-only pages are insufficient.

## Files

- Modify: `package.json`, workspace package manifests, package `tsconfig.json` files, existing boundary tests.
- Create: `packages/kernel/`, `configs/`, and the handbook files under `docs/architecture/00-project/`, `01-runtime/`, `02-frontend/`, `03-integration/`, `04-delivery/`, and `05-operations/`.
- Test: `packages/*/src/__tests__/package-boundary.test.ts` and `scripts/validate-architecture.mjs`.

### Task 1: Add architecture handbook structure

- [ ] **Step 1:** Write `docs/architecture/README.md` with links to every retained and new handbook page, an explicit historical/superseded label for legacy pages, the master plan index, and a canonical-structure checklist.
- [ ] **Step 2:** Write the project pages with the exact root/package trees, package-specific trees for kernel/ui/core/i18n/api/infrastructure/features/test-support, naming tables, public-export rules, and a Mermaid dependency diagram.
- [ ] **Step 3:** Write the feature pages with the complete appointments example (`domain`, `application`, `api`, `infrastructure`, `validation`, `presentation`, `i18n`, `test`) and app workflow trees for salon, client, and platform-admin modules.
- [ ] **Step 4:** Write runtime, frontend, integration, delivery, and operations pages with `defineAppConfig`/`defineModule` examples, validation-layer diagrams, test-location checklists, error flows, and quality gates.
- [ ] **Step 5:** Update or explicitly mark every retained page that conflicts with vertical ownership, including `docs/architecture/00-project/library-architecture.md`; the handbook must not leave competing normative guidance in place.
- [ ] **Step 6:** Run `bun run docs:check`; expected result is zero Markdown validation errors, and run a link scan proving every handbook page is indexed.

### Task 2: Add machine-checkable dependency rules

**Test:** `scripts/validate-architecture.test.mjs`

```js
import { expect, test } from 'vitest';
import { validateWorkspaceArchitecture } from './validate-architecture.mjs';

test('rejects imports from applications into packages', async () => {
  const result = await validateWorkspaceArchitecture({ root: '/workspace' });
  expect(result.violations.filter((v) => v.rule === 'package-cannot-import-app')).toEqual([]);
});
```

- [ ] **Step 1:** Run `bunx vitest run scripts/validate-architecture.test.mjs`; expected result is FAIL because the validator does not exist.
- [ ] **Step 2:** Implement `scripts/validate-architecture.mjs` to scan package source files and report package-to-app imports, `@/` aliases outside apps, UI business imports, and feature private-path imports.
- [ ] **Step 3:** Run the focused test and `bun run typecheck`; expected result is PASS.
- [ ] **Step 4:** Add `architecture:check` to the root `package.json` and include it in `quality`.

### Task 3: Normalize workspace exports and configs

- [ ] **Step 1:** Add explicit `exports` entries for public package roots and feature subpaths.
- [ ] **Step 2:** Add shared strict TypeScript, ESLint, Prettier, and Vite config files under `configs/` without changing Bun workspace behavior.
- [ ] **Step 3:** Add boundary tests that import only public barrels and reject private paths.
- [ ] **Step 4:** Run `bun run architecture:check`, `bun run typecheck`, and `bun run build`; expected result is PASS.

### Task 4: Commit the governance slice

```bash
git add package.json configs scripts/validate-architecture.mjs scripts/validate-architecture.test.mjs docs/architecture packages/*/package.json packages/*/tsconfig.json
git commit -m "chore(architecture): enforce workspace boundaries and handbook"
```

## Definition of Done

- [ ] Handbook pages exist and cross-link correctly.
- [ ] Architecture checks run from the root.
- [ ] Package exports and forbidden imports are enforced.
- [ ] Existing app behavior remains unchanged.
