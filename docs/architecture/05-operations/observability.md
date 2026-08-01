# Frontend Observability

## Signals

- route and feature load timing;
- API request outcome and bounded latency by endpoint category;
- JavaScript error and unhandled rejection rate;
- Web Vitals where they inform a user-facing objective;
- PWA update, offline-shell, and service-worker failures;
- authentication/session-expiry and authorization-denial outcomes.

## Privacy rules

- Never send tokens, cookies, health answers, payment data, or free-form user
  input to telemetry.
- Use correlation IDs supplied by the service; do not encode customer identity in
  metric labels.
- Capture URL path templates, not query strings containing sensitive data.
- Error reports MUST identify the feature and release without shipping secrets.

## Verification

- [ ] A failed API journey has a correlation ID and actionable browser evidence.
- [ ] Sensitive browser state is absent from logs and telemetry.
- [ ] Release/version metadata is visible in diagnostics.
