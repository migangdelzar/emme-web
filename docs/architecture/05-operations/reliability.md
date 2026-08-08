# Reliability

Features distinguish validation/conflict from retryable unavailable/offline failures. Infrastructure owns bounded retry behavior; features prevent duplicate mutations or use idempotency; presentation provides loading, safe retry, and recovery states. Tenant/session changes invalidate stale in-flight work and cached data.

Reliability tests cover timeout, offline, retry exhaustion, duplicate action, stale response, session expiry, tenant switch, and error-boundary recovery. Production readiness requires health/smoke evidence, safe degradation, telemetry, and a tested rollback target.
