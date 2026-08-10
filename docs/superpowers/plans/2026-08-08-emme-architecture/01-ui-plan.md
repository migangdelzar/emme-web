# `@emme/ui` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Make `@emme/ui` the reusable, business-agnostic visual component library for all Emme applications.

**Architecture:** Components are grouped by visual responsibility and expose controlled, accessible APIs. The package owns visual behavior, design tokens, and generic hooks; it never imports feature, domain, application, API, tenancy, or i18n business modules.

**Tech Stack:** React 19, TypeScript 5.8+, Radix primitives, `class-variance-authority`, `tailwind-merge`, Vitest 4, Testing Library, `happy-dom`.

## Current State

`packages/ui/src/components/` already contains Button, Input, Select, Modal, Calendar, Table, Badge, Card, Avatar, Skeleton, ConfirmDialog, and related primitives. Tests are colocated for most components, while `src/__tests__/package-boundary.test.ts` already verifies package boundaries. The salon app still owns `shared/ui/PhoneInput.tsx`, `shared/ui/sonner.tsx`, and some generic components that must be audited before promotion.

## Target Tree

```text
packages/ui/src/
├── components/
│   ├── Avatar/
│   ├── Badge/
│   ├── Button/
│   ├── Calendar/
│   ├── Card/
│   ├── ConfirmDialog/
│   ├── DataGrid/
│   ├── Dropdown/
│   ├── EmptyState/
│   ├── ErrorState/
│   ├── FormField/
│   ├── Input/
│   ├── Label/
│   ├── Modal/
│   ├── Select/
│   ├── Skeleton/
│   ├── Spinner/
│   ├── Table/
│   ├── Tabs/
│   ├── Textarea/
│   ├── Tooltip/
│   └── index.ts
├── hooks/
│   ├── use-disclosure.ts
│   └── use-media-query.ts
├── styles/
│   ├── globals.css
│   └── variables.css
├── __tests__/
│   └── package-boundary.test.ts
└── index.ts
```

Do not create empty components merely to match the tree. Add `DataGrid`, `EmptyState`, `ErrorState`, `FormField`, `Spinner`, or shared hooks only when the salon migration has a concrete consumer.

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/ui/src/components/*` | Keep, normalize exports, and add focused component contracts where needed. |
| `packages/ui/src/lib/utils.ts` | Keep as internal styling utility; export only if a consumer contract requires it. |
| `apps/emme-salon-app/src/shared/ui/PhoneInput.tsx` | Keep app-local until its props and accessibility behavior are generic; then promote as `components/PhoneInput/`. |
| `apps/emme-salon-app/src/shared/ui/sonner.tsx` | Keep app composition in the app; expose only generic toast primitives from UI if required. |
| `apps/emme-salon-app/src/widgets/Navigation/*` | Remain app-owned because navigation semantics are salon-specific. |

## Public API and Dependency Rules

```ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onConfirm(): void;
  onOpenChange(open: boolean): void;
}
```

Allowed runtime dependencies are React and visual/accessibility libraries already present in `packages/ui/package.json`. UI components receive labels, data, callbacks, and state from callers; they must not call APIs, read tenant context, calculate business rules, or translate hidden business concepts.

## TDD Tasks

### Task 1: Stabilize the public barrel and boundary test

**Files:** Modify `packages/ui/src/index.ts` and `packages/ui/src/__tests__/package-boundary.test.ts`; test with `bun run --filter @emme/ui test`.

- [x] Red: add an import test that imports `Button`, `Input`, `Modal`, `Table`, and `ConfirmDialog` only from `@emme/ui`, and assert the module does not expose application-specific names.
- [x] Run `bun run --filter @emme/ui test`; expect the test to fail for any missing public export.
- [x] Green: export each supported component from its nearest component barrel and from `src/index.ts`.
- [x] Run the focused test again; expect all assertions to pass.
- [x] Refactor: remove duplicate or deep-path exports and keep one canonical public export per symbol.
- [x] Run `bun run --filter @emme/ui typecheck && bun run --filter @emme/ui test`.
- [x] Commit with `refactor(ui): stabilize public component exports`.

### Task 2: Harden interactive component contracts

**Files:** Existing component source and colocated tests under `packages/ui/src/components/{Button,Input,Select,Modal,ConfirmDialog,Table}`.

- [ ] Red: add tests for keyboard activation, disabled/pending behavior, controlled open state, labelled inputs, modal focus/close behavior, and table empty state using Testing Library.
- [ ] Run the affected test files and confirm each new behavior fails before the implementation change.
- [ ] Green: implement the minimum prop and DOM changes required by each failing test while preserving current styling.
- [ ] Run `bun run --filter @emme/ui test`; expect the component suite to pass.
- [ ] Refactor: centralize repeated class composition and preserve semantic HTML without introducing feature-specific props.
- [ ] Run `bun run --filter @emme/ui typecheck && bun run --filter @emme/ui test`.
- [ ] Commit with `test(ui): cover interactive component contracts`.

### Task 3: Promote only generic shared primitives used by the salon app

**Files:** Create promoted components only under `packages/ui/src/components/`; update consumers in `apps/emme-salon-app/src/shared/ui/` and relevant feature components.

- [ ] Red: for each candidate (`PhoneInput`, `EmptyState`, `ErrorState`, `FormField`, or `Spinner`), add a package test describing its generic props and an app regression test proving the current screen remains equivalent.
- [ ] Run the focused tests and confirm the package export or new component fails before implementation.
- [ ] Green: move the candidate to `@emme/ui`, preserve its accessible labels and controlled state, export it publicly, and replace the app import with `@emme/ui`.
- [ ] Run the package test and the affected salon test; both must pass.
- [ ] Refactor: delete the old implementation only after `rg -n "shared/ui/<candidate>|@emme/ui" apps/emme-salon-app/src packages/ui/src` shows no duplicate consumer path.
- [ ] Run `bun run --filter @emme/ui typecheck && bun run --filter @emme/emme-salon-app typecheck && bun run --filter @emme/emme-salon-app test`.
- [ ] Commit each promoted component as `refactor(ui): promote <component> primitive`.

## Acceptance Criteria

- [ ] Generic components are importable from `@emme/ui` without deep imports.
- [ ] UI has no feature, domain, API, infrastructure, auth, or tenant dependencies.
- [ ] Keyboard, disabled, loading, focus, and accessible-label behavior is covered by colocated tests.
- [ ] App-specific navigation and business components remain in the salon app or features package.

## Verification and Definition of Done

```bash
bun run --filter @emme/ui typecheck
bun run --filter @emme/ui test
bun run --filter @emme/ui build
bun run --filter @emme/emme-salon-app test:ui-imports
```

- [ ] All commands pass with zero skipped tests.
- [ ] `packages/ui/src/index.ts` is the only supported package entry point.
- [ ] Plan tasks and package migration commits are complete and pushed.
