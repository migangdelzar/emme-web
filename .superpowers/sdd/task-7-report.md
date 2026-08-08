# Task 7 Report — @emme/i18n typed provider boundary

## Status

Task 1 is implemented on `feat/api-version-contract`. The shared package now
exports a typed `I18nProvider`, `LocaleContext`, `useTranslation`, and lookup
contract over the existing `en-US` and `es-MX` catalogs.

## RED evidence

Command:

```bash
bun run --filter @emme/i18n test src/__tests__/translation-boundary.test.ts
```

Result: 4 failing tests. The intended failures were
`TypeError: createTranslationLookup is not a function` for lookup, fallback,
and missing-key behavior, and an undefined `I18nProvider` render error for the
provider/hook configuration test. Before that run, the new package-level React
test revealed the necessary dependency declaration (`Cannot find package
'react'`), which was added as part of the provider boundary.

## GREEN evidence

Commands and results:

```bash
bun run --filter @emme/i18n test
# 2 test files passed, 9 tests passed

bun run --filter @emme/i18n typecheck
# exit 0

bun run --filter @emme/i18n validate
# en-US/es-MX key parity passed (10 root namespaces)
# 227 test IDs valid with no duplicates
```

## Files

- `packages/i18n/src/i18n-provider.tsx`
- `packages/i18n/src/locale-context.tsx`
- `packages/i18n/src/use-translation.ts`
- `packages/i18n/src/__tests__/translation-boundary.test.ts`
- `packages/i18n/src/index.ts`
- `packages/i18n/package.json`
- `packages/i18n/tsconfig.json`
- `bun.lock`
- `e2e/src/tsconfig.json`

## Self-review

- The lookup resolves the active catalog, then a typed fallback locale, and
  returns the key only when both values are absent.
- Existing `t()` remains unchanged, preserving its direct lookup and
  missing-key behavior for current consumers.
- The provider defaults to the existing `es-MX` fallback and uses only React;
  no i18n runtime dependency was added.
- Public exports include the provider, context, hook, lookup factory, and
  associated types. React is declared as a runtime peer; React DOM is test-only.
- The E2E TypeScript project resolves `@emme/i18n` directly to source, so it
  also enables JSX module resolution for the new public `.tsx` modules.

## Concerns

None. This task deliberately does not migrate salon-app consumers; that is
Task 3 in the approved i18n plan.

## NodeNext review-finding fix — 2026-08-08

### RED evidence

```bash
cd packages/i18n
bunx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --jsx react-jsx --strict --resolveJsonModule --esModuleInterop src/index.ts
```

Result: exited 2 with TS2835 at `src/index.ts:116-118`; the new provider,
locale-context, and hook re-exports omitted required relative ESM `.js`
extensions.

### Fix and GREEN evidence

- Moved catalog types/data and lookup construction into direct internal modules,
  so `I18nProvider` no longer imports runtime values from the public barrel.
- Updated all new or related internal source and test specifiers to emitted
  `.js` paths.

```bash
cd packages/i18n
bunx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --jsx react-jsx --strict --resolveJsonModule --esModuleInterop src/index.ts
# exit 0

bun run --filter @emme/i18n typecheck
# exit 0

bun run --filter @emme/i18n test
# 2 test files passed, 9 tests passed

bun run typecheck
# all workspace package typechecks exited 0
```
