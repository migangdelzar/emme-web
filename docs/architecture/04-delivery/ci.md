# Web Continuous Integration

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
tests, production build, and high-severity dependency audit. Mock Playwright
journeys remain an explicit local/manual workflow until their current fixture
and backend-health assumptions are made deterministic. Real-stack E2E and image
smoke require coordinated service and deployment environments and remain
release-promotion gates.

The repository also runs `security-scan.yml` for Gitleaks and Bun audit, and
`dependency-review.yml` for pull-request dependency changes. The single
temporarily allowlisted React Router advisory is documented in the
[dependency risk register](../05-operations/dependency-risk-register.md).

## Rules

- CI uses the repository lockfile and pinned action major versions.
- The fast test command MUST not silently require a running backend.
- Real E2E explicitly declares service ref, environment, and credentials source.
- CI logs MUST redact tokens, cookies, and sensitive request bodies.
- Cache keys include lockfile/toolchain identity.
- A warning-only lint policy MUST have a tracked reduction plan; new errors fail.
