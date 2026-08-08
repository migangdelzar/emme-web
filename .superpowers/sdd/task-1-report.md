# Task 1 Report: Establish the `@emme/ui` Package Boundary

## Status

DONE_WITH_CONCERNS

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

- `Button` is intentionally a minimal boundary stub for Task 1. It is not the migrated production Button primitive; Task 2 must replace this export with the real component and behavior tests.

## Commits

- `1840525 test(ui): establish shared UI package boundary`

