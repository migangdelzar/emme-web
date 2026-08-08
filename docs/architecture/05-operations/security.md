# Security

Browser code and `VITE_*` configuration are public. The backend remains the authority for identity, authorization, tenant isolation, validation, persistence, and invariants. Frontend controls provide defense in depth: safe session storage, explicit tenant context, CSP/headers where deployed, dependency and secret scanning, and telemetry redaction.

Tests and CI cover unauthorized/forbidden behavior, tenant mismatch, configuration safety, dependency/secret checks, and absence of raw error leakage. Security exceptions require a documented owner, scope, compensating control, and expiry.
