# Continuous Integration

CI uses the Bun lockfile and pinned action major versions. Pull requests run documentation, i18n, architecture, typecheck, lint, unit/component, coverage, build, security, and applicable E2E gates. Fast lanes do not require a running backend; real E2E declares its environment and credential source.

Jobs redact tokens, cookies, and sensitive request bodies. Parallelize independent checks; serialize only shared deployments or mutable test data. A warning-only quality exception has an owner, compensating control, and expiry.
