# Task 8 Report: Locale-Aware Formatters

## RED evidence

Command:

```text
bun run --filter @emme/i18n test
```

Observed result before implementation:

```text
Test Files  1 failed | 2 passed (3)
Tests       6 failed | 9 passed (15)
TypeError: formatDate is not a function
TypeError: formatTime is not a function
TypeError: formatCurrency is not a function
TypeError: formatNumber is not a function
```

The six formatter tests failed because the public formatter functions were not yet exported or implemented.

## GREEN evidence

Commands:

```text
bun run --filter @emme/i18n test
bun run --filter @emme/i18n typecheck
git diff --check
```

Observed result after implementation and refactor:

```text
Test Files  3 passed (3)
Tests       15 passed (15)
@emme/i18n typecheck: Exited with code 0
```

`git diff --check` exited successfully with no whitespace errors.

## Files

- `packages/i18n/src/formatters/format-date.ts` — locale/time-zone date formatter and public options.
- `packages/i18n/src/formatters/format-time.ts` — locale/time-zone time formatter and public options.
- `packages/i18n/src/formatters/format-currency.ts` — currency formatter and public options.
- `packages/i18n/src/formatters/format-number.ts` — number formatter and public options.
- `packages/i18n/src/formatters/normalize-date.ts` — `Date|string` normalization and deterministic invalid-date error.
- `packages/i18n/src/formatters/validate-number-options.ts` — deterministic fraction-digit validation.
- `packages/i18n/src/formatters/formatters.test.ts` — colocated coverage for locales, time zones, currencies, dates, decimal rules, and number formatting.
- `packages/i18n/src/index.ts` — exports all four formatters and option types.
- `tasks/todo.md` — Task 8 checklist and evidence notes.

## Tests

Coverage includes:

- `en-US` and `es-MX` date, time, currency, and number output.
- Supplied time zones, including UTC, America/New_York, America/Mexico_City, and America/Los_Angeles.
- `Date` and ISO string inputs.
- USD, MXN, and EUR currency output with currency display options.
- Explicit fraction-digit rounding and invalid min/max decimal rules.
- Invalid string and `Date` values throwing `RangeError('Invalid date value.')`.

## Self-review

- All formatter behavior delegates locale-sensitive presentation to the runtime Intl APIs.
- Public options require `locale`; date/time options support Intl date-time fields and optional `timeZone`; currency options require `currency`; number options expose Intl number fields.
- Internal imports use `.js` suffixes.
- Date values are copied before formatting, and invalid dates are rejected before Intl formatting.
- Fraction-digit validation is shared by number and currency formatters.
- No application consumers or unrelated packages were migrated.

## Concerns

- Output strings depend on the host runtime's ICU data, as expected for Intl-based formatting. Tests run under the repository's Bun/Vitest runtime and currently pass.
- No concerns blocking Task 2.
