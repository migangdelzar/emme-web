# Web Git and Review Policy

- Use a branch named for one cohesive frontend or documentation change.
- Use `type(scope): imperative description` commits.
- Keep lockfile changes intentional and review generated diffs.
- Never commit build output, `.env`, credentials, tokens, HAR recordings, or
  machine-specific paths.
- Pull requests must state the service contract/version used by integration tests.
- UI changes include focused test evidence and screenshots/traces when useful.
- Architecture, security, and accessibility risks must be explicit.
