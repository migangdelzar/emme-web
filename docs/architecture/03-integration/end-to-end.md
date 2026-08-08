# End-to-End Integration

Root `e2e` owns critical cross-app browser journeys. Mocked E2E is deterministic and runs without a backend; real E2E runs only with explicitly configured service endpoints, credentials, tenants, and immutable revisions.

Flows prove auth/session, tenant context, contract compatibility, primary mutation, permission denial, and recoverable backend failure. Diagnostics redact secrets; recording artifacts are bounded by delivery policy. E2E failures are triaged against the smallest supporting component, contract, or adapter test.
