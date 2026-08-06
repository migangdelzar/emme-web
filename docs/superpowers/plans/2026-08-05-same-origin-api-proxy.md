# Same-Origin API Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route browser API, OAuth, health, and SSE traffic through the frontend origin in Vite development and Nginx production.

**Architecture:** Keep Nginx as the production static server and add configurable proxy locations. Keep Vite as the local development proxy. The browser-facing `VITE_API_BASE_URL` points to the web origin, while `API_PROXY_TARGET` and `EMME_API_UPSTREAM` identify the server-side backend target.

**Tech Stack:** Vite 6, Nginx 1.27 Alpine, Docker Compose, TypeScript, Vitest, Bun.

## Global Constraints

- Do not introduce Envoy or a new dependency.
- Do not stage or modify the pre-existing `e2e/src/specs/services/services.spec.ts` change.
- Keep direct API URLs used by E2E provisioning and cleanup fixtures unchanged.
- API routes must not fall through to the SPA `index.html`.
- SSE proxying must disable response buffering and allow long-lived reads.

---

### Task 1: Document the design and update the task checklist

**Files:**
- Create: `docs/superpowers/specs/2026-08-05-same-origin-api-proxy-design.md`
- Create: `docs/superpowers/plans/2026-08-05-same-origin-api-proxy.md`
- Create: `.dockerignore`
- Modify: `tasks/todo.md`

- [x] **Step 1: Write design and plan documents**

Record the Nginx decision, same-origin request flow, configurable upstreams, SSE behavior, non-goals, and verification commands.

- [x] **Step 2: Record acceptance criteria in `tasks/todo.md`**

```markdown
- [ ] Browser API base points to the web origin in local and E2E Vite runs
- [ ] Vite proxies API, OAuth, and health paths to the backend
- [ ] Production Nginx proxies API, OAuth, and health paths
- [ ] Nginx preserves SPA fallback only for non-API paths
- [ ] SSE uses a same-origin URL and Nginx supports streaming
- [ ] Tests, typecheck, lint, build, and config validation pass
```

- [x] **Step 3: Commit documentation**

```bash
git add docs/superpowers/specs/2026-08-05-same-origin-api-proxy-design.md \
  docs/superpowers/plans/2026-08-05-same-origin-api-proxy.md tasks/todo.md
git commit -m "docs: plan same-origin API proxying"
```

### Task 2: Add failing same-origin URL tests

**Files:**
- Modify: `packages/api-client/src/client.test.ts`
- Create: `apps/emme-salon-app/src/features/dashboard/hooks/dashboardStream.test.ts`
- Create: `apps/emme-salon-app/src/features/dashboard/hooks/dashboardStream.ts`

- [x] **Step 1: Write the failing API URL test**

Add a test using `createHttpClient({ baseUrl: "http://localhost:3000" })` and assert that `/api/me` is requested at `http://localhost:3000/api/me`.

- [x] **Step 2: Run the focused API test and observe the baseline**

```bash
bun run --filter @emme/api-client test -- client.test.ts
```

Expected: existing tests pass; the new assertion documents same-origin URL behavior.

- [x] **Step 3: Write the failing dashboard stream URL test**

Define `createDashboardStreamUrl(webOrigin: string): string` and assert that `createDashboardStreamUrl("https://app.example.com")` returns `https://app.example.com/api/dashboard/stream`.

- [x] **Step 4: Run the focused dashboard test**

```bash
cd apps/emme-salon-app && bunx vitest run src/features/dashboard/hooks/dashboardStream.test.ts
```

Expected: FAIL until the helper exists.

### Task 3: Configure Vite and browser runtime values

**Files:**
- Modify: `apps/emme-salon-app/vite.config.ts`
- Modify: `apps/emme-salon-app/.env.example`
- Modify: `apps/emme-salon-app/src/features/dashboard/hooks/useDashboardData.ts`
- Modify: `apps/emme-salon-app/src/features/dashboard/hooks/dashboardStream.ts`
- Modify: `e2e/src/playwright.config.ts`
- Modify: `.github/workflows/real-e2e-recordings.yml`

- [x] **Step 1: Configure Vite's server-side target**

Load `API_PROXY_TARGET` only in Vite config and use it for `/api`, `/oauth2`, `/login/oauth2`, and `/q`, defaulting to `http://localhost:8081`.

- [x] **Step 2: Configure same-origin browser base URLs**

Set `.env.example` to `VITE_API_BASE_URL=http://localhost:3000`, set the E2E web-server API base to `http://localhost:3000`, and set the local proxy target to `http://localhost:8081`.

- [x] **Step 3: Route dashboard SSE through the browser origin**

Use `createDashboardStreamUrl(window.location.origin)` and keep the existing local-development skip behavior.

- [x] **Step 4: Run app tests and build**

```bash
bun run --filter @emme/emme-salon-app test
bun run --filter @emme/emme-salon-app typecheck
bun run --filter @emme/emme-salon-app build
```

Expected: all commands pass.

### Task 4: Configure production Nginx and Docker upstream wiring

**Files:**
- Create: `apps/emme-salon-app/nginx.conf.template`
- Modify: `apps/emme-salon-app/Dockerfile`
- Modify: `apps/emme-salon-app/docker-compose.yml`
- Modify: `apps/emme-salon-app/README.md`
- Modify: `docs/architecture/04-delivery/container.md`

- [x] **Step 1: Add Nginx proxy locations**

Template `/api`, `/oauth2`, `/login/oauth2`, and `/q` locations with `proxy_pass http://${EMME_API_UPSTREAM};`, forwarded headers, and SSE-safe buffering/timeouts. Keep static assets, `/health`, and SPA fallback behavior.

- [x] **Step 2: Wire the official Nginx template entrypoint**

Copy the template to `/etc/nginx/templates/default.conf.template` and set a safe image default for `EMME_API_UPSTREAM`; allow Compose/Kubernetes to override it without rebuilding the image.

- [x] **Step 3: Configure local Docker networking**

Set `EMME_API_UPSTREAM=host.docker.internal:8081` in the frontend Compose file and document `emme-service:8081` or the platform's internal service DNS as the production override.

- [x] **Step 4: Validate the rendered Nginx configuration**

```bash
docker build -f apps/emme-salon-app/Dockerfile -t emme-web-proxy-check .
docker run --rm emme-web-proxy-check nginx -T
```

Expected: rendered config contains the proxy locations and no unresolved `${EMME_API_UPSTREAM}` placeholder.

Rendered configuration passed `nginx -t` and exposed the expected
`proxy_pass`, `proxy_buffering off`, and `proxy_read_timeout 1h` directives.
The full image build was attempted but the npm registry returned an integrity
failure for `whatwg-mimetype@3.0.0` after downloading dependencies.

### Task 5: Full verification and handoff

**Files:**
- Modify: `tasks/todo.md`

- [x] **Step 1: Run repository verification**

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

- [x] **Step 2: Review the diff and preserve unrelated changes**

```bash
git diff --check
git status --short
git diff --stat
```

Ensure `e2e/src/specs/services/services.spec.ts` remains unstaged and untouched.

Focused and full unit tests, frontend build, frontend lint, diff checks, and
rendered Nginx validation passed. Repository typecheck remains blocked by
pre-existing E2E fixture type errors and a `platformClient` import path
mismatch. Docker Compose validation is unavailable because this machine has no
Compose plugin.

- [ ] **Step 3: Commit and push the proxy work**

```bash
git add apps packages e2e/src/playwright.config.ts .github/workflows/real-e2e-recordings.yml docs tasks/todo.md
git commit -m "feat: proxy browser API traffic through web origin"
git push origin feat/api-version-contract
git log --oneline origin/feat/api-version-contract -1
```
