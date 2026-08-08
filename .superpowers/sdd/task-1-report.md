# Task 1 Report: Establish the `@emme/ui` Package Boundary

## Status

DONE

## Implementation summary

- Added the `@emme/ui` package-root type/import export shape consistent with sibling packages.
- Replaced the placeholder test script with `vitest run` and declared Vitest plus Node typings as development dependencies.
- Added the first public `Button` component boundary export without introducing business or infrastructure dependencies.
- Added a package-boundary test covering the public `Button` export and forbidden business/app imports from the package barrel.

## Files changed

- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/src/index.ts`
- `packages/ui/src/__tests__/package-boundary.test.ts`

The report file itself is also created at `.superpowers/sdd/task-1-report.md` as requested. No unrelated source files, lockfiles, or build output were changed.

## TDD evidence

### RED

Created `packages/ui/src/__tests__/package-boundary.test.ts` before adding the `Button` export.

Command:

```text
bunx vitest run packages/ui/src/__tests__/package-boundary.test.ts
```

Result: 1 failed, 1 passed. The expected failure was:

```text
expected 'undefined' to be 'function'
```

This demonstrated that the test failed because the public `Button` export was absent.

### GREEN

Added the minimal package test harness, public export shape, and `Button` boundary function.

Commands:

```text
bun run --filter @emme/ui test
bun run --filter @emme/ui typecheck
```

Result:

```text
Test Files  1 passed (1)
Tests       2 passed (2)
typecheck   exited with code 0
```

The initial GREEN attempt exposed and fixed a harness issue: Vitest global type declarations do not create runtime globals, so the test explicitly imports `describe`, `expect`, and `it`.

### REFACTOR / verification

Ran `git diff --check` successfully. The final focused test and typecheck remained green after the harness correction.

## Self-review

- The change is limited to the four implementation files named by the task brief.
- The package has no imports from `@emme/domain`, `@emme/application`, `@emme/api`, `@emme/infrastructure`, or app paths.
- The package export map now follows the established `types`/`import` sibling-package convention.
- The test checks the package barrel rather than an internal component path.
- No business dependencies were added.

## Concerns

None blocking. `Button` is intentionally a minimal boundary export for Task 1; its production behavior and behavior tests are explicitly scoped to Task 2.

## Commits

- `1840525 test(ui): establish shared UI package boundary`
- `73c4039 docs(sdd): add task 1 migration report`

## Reviewer fix: boundary coverage and Button component contract

### Files changed

- `packages/ui/src/__tests__/package-boundary.test.ts` — recursively scans every `.ts` and `.tsx` file under `src` for forbidden business, infrastructure, and app imports.
- `packages/ui/src/components/Button/Button.tsx` — adds the minimal PascalCase Button component with native keyboard semantics, accessible children, disabled handling, and loading state.
- `packages/ui/src/components/Button/Button.test.tsx` — colocated tests for accessible name, keyboard activation, disabled behavior, and loading behavior.
- `packages/ui/src/components/Button/index.ts` — component-local barrel.
- `packages/ui/src/index.ts` — clean package public barrel exporting the component directory barrel and its type.
- `packages/ui/package.json` — adds React Testing Library, user-event, and happy-dom test dependencies.
- `bun.lock` — records the new `@emme/ui` test dependencies.

### Reviewer-fix TDD evidence

#### RED

The new colocated behavior test was authored before the final component restoration. With the Button implementation and public export removed, the focused test failed for the expected missing implementation:

```text
bun run --filter @emme/ui test -- src/components/Button/Button.test.tsx
Error: Failed to resolve import "./Button.js" from "src/components/Button/Button.test.tsx".
Test Files 1 failed (1)
Tests no tests
Exited with code 1
```

The first package-level run also confirmed the new test harness required its declared React Testing Library dependencies. After dependency installation, the behavior tests initially exposed shared-DOM cleanup and matcher issues; those were corrected in the test setup without changing the component contract.

#### GREEN

Restored the minimal Button implementation and public barrel export, then ran:

```text
bun run --filter @emme/ui test
bun run --filter @emme/ui typecheck
git diff --check
```

Output:

```text
Test Files  2 passed (2)
Tests       5 passed (5)
@emme/ui typecheck: Exited with code 0
```

`git diff --check` also exited successfully.

### Fix self-review

- The package boundary now scans all TypeScript source files instead of only `src/index.ts`.
- `Button` is located at `src/components/Button/Button.tsx` with a colocated test and local barrel.
- The component uses a native `<button>`, so it remains keyboard-focusable and keyboard-activatable without custom key handlers.
- Disabled buttons set the native `disabled` property; loading buttons set both `disabled` and `aria-busy="true"` while preserving their accessible name.
- The package public barrel contains only package metadata and explicit component/type re-exports; it has no business or infrastructure imports.
- No unrelated source files were modified. The lockfile change is limited to the declared UI test dependencies.

### Reviewer-fix concerns

None blocking.
