# Bun Workspace and Toolchain

> **Status: Updated.** Workspace/tooling guidance is retained; package ownership
> is reconciled with the canonical vertical-feature model.

## Workspace responsibilities

| Area | Owner |
| --- | --- |
| root scripts and lockfile | repository root |
| application composition | each `apps/*` shell |
| pure shared primitives | `packages/kernel` |
| generic UI and tokens | `packages/ui` |
| auth, tenancy, permissions, runtime | `packages/core` |
| shared localization runtime/catalogs | `packages/i18n` |
| abstract backend/transport contracts | `packages/api` |
| global HTTP, storage, provider adapters | `packages/infrastructure` |
| reusable vertical business behavior | `packages/features/src/<feature>` |
| deterministic shared test utilities | `packages/test-support` |
| browser journeys | root `e2e` |

The legacy `packages/domain`, `packages/application`, and
`packages/validation` directories are migration sources, not future ownership
destinations.

## Rules

- `bun.lock` is authoritative; CI uses `bun install --frozen-lockfile`.
- Root scripts remain stable entry points for local and CI verification.
- Mise tasks delegate to root scripts rather than create a second build path.
- Packages expose only intentional public exports.
- Application-only dependencies belong to an app, not a shared package.
- Build output, test recordings, environment files, and credentials are ignored.
- Add a package only for a cohesive ownership and lifecycle boundary.

## Local hooks and CI escalation

```mermaid
flowchart LR
    Commit[git commit] --> Staged[lint-staged]
    Staged --> Prettier[Prettier write]
    Staged --> ESLint[ESLint fix]
    Staged --> I18n[i18n boundary check]
    Push[git push] --> Format[format check]
    Push --> Types[TypeScript]
    Push --> Coverage[Vitest coverage]
    CI[Pull request CI] --> Docs[docs and architecture]
    CI --> Build[production build]
    CI --> E2E[mocked/applicable real E2E]
    CI --> Audit[dependency and secret checks]
```

Prettier write commands may change staged files; validation commands are
non-mutating. Coverage begins with a measured floor and is ratcheted upward; it
does not replace critical browser journeys.

```mermaid
flowchart LR
    Root["root scripts + bun.lock"] --> Apps["three app shells"]
    Root --> Packages["eight target packages"]
    Root --> E2E["Playwright workspace"]
    Apps --> Packages
    E2E --> Apps
    E2E --> Service["sibling emme-service"]
```

## Required commands

```bash
bun install --frozen-lockfile
bun run docs:check
bun run architecture:check
bun run typecheck
bun run lint
bun run test
bun run build
```
