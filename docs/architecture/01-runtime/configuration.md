# Runtime Configuration

`@emme/core` owns validated runtime configuration contracts, while apps own the concrete public environment mapping in `app-config.ts`. All `VITE_*` values are public; secrets and authorization policy remain server-side.

Startup validates required API endpoint, API-version, feature-flag, and observability configuration before protected routes render. Invalid or missing configuration produces a normalized non-secret configuration error and disables dependent behavior safely. Tests cover valid, missing, malformed, and environment-specific configuration; CI verifies build-time configuration does not disclose secrets.
