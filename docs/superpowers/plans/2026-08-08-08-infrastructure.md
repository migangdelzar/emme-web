# Infrastructure Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement concrete technical adapters for HTTP, auth/session storage, tenancy, browser storage, telemetry, and external providers.

**Architecture:** Infrastructure implements `@emme/api` transport protocols and feature application ports. It does not own business rules and is wired only by app composition roots.

**Tech Stack:** TypeScript, browser APIs behind adapters, Vitest, existing fetch/storage implementations.

## Global Constraints

- No secrets in source or logs.
- External systems are injected or wrapped behind protocols.
- Retry behavior is bounded and tested.
- Tenant and auth headers are added at the transport boundary.

## Files

- Modify: `packages/infrastructure/src/http/`, `auth/`, `storage/`, `api/`, and `index.ts`.
- Create: `src/tenant/`, `src/telemetry/`, `src/providers/`, and feature adapter directories under `packages/features/src/*/infrastructure/`.
- Test: adapter tests with `FakeHttpClient`, memory storage, fixed clock, and provider fakes.

### Task 1: HTTP adapter

**Test:** `packages/infrastructure/src/http/fetch-http-client.test.ts`

```ts
it('maps a non-success response to a normalized ApiError', async () => {
  const client = createFetchHttpClient({ fetch: failingFetch, baseUrl: '/api' });
  await expect(client.get('/services')).rejects.toMatchObject({ code: 'http.unauthorized' });
});
```

- [ ] **Step 1:** Write tests for success, JSON parsing, no-content, timeout, retry limit, malformed response, and 401/403/404/409/500 mapping.
- [ ] **Step 2:** Implement the HTTP adapter against the `@emme/api` protocol.
- [ ] **Step 3:** Run focused tests and typecheck; expected result is PASS.

### Task 2: Auth, tenant, and storage adapters

- [ ] **Step 1:** Write tests for token persistence, expiry, clearing on logout, tenant resolution, memory fallback, and storage failures.
- [ ] **Step 2:** Implement token storage, tenant storage/resolver, browser storage, and secure-storage protocol adapters.
- [ ] **Step 3:** Run `bun run --filter @emme/infrastructure test`; expected result is PASS.

### Task 3: Feature repository adapters and telemetry

- [ ] **Step 1:** Write tests proving appointment/client/service adapters map API payloads to feature models and preserve tenant context.
- [ ] **Step 2:** Move existing adapters out of global application/domain imports into feature-local infrastructure modules.
- [ ] **Step 3:** Implement analytics/error tracking protocols with no-op test adapters and redaction tests.
- [ ] **Step 4:** Run package build and all adapter tests; expected result is PASS.

### Task 4: Commit

```bash
git add packages/infrastructure packages/api
git commit -m "feat(infrastructure): add concrete transport and external adapters"
```

## Definition of Done

- [ ] Concrete adapters are injectable and tested.
- [ ] No business policy lives in infrastructure.
- [ ] Auth, tenant, retry, error, and redaction behavior is covered.
