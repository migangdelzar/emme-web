# Task 3 Report: Salon UI Consumer Migration and Duplicate Removal

## Status

Completed. The salon app now consumes generic primitives only through the
`@emme/ui` public barrel. Twenty app-local generic duplicate files were removed
after a passing import scan. `PhoneInput` and `sonner` remain app-owned as
required; `PhoneInput` now consumes the shared `Input` primitive.

## Files Changed

- `apps/emme-salon-app/package.json` and `bun.lock` — declare and lock the
  `@emme/ui` workspace dependency; add the `test:ui-imports` guard script.
- `apps/emme-salon-app/src/app/ui-import-boundary.test.ts` — static import
  guard covering all generic `@/shared/ui` imports and the two retained
  app-owned UI sources.
- `apps/emme-salon-app/src/app/{AppProviders.tsx,auth/TenantSelector.tsx}` —
  public-barrel imports for generic UI.
- `apps/emme-salon-app/src/features/{appointments,auth,clients,dashboard,finances,google-workspace,onboarding,services,settings}/components/**` —
  public-barrel imports only; all named imports, props, selectors, and component
  markup stay unchanged.
- `apps/emme-salon-app/src/{widgets/Navigation/Navigation.tsx,shared/components/ErrorBanner.tsx}` —
  public-barrel `Button` imports required to remove the app-local duplicate.
- `apps/emme-salon-app/src/shared/ui/PhoneInput.tsx` — remains app-owned and
  now imports `Input` from `@emme/ui`.
- Deleted `apps/emme-salon-app/src/shared/ui/{alert-dialog,avatar,badge,button,calendar,card,checkbox,dialog,dropdown-menu,input,label,scroll-area,select,separator,skeleton,switch,table,tabs,textarea,tooltip}.tsx`.
- `tasks/todo.md` — task tracking.

## Import Mapping

Every generic source module had a behavior-compatible public-barrel export:

| Local source | Public `@emme/ui` exports used |
|---|---|
| `alert-dialog`, `dialog`, `dropdown-menu` | Same `AlertDialog*`, `Dialog*`, and `DropdownMenu*` names |
| `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `input`, `label` | Same component and helper names |
| `scroll-area`, `select`, `separator`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `tooltip` | Same component and helper names |

`PhoneInput` remains local because it owns salon-specific Mexican LADA and
10-digit formatting. `sonner` remains local because it owns the app toast
configuration.

## TDD Evidence

### RED — generic consumer guard

After correcting a test-only filesystem URL setup error, the new guard was run
before any consumer import changes:

```text
bun run --filter @emme/emme-salon-app test:ui-imports
Test Files  1 failed (1)
Tests       1 failed (1)
```

The expected assertion contained 86 generic app-local import violations across
19 consumers, beginning with `AppProviders`, `TenantSelector`, and the
appointments components.

### GREEN — generic consumer guard

After the public-barrel import migration, the same command passed:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
Exited with code 0
```

### RED — retained app-owned source guard

Post-deletion typechecking exposed `PhoneInput`'s remaining `./input`
dependency. A second guard test was written before fixing it:

```text
bun run --filter @emme/emme-salon-app test:ui-imports
Test Files  1 failed (1)
Tests       1 failed | 1 passed (2)
PhoneInput.tsx: from './input'
```

### GREEN — retained app-owned source guard

Changing only `PhoneInput`'s primitive import to `@emme/ui` made both guard
tests pass:

```text
Test Files  1 passed (1)
Tests       2 passed (2)
Exited with code 0
```

## Final Verification

```text
bun run --filter @emme/emme-salon-app test:ui-imports
1 test file passed; 2 tests passed

bun run --filter @emme/emme-salon-app test
16 test files passed; 35 tests passed

bun run --filter @emme/emme-salon-app typecheck
Exited with code 0

bun run --filter @emme/emme-salon-app build
Exited with code 0; Vite build and PWA generation completed

bun run --filter @emme/ui typecheck
Exited with code 0

bun run --filter @emme/ui test
13 test files passed; 33 tests passed

git diff --check
Exited with code 0
```

The final `rg -n --glob '*.{ts,tsx}' "@/shared/ui" apps/emme-salon-app/src`
audit reported only the five `PhoneInput` consumer imports and the one
app-level `sonner` import. A separate shell file-count assertion, not the
Vitest import guard, confirmed that `src/shared/ui` contains only
`PhoneInput.tsx` and `sonner.tsx`.

## Review Fix Evidence

### Strengthened retained-source import guard — RED

The review identified that the initial retained-source check only rejected a
narrow extensionless relative-import pattern. I wrote a scanner contract that
requires exact approved dependency lists and supplies alias, explicit extension,
re-export, and dynamic-import examples. Before implementing the scanner helper:

```text
bun run --filter @emme/emme-salon-app test -- src/app/ui-import-boundary.test.ts src/shared/ui/PhoneInput.test.tsx src/shared/ui/sonner.test.tsx
Test Files  1 failed | 2 passed (3)
Tests       2 failed | 3 passed (5)
Error: Not implemented: PhoneInput.tsx ...
```

### Strengthened retained-source import guard — GREEN

`PhoneInput.tsx` now permits only `react`, `@emme/ui`, and
`@/shared/lib/utils`; `sonner.tsx` permits only `sonner`. The scanner extracts
each static, re-export, and dynamic import specifier, so aliases and explicit
extensions cannot bypass the allowlist.

```text
bun run --filter @emme/emme-salon-app test -- src/app/ui-import-boundary.test.ts src/shared/ui/PhoneInput.test.tsx src/shared/ui/sonner.test.tsx
Test Files  3 passed (3)
Tests       5 passed (5)
Exited with code 0
```

### Retained interactive component behavior coverage

- `PhoneInput.test.tsx` proves that non-digit input is removed, the local
  number is capped at ten digits, and the emitted value retains its LADA.
- `sonner.test.tsx` proves the exported `Toaster` renders a dismissible
  notification at the app's top-right default position.

These tests add regression coverage only; neither app-specific component's
behavior or configuration changed.

### Review fix verification

```text
bun run --filter @emme/emme-salon-app test:ui-imports
1 test file passed; 3 tests passed

bun run --filter @emme/emme-salon-app test
18 test files passed; 38 tests passed

bun run --filter @emme/emme-salon-app typecheck
Exited with code 0

bun run --filter @emme/emme-salon-app build
Exited with code 0; Vite build and PWA generation completed

git diff --check
Exited with code 0
```

## Self-Review

- All generic imports use the `@emme/ui` root barrel; no consumer imports a
  package-private component path.
- The migration changes import specifiers only. Existing JSX, named exports,
  props, `data-testid` selectors, class names, and interaction wiring remain
  intact.
- The new guard prevents reintroduction of generic app-local UI imports and
  prevents retained app-owned sources from depending on a removed duplicate.
- No API, domain, application, infrastructure, or other package source was
  changed.
- The generic duplicate deletion was preceded by both a passing import guard
  and a direct reference audit. Only three references remained, all internal to
  files deleted in the same atomic cleanup.

## Concerns

- No blocking concerns. Browser E2E was not run because the approved Task 3
  verification matrix specifies app unit tests, typecheck, build, and UI
  package verification; existing E2E selectors were preserved by import-only
  consumer changes.
- The first `bun install --lockfile-only` refreshed `bun.lock` but did not add
  a workspace symlink. A normal `bun install` materialized
  `apps/emme-salon-app/node_modules/@emme/ui`; this was verified before the
  passing app test and build runs.

## Re-review Fix Evidence

The re-review identified two parser gaps: side-effect static imports in generic
consumers and comments between import syntax and module specifiers in retained
sources. I replaced both regex collectors with a TypeScript AST traversal that
collects static imports, re-exports, and dynamic `import()` calls, including
explicit extensions and comments.

### RED

I added regression tests before implementing the AST collector:

```text
bun run --filter @emme/emme-salon-app test -- src/app/ui-import-boundary.test.ts
Test Files  1 failed (1)
Tests       2 failed | 3 passed (5)
Exited with code 1
```

The side-effect case failed because `findForbiddenGenericUiImports` was not
implemented; the comment-separated re-export/dynamic case returned `[]`
instead of the two expected `./input.tsx` specifiers.

### GREEN / REFACTOR

After replacing the regex collectors with the AST collector and formatting the
test file:

```text
bun run --filter @emme/emme-salon-app test -- src/app/ui-import-boundary.test.ts src/shared/ui/PhoneInput.test.tsx src/shared/ui/sonner.test.tsx
Test Files  3 passed (3)
Tests       7 passed (7)
Exited with code 0

bun run --filter @emme/emme-salon-app format:check
All matched files use Prettier code style!
Exited with code 0

bun run --filter @emme/emme-salon-app typecheck
Exited with code 0

bun run --filter @emme/emme-salon-app build
Vite build and PWA generation completed
Exited with code 0
```

The generic consumer guard now catches side-effect imports such as
`import '@/shared/ui/button'`; retained-source allowlists now reject
comment-separated forms such as `export * from /* comment */ './input.tsx'`
and `import /* comment */ ('./input.tsx')`.
