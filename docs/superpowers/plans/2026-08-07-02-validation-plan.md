# @emme/validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Create a reusable Zod 4 validation boundary while keeping business and feature-specific validation in the correct owners.

**Architecture:** `@emme/validation` owns reusable schemas, issue formatting, and common validation types. Feature schemas stay under feature `schemas/`; domain rules remain in `@emme/domain`.

**Tech Stack:** TypeScript, Zod 4, Vitest, Bun.

## Global Constraints

- Standardize the workspace on Zod 4; the current app uses Zod 4 and the package currently declares Zod 3.
- Do not import React, API clients, infrastructure, or feature modules.
- Do not move business rules into schemas.
- Colocate unit tests; use `src/__tests__/` only for package integration tests.

## Target structure

```text
packages/validation/src/
├── common/
│   ├── id.schema.ts
│   ├── email.schema.ts
│   ├── phone.schema.ts
│   ├── date.schema.ts
│   └── pagination.schema.ts
├── errors/
│   ├── validation-error.ts
│   └── validation-error.mapper.ts
├── helpers/
│   ├── create-schema.ts
│   └── format-issues.ts
├── types/validation.types.ts
├── index.ts
└── __tests__/validation-boundary.test.ts
```

### Task 1: Align the Zod version and define public validation types

**Files:**
- Modify: `packages/validation/package.json`
- Modify: `apps/emme-salon-app/package.json` only if workspace resolution requires it
- Modify: `bun.lock`
- Create: `packages/validation/src/types/validation.types.ts`
- Modify: `packages/validation/src/index.ts`
- Test: `packages/validation/src/__tests__/validation-boundary.test.ts`

- [ ] Step 1: Add failing tests for a typed validation result and an issue-to-field-error mapping.
- [ ] Step 2: Run `bun run --filter @emme/validation test`; expect failure because the exports do not exist.
- [ ] Step 3: Pin Zod 4, define `ValidationResult<T>` and `FieldErrors`, and export them from the package barrel.
- [ ] Step 4: Run package typecheck and tests; expect PASS.
- [ ] Step 5: Commit `feat(validation): establish zod 4 validation boundary`.

### Task 2: Add reusable primitives and error mapping

**Files:**
- Create: `packages/validation/src/common/*.schema.ts`
- Create: `packages/validation/src/errors/*.ts`
- Create: `packages/validation/src/helpers/*.ts`
- Test: colocated tests plus `src/__tests__/validation-boundary.test.ts`

**Interfaces:**

```ts
export function formatIssues(issues: readonly ZodIssue[]): FieldErrors;
export function parseWithSchema<T>(schema: ZodSchema<T>, input: unknown): ValidationResult<T>;
```

- [ ] Step 1: Write tests for valid/invalid email, phone, date, ID, pagination, nested paths, and multiple messages per field.
- [ ] Step 2: Run focused tests; expect RED.
- [ ] Step 3: Implement the smallest schemas and deterministic issue mapper.
- [ ] Step 4: Run `bun run --filter @emme/validation test` and typecheck; expect PASS.
- [ ] Step 5: Commit `feat(validation): add reusable schemas and issue mapping`.

### Task 3: Migrate feature schemas without centralizing business forms

**Files:**
- Modify: feature `schemas/*.schema.ts` files identified by `rg "z\.object|z\.string|z\.email" apps/emme-salon-app/src`
- Modify: feature form components and their tests.
- Modify: `apps/emme-salon-app/package.json` if it imports the package directly.

- [ ] Step 1: Add regression tests for each migrated form schema’s accepted and rejected input.
- [ ] Step 2: Run feature tests and record failures from import changes.
- [ ] Step 3: Replace duplicated primitives with `@emme/validation` exports while leaving feature fields and business messages local.
- [ ] Step 4: Run app typecheck, tests, and E2E form flows.
- [ ] Step 5: Commit `refactor(app): consume shared validation primitives`.

## Verification

```bash
bun run --filter @emme/validation typecheck
bun run --filter @emme/validation test
bun run --filter @emme/emme-salon-app typecheck
bun run --filter @emme/emme-salon-app test
```

## Definition of done

- [ ] All workspace consumers use one Zod 4 major version.
- [ ] Shared primitives and errors are exported from the package root.
- [ ] Feature-specific schemas remain feature-owned.
- [ ] No validation module contains domain or authorization policy.
