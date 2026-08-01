# Web Security and Privacy

- Treat all server responses, query parameters, browser storage, and user input
  as untrusted.
- Enforce authorization on the service; frontend guards are UX only.
- Keep private provider credentials out of source, `VITE_*`, images, logs, and
  telemetry.
- Prefer secure server-managed sessions; document any browser token storage in an
  ADR with threat model and controls.
- Do not cache authenticated API responses or sensitive content in the service
  worker.
- Use React escaping and context-appropriate encoding for untrusted content.
- Redact authorization headers, cookies, tokens, and free-form input from errors
  and telemetry.
- Verify security headers, dependency scans, and source-secret scans in CI.

## Verification

- [ ] Permission-denied states are tested.
- [ ] Public runtime configuration is reviewed.
- [ ] Browser storage and service-worker behavior are inspected.
- [ ] Logs and telemetry contain no sensitive values.
