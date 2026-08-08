# Task 2 Report: Generic UI Primitives

## Status

Completed the package-only migration of source-backed generic primitives from
`apps/emme-salon-app/src/shared/ui` to `@emme/ui`. App source files and all app
consumers remain unchanged for Task 3.

## Files Changed

- `packages/ui/package.json` — declares the copied primitives' direct runtime
  dependencies.
- `bun.lock` — records the updated package dependency graph.
- `packages/ui/src/lib/utils.ts` — package-local `cn` helper, copied from the
  app utility without date/business helpers.
- `packages/ui/src/index.ts` — public barrel exports all migrated primitives.
- `packages/ui/src/components/Button/{Button.tsx,Button.test.tsx,index.ts}` —
  replaces Task 1's boundary implementation with the production variant while
  retaining the boundary's `loading` prop.
- `packages/ui/src/components/{Input,Select,Tabs,Tooltip,Dropdown,Table,Calendar,Avatar,Badge,Card,Skeleton,Modal,ConfirmDialog,Checkbox,Label,ScrollArea,Separator,Switch,Textarea}/`
  — PascalCase component modules and barrels. Every copied component keeps its
  original `data-slot`, class, and prop contract after app-alias localization.
- Colocated behavior tests:
  `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Tabs`,
  `Tooltip`, `Dropdown`, `Modal`, `ConfirmDialog`, and `Calendar`.

## TDD Evidence

### RED

Command:

```text
bun run --filter @emme/ui test
```

Result: exited `1` as expected. Eleven new behavior suites failed with
missing local component-module imports, and the updated Button test failed
because the Task 1 boundary implementation had no production `data-slot` or
variant contract:

```text
Failed Suites 11
Failed Tests 1
expected null to be 'button'
```

### GREEN

After copying the source-backed primitives and declaring their direct runtime
dependencies, the initial run correctly identified that Bun had not yet linked
the new package dependencies. I ran:

```text
bun install
```

Then the focused package suite passed:

```text
bun run --filter @emme/ui test
Test Files  13 passed (13)
Tests       26 passed (26)
Exited with code 0
```

The behavior coverage includes accessible names, keyboard activation,
disabled behavior, Button loading behavior, Select/Tabs navigation, Tooltip
focus reveal, and Dialog/AlertDialog focus management. Tests use `userEvent`
because it simulates the browser interaction sequence; dialog focus assertions
follow Radix's documented keyboard and focus semantics.

## Verification

```text
bun run --filter @emme/ui typecheck
@emme/ui typecheck: Exited with code 0

git diff --check
Exited with code 0
```

Additional self-review checks passed:

- production `packages/ui/src` has no imports from app paths or business,
  API, application, or infrastructure packages;
- 19 non-Button module copies exactly match their app source after only local
  import rewrites;
- the Button delta is intentional: it restores the production visual/data-slot
  implementation and preserves Task 1's tested optional `loading` behavior;
- neither the original source files nor app consumers were changed.

## Self-Review

The public barrel uses component-local barrels, and package code only depends
on React, presentation dependencies, and a local class-name helper. CSS class
strings and `data-slot` attributes were copied unchanged. The package contains
no business, tenant, API, or app imports. No source file contains a
`data-testid`; source `data-slot` contracts were retained instead.

## Concerns / Intentional Scope Boundaries

- The approved target directory list names `FormField`, `Drawer`, `DataGrid`,
  `Pagination`, `DatePicker`, `Spinner`, `EmptyState`, and `ErrorState`, but
  there is no corresponding app-local primitive to migrate. Empty directories
  are not trackable in Git, and fabricating component APIs would violate the
  task's instruction not to invent components. They are intentionally absent.
- `PhoneInput` stays app-owned because its Mexican LADA/10-digit formatting is
  salon-specific behavior. `sonner.tsx` stays app-owned because it configures
  the application toast location and behavior. Both can be reconsidered only
  with an explicit shared contract.
- App-local sources are deliberately retained until Task 3 migrates consumers;
  this creates a temporary duplicate implementation but avoids modifying app
  consumers in this task.

## Research References

- [Radix Dialog accessibility and keyboard behavior](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Radix accessibility overview](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Testing Library user-event keyboard API](https://testing-library.com/docs/user-event/keyboard/)
