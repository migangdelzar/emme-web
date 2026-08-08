# `@emme/i18n` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Centralize translations and deterministic locale-aware presentation formatting for all Emme applications.

**Architecture:** `@emme/i18n` owns translation lookup, catalog parity, pluralization, date/time/relative-time, number/currency formatting, and localized validation messages. It accepts explicit locale context; infrastructure/core may detect runtime locale and time zone, but formatter functions do not read browser globals.

**Tech Stack:** React 19, TypeScript 5.8+, `Intl`, current JSON catalogs, i18next/react-i18next compatibility where needed, Vitest 4, Bun.

## Current State

`packages/i18n` already contains the provider, locale context, translation lookup, JSON catalogs under `src/data/translations/`, and formatter files under `src/formatters/`. `apps/emme-salon-app/src/i18n.ts`, `src/app/locale.ts`, and `src/app/translation.ts` still own application setup and locale changes. Existing formatter tests are colocated under `packages/i18n/src/formatters/`.

## Target Tree

```text
packages/i18n/src/
├── i18n.ts
├── i18n-provider.tsx
├── use-translation.ts
├── locale-context.tsx
├── formatters/
│   ├── date/
│   │   ├── format-date.ts
│   │   ├── format-time.ts
│   │   ├── format-relative-time.ts
│   │   └── index.ts
│   ├── number/
│   │   ├── format-number.ts
│   │   ├── format-currency.ts
│   │   └── index.ts
│   ├── messages/
│   │   ├── format-validation-message.ts
│   │   └── index.ts
│   ├── formatters.types.ts
│   └── index.ts
├── locales/
├── data/
│   ├── elements.json
│   └── translations/
│       ├── en-US.json
│       └── es-MX.json
├── testing/
│   └── i18n-test-provider.tsx
├── __tests__/
│   └── translation-boundary.test.ts
└── index.ts
```

Keep JSON catalogs as the migration source of truth. Split them into typed locale modules only when catalog size or type-safe namespace ownership requires it; consumers must not change their formatter imports when that happens.

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/i18n/src/formatters/format-date.ts` | Move to `formatters/date/format-date.ts`; retain output behavior and add explicit context. |
| `packages/i18n/src/formatters/format-time.ts` | Move to `formatters/date/format-time.ts`; use `context.timeZone`. |
| `packages/i18n/src/formatters/format-currency.ts` | Move to `formatters/number/format-currency.ts`; use `context.currency`. |
| `packages/i18n/src/formatters/format-number.ts` | Move to `formatters/number/format-number.ts`. |
| `packages/i18n/src/formatters/normalize-date.ts` and `validate-number-options.ts` | Keep as internal helpers under the owning formatter group or export only stable types. |
| `apps/emme-salon-app/src/i18n.ts` | Replace application-owned initialization with the public `@emme/i18n` provider/factory. |
| `apps/emme-salon-app/src/app/locale.ts` | Keep runtime locale resolution in the app/core composition root; pass its result into i18n. |
| `apps/emme-salon-app/src/app/translation.ts` | Replace direct translation implementation with `useTranslation`/typed adapter from `@emme/i18n`. |
| `apps/emme-salon-app/src/app/locale.test.ts` and `translation.test.ts` | Retain app integration coverage; move pure lookup/formatter tests into this package. |

## Public API

```ts
export interface FormatContext {
  locale: string;
  timeZone?: string;
  currency?: string;
}

export function formatDate(
  value: Date | string | number,
  context: FormatContext,
  options?: Intl.DateTimeFormatOptions,
): string;

export function formatCurrency(
  value: number,
  context: FormatContext,
  options?: Intl.NumberFormatOptions,
): string;

export function formatNumber(
  value: number,
  context: FormatContext,
  options?: Intl.NumberFormatOptions,
): string;

export function formatRelativeTime(
  value: Date | number,
  context: FormatContext,
  now?: Date,
): string;

export interface I18nProviderProps {
  locale: string;
  timeZone?: string;
  currency?: string;
  children: React.ReactNode;
}
```

Domain rules such as appointment duration, availability, cancellation windows, or service eligibility stay in `@emme/domain`. Validation schemas stay in `@emme/validation` or feature folders; i18n only maps their stable issue codes to localized messages.

## TDD Tasks

### Task 1: Introduce grouped formatter modules without behavior changes

**Files:** Create `packages/i18n/src/formatters/date/*`, `formatters/number/*`, `formatters/formatters.types.ts`, and `formatters/index.ts`; update `packages/i18n/src/index.ts`; migrate existing formatter tests.

- [x] Red: add import-path tests that expect `formatDate`, `formatTime`, `formatCurrency`, and `formatNumber` from the package root and grouped barrels.
- [x] Run `bun run --filter @emme/i18n test`; expect missing export/path failures.
- [x] Green: move or re-export existing implementations into the grouped directories while preserving current en-US and es-MX output.
- [x] Run the focused tests and expect PASS.
- [x] Refactor: remove duplicate flat formatter implementations and expose only the package root plus documented grouped barrels.
- [x] Run `bun run --filter @emme/i18n typecheck && bun run --filter @emme/i18n test`.
- [x] Commit with `refactor(i18n): group locale formatters by presentation concern`.

### Task 2: Make formatting explicit and deterministic

**Files:** `packages/i18n/src/formatters/formatters.types.ts`, date and number formatter modules, colocated formatter tests.

- [x] Red: add tests for a fixed date rendered in two time zones, currency rendered in USD and MXN, number grouping in en-US and es-MX, invalid date handling, and relative-time output with a fixed `now` value.
- [x] Run `bun run --filter @emme/i18n test`; confirm failures before implementation.
- [x] Green: implement `FormatContext` and pass `locale`, `timeZone`, and `currency` explicitly to `Intl` formatters. Throw or return the package’s documented invalid-value result consistently for malformed dates.
- [x] Run the formatter tests and expect PASS on every host locale.
- [x] Refactor: keep React hooks as thin adapters over pure formatter functions and remove hidden reads of `navigator` or `Intl.DateTimeFormat().resolvedOptions()`.
- [x] Run `bun run --filter @emme/i18n typecheck && bun run --filter @emme/i18n test`.
- [x] Commit with `feat(i18n): add deterministic formatter context`.

### Task 3: Add localized validation messages and test provider

**Files:** Create `packages/i18n/src/formatters/messages/format-validation-message.ts`, `packages/i18n/src/testing/i18n-test-provider.tsx`, colocated tests, and catalog entries when required.

- [x] Red: add tests mapping stable validation codes such as `required`, `invalid_email`, and `too_small` to en-US/es-MX messages, with a fallback for unknown codes; add a test provider that renders a translated test string.
- [x] Run the focused tests and expect failures for missing mappings/provider exports.
- [x] Green: implement typed message lookup and a provider with explicit locale/time-zone/currency defaults.
- [x] Run `bun run --filter @emme/i18n test` and expect PASS.
- [x] Refactor: keep catalog keys typed and prevent validation modules from importing React or API code.
- [x] Run `bun run --filter @emme/i18n validate && bun run --filter @emme/i18n typecheck`.
- [x] Commit with `feat(i18n): add localized validation messages and test provider`.

### Task 4: Integrate the existing salon translation setup

**Files:** `apps/emme-salon-app/src/i18n.ts`, `src/app/translation.ts`, `src/app/locale.ts`, `src/app/AppProviders.tsx`, and their tests.

- [ ] Red: add an app integration test that changes the business-profile locale and verifies translated text and formatter output use the same locale context.
- [ ] Run `bun run --filter @emme/emme-salon-app test -- src/app/translation.test.ts src/app/locale.test.ts`; expect failure before provider wiring.
- [ ] Green: wire `I18nProvider` in `AppProviders`, pass the resolved locale/time zone/currency, and replace direct app-local translation calls with `@emme/i18n` public exports.
- [ ] Run the focused app tests and expect PASS.
- [ ] Refactor: remove duplicate initialization and keep runtime detection outside pure formatter modules.
- [ ] Run `bun run --filter @emme/i18n test && bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit with `refactor(salon-app): consume shared i18n provider`.

## Acceptance Criteria

- [ ] All translation and locale-aware formatting consumers use `@emme/i18n` public exports.
- [ ] Formatter outputs are deterministic under explicit locale and time-zone inputs.
- [ ] Domain calculations are not implemented in i18n.
- [ ] Browser runtime detection is outside pure formatter functions.
- [ ] Catalog parity and fallback tests pass for en-US and es-MX.

## Verification and Definition of Done

```bash
bun run --filter @emme/i18n validate
bun run --filter @emme/i18n typecheck
bun run --filter @emme/i18n test
bun run --filter @emme/emme-salon-app test -- src/app/translation.test.ts src/app/locale.test.ts
bun run i18n:check
```

- [ ] No flat formatter consumer imports remain outside the package.
- [ ] No formatter uses host locale or browser globals implicitly.
- [ ] All changes are committed and pushed.
