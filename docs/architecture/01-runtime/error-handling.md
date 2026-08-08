# Error Handling

Expected business and application outcomes use `Result<T, E>` with typed errors. `@emme/api` normalizes transport and contract failures; `@emme/core` maps them to presentation-safe errors and error-boundary behavior; `@emme/infrastructure` preserves diagnostic cause without exposing secrets.

| Failure | UI behavior |
| --- | --- |
| validation or conflict | actionable field/message state |
| unauthorized or forbidden | sign-in or access-denied state |
| tenant mismatch | tenant recovery state; discard stale response |
| timeout/offline | retryable unavailable state |
| invalid contract/configuration/programmer fault | boundary fallback and safe telemetry |

Tests assert error categories, retry safety, stale-request handling, and redaction. Raw transport payloads and stack traces never reach UI copy.
