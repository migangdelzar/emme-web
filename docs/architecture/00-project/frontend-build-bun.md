# Bun Workspace and Toolchain

## Workspace responsibilities

| Area                      | Owner                 |
| ------------------------- | --------------------- |
| Root scripts and lockfile | Repository root       |
| Application composition   | `apps/emme-salon-app` |
| HTTP transport            | `packages/api-client` |
| Typed boundary models     | `packages/contracts`  |
| Reusable UI               | `packages/ui`         |
| Validation                | `packages/validation` |
| Browser journeys          | `e2e/src`             |

## Rules

- `bun.lock` is authoritative; CI uses `bun install --frozen-lockfile`.
- Root scripts MUST remain stable entry points for local and CI verification.
- Mise task names MUST delegate to those same root scripts rather than create a
  second build implementation.

## Local hooks

The web repository uses Husky because its toolchain is already JavaScript/Bun
based. The hooks are intentionally tiered:

```mermaid
flowchart LR
    Commit[git commit] --> Staged[lint-staged]
    Staged --> Prettier[Prettier write]
    Staged --> ESLint[ESLint fix]
    Staged --> I18n[i18n boundary check]
    Push[git push] --> Format[format check]
    Push --> Types[TypeScript]
    Push --> Coverage[Vitest V8 coverage]
    CI[Pull request CI] --> Build[Production build]
    CI --> E2E[Mock E2E]
    CI --> Audit[Dependency audit]
```

`spotlessApply` is a service-only Gradle formatter and does not belong in this
repository. Prettier write commands may change staged files; all validation
commands remain non-mutating.

Run `mise run hooks-install` after a clean checkout. Coverage uses a measured
initial floor and must be ratcheted upward; it is not a substitute for browser
journey coverage.

- Packages MUST expose only intentional public exports.
- Application-only dependencies belong to the application, not a shared package.
- Build output, test recordings, environment files, and credentials are ignored.
- Add a package only when it has a cohesive ownership and lifecycle boundary.

```mermaid
flowchart LR
    Root["root scripts + lockfile"] --> App["salon app"]
    Root --> Packages["workspace packages"]
    Root --> E2E["Playwright workspace"]
    App --> Packages
    E2E --> App
    E2E --> Service["sibling emme-service"]
```

## Required commands

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build
```
