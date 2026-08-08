# Observability

`@emme/infrastructure` owns telemetry adapters; `@emme/core` owns normalized presentation-error context; apps configure providers; features emit only documented user-outcome signals. Telemetry records error category, route/workflow, client version, and safe correlation data without secrets, tokens, message content, or unnecessary personal data.

Observe startup/configuration failure, session/tenant transition, contract error, unavailable/retry exhaustion, and error-boundary fallback. Tests verify event shape and redaction; operational review verifies dashboards and alert ownership.
