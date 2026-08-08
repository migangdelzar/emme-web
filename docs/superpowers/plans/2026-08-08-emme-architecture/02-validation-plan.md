# `@emme/validation` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Provide reusable runtime validation primitives while keeping capability-specific schemas with their owning feature or API boundary.

**Architecture:** Zod schemas validate untrusted inputs at boundaries. The package exposes common scalar, pagination, date, error, and issue-mapping contracts. It does not contain translations, business rules, API calls, or React components.

**Tech Stack:** TypeScript 5.8+, Zod 4, Vitest 4, Bun.

## Current State

`packages/validation` already contains common date, email, ID, pagination, and phone schemas, issue formatting, validation errors, and boundary tests. The salon app still has feature schemas and form validation embedded in components. API DTO parsing is partly distributed across `packages/api` and must remain at the API boundary rather than moving into this package.

## Target Tree

```text
packages/validation/src/
├── common/
│   ├── date.schema.ts
│   ├── email.schema.ts
│   ├── id.schema.ts
│   ├── pagination.schema.ts
│   ├── phone.schema.ts
│   └── index.ts
├── errors/
│   ├── validation-error.ts
│   ├── validation-error.mapper.ts
│   └── index.ts
├── helpers/
│   ├── create-schema.ts
│   ├── format-issues.ts
│   └── index.ts
├── types/
│   ├── validation.types.ts
│   └── index.ts
├── __tests__/
│   └── validation-boundary.test.ts
└── index.ts
```

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/validation/src/common/*` | Keep and normalize each schema export. |
| `packages/validation/src/errors/*` | Keep as the package error and issue-mapping boundary. |
| `packages/validation/src/helpers/*` | Keep; ensure helpers return typed Zod results rather than UI strings. |
| `apps/emme-salon-app/src/features/*/components/*` | Extract only reusable structural schemas into feature-local `schemas/`; do not put feature schemas in this package. |
| `apps/emme-salon-app/src/app/feature-schema-boundary.test.ts` | Extend to prove app feature schemas do not import UI or API clients directly. |

## Public API

```ts
export type ValidationIssue = {
  path: string[];
  code: string;
  message: string;
};

export class ValidationError extends Error {
  readonly issues: readonly ValidationIssue[];
  constructor(issues: readonly ValidationIssue[]);
}

export function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema>;

export const emailSchema: z.ZodString;
export const idSchema: z.ZodString;
export const paginationSchema: z.ZodObject<{
  page: z.ZodNumber;
  pageSize: z.ZodNumber;
}>;
```

Schemas must reject malformed input and return structured issues. Human-readable localized messages are supplied later by `@emme/i18n`; validation must not import i18n.

## TDD Tasks

### Task 1: Normalize public exports and package boundary coverage

**Files:** `packages/validation/src/index.ts`, nearest `index.ts` files, `packages/validation/src/__tests__/validation-boundary.test.ts`.

- [x] Red: add imports through `@emme/validation` and assert common schemas and `ValidationError` are available without deep paths.
- [x] Run `bun run --filter @emme/validation test`; expect missing-export failures if the barrel is incomplete.
- [x] Green: export the existing common schemas, helpers, types, and error mapper through package and capability barrels.
- [x] Run the focused test and expect PASS.
- [x] Refactor: remove duplicate exports and ensure the package has no React, API, infrastructure, or i18n import.
- [x] Run `bun run --filter @emme/validation typecheck && bun run --filter @emme/validation test`.
- [x] Commit with `refactor(validation): normalize public schema exports`.

### Task 2: Define deterministic common schema behavior

**Files:** `packages/validation/src/common/*.schema.test.ts` and corresponding schema files.

- [x] Red: add cases for trimmed email, invalid email, UUID/ID boundaries, ISO date rejection, pagination lower/upper bounds, and phone normalization expectations based on the current schema contract.
- [x] Run the focused test files; each new case must fail for the intended validation reason.
- [x] Green: implement only the schema constraints required by the tests and preserve existing accepted application inputs.
- [x] Run `bun run --filter @emme/validation test`; expect all common schema tests to pass.
- [x] Refactor: share scalar constraints through helpers without changing error issue paths.
- [x] Run `bun run --filter @emme/validation typecheck`.
- [x] Commit with `test(validation): cover common boundary schemas`.

### Task 3: Make issue mapping stable for application and UI adapters

**Files:** `packages/validation/src/errors/*`, `packages/validation/src/helpers/*`, colocated tests.

- [x] Red: add tests proving a nested Zod issue becomes `{ path, code, message }`, multiple issues preserve order, and invalid non-Zod errors are not silently treated as valid input.
- [x] Run `bun run --filter @emme/validation test`; confirm failures before implementation.
- [x] Green: implement the minimum normalized issue conversion and `ValidationError` behavior.
- [x] Run the focused tests and expect PASS.
- [x] Refactor: keep error construction independent from locale and UI while preserving the original issue path.
- [x] Run `bun run --filter @emme/validation typecheck && bun run --filter @emme/validation build`.
- [x] Commit with `feat(validation): normalize validation issues`.

## Acceptance Criteria

- [ ] Common schemas are reusable from a single public package entry point.
- [ ] Validation errors are structured and locale-independent.
- [ ] Feature-specific schemas remain feature-owned; API DTO parsers remain API-owned.
- [ ] No validation module imports React, i18n, domain rules, API clients, or browser globals.

## Verification and Definition of Done

```bash
bun run --filter @emme/validation typecheck
bun run --filter @emme/validation test
bun run --filter @emme/validation build
```

- [ ] All tests pass with no skipped cases.
- [ ] Root `bun run typecheck` and `bun run test` remain green after consumers are migrated.
- [ ] Every changed file is committed and pushed.
