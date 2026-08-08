# `@emme/core` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Centralize authentication, tenancy, permissions, runtime configuration, providers, and shared application errors for all Emme applications.

**Architecture:** Core defines application runtime behavior and contracts. It may consume API contracts/ports but must not instantiate concrete infrastructure. Browser storage, refresh, and HTTP implementations are injected from infrastructure at the app composition root.

**Tech Stack:** React 19, TypeScript 5.8+, `@emme/api`, `@emme/i18n`, Vitest 4, Bun.

## Current State

`packages/core` already contains permission checks, auth/tenant types, and runtime config validation. The salon app still owns `AuthProvider`, `useAuth`, tenant resolution, locale resolution, and runtime config. The plan moves reusable state/context contracts while leaving salon onboarding and navigation composition app-owned.

## Target Tree

```text
packages/core/src/
├── auth/
│   ├── auth.types.ts
│   ├── auth-context.tsx
│   ├── auth-provider.tsx
│   ├── use-auth.ts
│   ├── use-current-user.ts
│   └── auth-events.ts
├── tenancy/
│   ├── tenant.types.ts
│   ├── tenant-context.tsx
│   ├── tenant-provider.tsx
│   ├── use-current-tenant.ts
│   └── tenant-capabilities.ts
├── access-control/
│   ├── roles.ts
│   ├── permissions.ts
│   ├── policies.ts
│   ├── can.ts
│   ├── PermissionGuard.tsx
│   └── use-permission.ts
├── runtime/
│   ├── api-context.tsx
│   ├── api-provider.tsx
│   ├── runtime-context.tsx
│   └── runtime-provider.tsx
├── configuration/
│   ├── environment.ts
│   ├── app-config.ts
│   └── runtime-config.ts
├── errors/
│   ├── application-error.ts
│   ├── authorization-error.ts
│   └── error-codes.ts
├── __tests__/
│   └── provider-contracts.test.tsx
└── index.ts
```

## Migration Mapping

| Current path | Target action |
|---|---|
| `packages/core/src/access-control/*` | Keep and expand only stable permission/policy contracts. |
| `packages/core/src/auth/*` | Keep types and add injectable provider/context contracts. |
| `packages/core/src/tenancy/*` | Keep tenant types; add context and capability accessors. |
| `packages/core/src/configuration/runtime-config.ts` | Keep validation and split environment reading from pure validation. |
| `apps/emme-salon-app/src/app/auth/AuthProvider.tsx` | Move reusable auth state/provider to core; preserve app-specific login/tenant selection UI. |
| `apps/emme-salon-app/src/app/auth/useAuth.ts` | Replace with `useAuth` from core or a thin app adapter. |
| `apps/emme-salon-app/src/app/auth/tenantResolver.ts` | Keep backend/session resolution as an injected adapter; expose current tenant through core context. |
| `apps/emme-salon-app/src/app/config/runtimeConfig.ts` | Move pure parsing/assertion to core; read `import.meta.env` in the app composition root. |
| `apps/emme-salon-app/src/app/error-boundary/*` | Keep React error-boundary rendering app-owned; use shared error codes/messages from core/i18n. |

## Public API and Protocols

```ts
export type AuthStatus = 'loading' | 'signedOut' | 'authenticated' | 'tenantRequired';

export interface CurrentUser {
  id: string;
  displayName: string;
  permissions: readonly Permission[];
}

export interface AuthState {
  status: AuthStatus;
  user: CurrentUser | null;
}

export interface AuthSessionPort {
  load(): Promise<AuthState>;
  signOut(): Promise<void>;
}

export interface TenantContextValue {
  tenantId: string | null;
  slug: string | null;
  capabilities: readonly string[];
}

export interface ApiContextValue {
  api: Api;
}

export function can(
  permissions: readonly Permission[],
  required: Permission,
): boolean;
```

Providers receive `AuthSessionPort`, `Api`, tenant values, and runtime configuration from the composition root. Core must not call `createFetchHttpClient`, `localStorage`, or `new QueryClient()` internally.

## TDD Tasks

### Task 1: Normalize auth, tenant, and permission contracts

**Files:** `packages/core/src/auth/*`, `tenancy/*`, `access-control/*`, existing tests, root barrel.

- [ ] Red: add tests for auth status transitions, tenant-required state, role-to-permission checks, empty permission sets, and denied permissions.
- [ ] Run `bun run --filter @emme/core test`; confirm failures before implementation.
- [ ] Green: define stable types and pure `can`/policy functions with injected session values.
- [ ] Run focused tests and expect PASS.
- [ ] Refactor: keep permissions as constants/contracts and separate UI guards from pure policy evaluation.
- [ ] Run `bun run --filter @emme/core typecheck && bun run --filter @emme/core test`.
- [ ] Commit with `refactor(core): formalize auth tenancy and permission contracts`.

### Task 2: Add injectable React providers and API context

**Files:** Create `auth-context.tsx`, `auth-provider.tsx`, `use-auth.ts`, tenancy context/provider/hooks, `runtime/api-context.tsx`, and provider tests.

- [ ] Red: add provider tests using fake session/API ports for loading, signed-out, authenticated, tenant-required, and sign-out transitions.
- [ ] Run focused tests and expect provider failures before implementation.
- [ ] Green: implement providers that consume injected dependencies and expose stable hooks/contexts.
- [ ] Run `bun run --filter @emme/core test`; expect PASS.
- [ ] Refactor: ensure providers do not instantiate clients, read browser globals, or create mutable module-level state.
- [ ] Run `bun run --filter @emme/core typecheck && bun run --filter @emme/core build`.
- [ ] Commit with `feat(core): add injectable runtime providers`.

### Task 3: Move runtime configuration and shared errors

**Files:** `packages/core/src/configuration/*`, `errors/*`, colocated tests, app runtime config tests.

- [ ] Red: add tests for missing API URL, invalid environment values, normalized unauthorized/forbidden/conflict errors, and safe user-facing error codes.
- [ ] Run focused tests and confirm failures.
- [ ] Green: implement pure config parsing/assertion and stable application error classes/codes.
- [ ] Run package tests and expect PASS.
- [ ] Refactor: keep environment reads in app/infrastructure and make core config functions accept plain records.
- [ ] Run `bun run --filter @emme/core typecheck && bun run --filter @emme/core build`.
- [ ] Commit with `feat(core): centralize runtime configuration and errors`.

### Task 4: Enforce core dependency and provider boundaries

**Files:** `packages/core/src/__tests__/provider-contracts.test.tsx`, package exports, dependency metadata.

- [ ] Red: add tests rejecting direct imports of fetch/Axios, browser storage, concrete infrastructure classes, and feature internals.
- [ ] Run `bun run --filter @emme/core test`; expect failures for any violation.
- [ ] Green: inject the missing protocols and remove concrete imports.
- [ ] Run package tests and expect PASS.
- [ ] Refactor: document the composition-root requirement in `src/index.ts` and package README if present.
- [ ] Run `bun run --filter @emme/core typecheck && bun run --filter @emme/core build`.
- [ ] Commit with `test(core): enforce runtime dependency boundaries`.

## Acceptance Criteria

- [ ] Auth, tenancy, permission, config, and error behavior is reusable by all apps.
- [ ] Providers are injectable and testable without browser storage or real HTTP.
- [ ] Core does not instantiate infrastructure.
- [ ] Permission checks improve UI behavior but backend authorization remains authoritative.

## Verification and Definition of Done

```bash
bun run --filter @emme/core typecheck
bun run --filter @emme/core test
bun run --filter @emme/core build
```

- [ ] Provider transitions and denial/error cases pass with no skipped tests.
- [ ] Salon app can consume core providers through `AppProviders` without behavior regression.
- [ ] All changes are committed and pushed.
