# API and Infrastructure

`@emme/api` defines abstract HTTP/transport protocols and safe API errors. `@emme/infrastructure` implements concrete `fetch`, retries, headers, session/tenant storage, telemetry, and global external clients. Feature-specific repository adapters remain with their feature when implementing its application ports.

```text
feature capability -> API protocol -> infrastructure adapter -> versioned HTTP request -> backend
```

Transport failures map to typed unavailable, unauthorized, forbidden, conflict, validation, or contract errors. Adapter tests deterministically cover serialization, API-version and tenant headers, retry policy, redaction, and response parsing.
