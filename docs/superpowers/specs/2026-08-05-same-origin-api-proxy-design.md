# Same-Origin API Proxy Design

**Date:** 2026-08-05
**Status:** Approved for implementation

## Goal

Ensure browser API traffic uses the frontend origin in local development and the production web container, allowing Vite or Nginx to proxy requests to the REST API and avoiding browser CORS requirements for normal frontend traffic.

## Decision

Use Nginx for production proxying. The production image already uses Nginx to serve the compiled Vite application, so adding proxy locations keeps the deployment topology small and avoids introducing Envoy as an additional runtime component. Envoy remains appropriate only when an existing platform gateway or service mesh already standardizes on it.

## Architecture

```text
Browser
  │ same-origin /api, /oauth2, /login/oauth2, /q
  ├── Vite dev server ──► API_PROXY_TARGET (default localhost:8081)
  └── Nginx production ─► EMME_API_UPSTREAM (default host.docker.internal:8081)
```

The typed API client receives the web origin through `VITE_API_BASE_URL` in local/E2E configuration. Production deployments set the value to the public web origin used to serve the bundle. The upstream API address is a server-side proxy setting and is not embedded in browser requests.

## Scope

- Vite proxies `/api/`, `/oauth2/`, `/login/oauth2/`, and `/q/`.
- Nginx proxies the same paths and preserves forwarded request context.
- Nginx disables buffering and extends the read timeout for the dashboard SSE endpoint under `/api/`.
- Dashboard SSE uses the current web origin instead of a direct API URL.
- Docker Compose supplies a host-reachable local API upstream; Kubernetes or another platform can override `EMME_API_UPSTREAM` with internal DNS.
- E2E web-server configuration points browser API calls to the Vite origin; direct API URLs remain available to test provisioning/cleanup code.

## Non-goals

- Adding Envoy or a new gateway.
- Changing backend CORS policy.
- Changing direct API calls used by E2E fixtures to provision or clean data.
- Changing authentication semantics. SSE authentication still depends on the backend's supported cookie/session behavior because native `EventSource` cannot attach the stored bearer token as a custom header.

## Failure behavior

- If the proxy upstream is unavailable, Vite returns its normal proxy error and Nginx returns a gateway error from `proxy_pass`.
- `/api` and API subpaths must never fall through to `index.html`.
- Non-API paths continue to use the existing SPA fallback.

## Verification

- Unit test that the API client accepts the web-origin base and emits a same-origin API URL.
- Unit test that dashboard SSE URL construction uses `/api/dashboard/stream` on the supplied web origin.
- Assert proxy targets and locations through configuration text tests where practical.
- Run frontend typecheck, lint, unit tests, build, and Docker/Nginx config validation when Docker is available.
