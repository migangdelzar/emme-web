# Web CI and Regression Delivery

## Required gates

```mermaid
flowchart LR
    Install["Frozen Bun install"] --> Docs["Docs links + fences"]
    Docs --> Types["Typecheck"]
    Types --> Lint["Lint"]
    Lint --> Unit["Unit/component tests"]
    Unit --> Build["Production build"]
    Build --> Audit["High-severity audit"]
```

Pull requests MUST run documentation validation, typecheck, lint, unit/component
tests, production build, and high-severity dependency audit. The single
`ci-frontend.yml` workflow owns the repository quality gates, mock E2E lane, and
the conditional real full-stack lane. The real lane uses the default Compose
target or an explicitly supplied k3d/k3s environment. The real recording suite
is serial and is the only lane allowed to archive videos.

The repository also runs `security-scan.yml` for Gitleaks and Bun audit. The
`dependency-review.yml` workflow is available for manual dispatch after GitHub
Dependency Graph is enabled for the repository. Any temporary allowlist is
documented in the [dependency risk register](../05-operations/dependency-risk-register.md)
with a compensating control and review date.

## Rules

- CI uses the repository lockfile and pinned action major versions.
- The fast test command MUST not silently require a running backend.
- Real E2E explicitly declares service ref, environment, and credentials source.
- Compose is the default disposable target; k3d and k3s require explicit
  selection and pre-provisioned URLs.
- k3s production runs MUST use a protected GitHub Environment and immutable
  service/web revisions.
- Mock E2E diagnostics MAY retain failure screenshots/traces, but MUST NOT
  archive videos.
- Regression jobs should be parallel when they do not share a deployment or
  mutable test data.
- CI logs MUST redact tokens, cookies, and sensitive request bodies.
- Cache keys include lockfile/toolchain identity.
- A warning-only lint policy MUST have a tracked reduction plan; new errors fail.

## Workflow responsibilities

```mermaid
flowchart TB
    PR[Pull request / main push]
    PR --> Frontend[Frontend and full-stack CI]
    PR --> Backend[Service CI quality]
    Frontend --> Mock[Mock provider E2E]
    Frontend --> Real[Real provider E2E on push/manual selection]
    Real --> Compose[Compose default]
    Real --> K3d[k3d explicit target]
    Real --> K3s[k3s protected target]
    Release[Release workflow] --> Image[JVM/native immutable images]
    Image --> Deploy[Protected deployment]
    Security[Security workflow] --> Fast[PR secret/SAST/dependency gates]
    CVE[Scheduled CVE workflow] --> Deep[Deep dependency/filesystem/image scan]
```

`ci-frontend.yml` and the service repository's unified backend CI are the
repository-owned verification runs. `real-e2e-recordings.yml` is a reusable
workflow called by the frontend run; its `suite` input selects either the full
real suite or the serial recording subset. Release image builds, scheduled
security scans, and post-deploy smoke checks remain separate operational gates
because they require different permissions, credentials, or environments.
