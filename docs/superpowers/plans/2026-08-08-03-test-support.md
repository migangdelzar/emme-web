# Test Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Provide deterministic, reusable test providers, fakes, fixtures, and handlers for every package and app.

**Architecture:** Test support depends only on test/runtime contracts and is never a production dependency. Complex fakes have their own tests; simple record-and-return fakes stay local.

**Tech Stack:** Vitest, Testing Library, React 19, TanStack Query test utilities already used by the workspace.

## Global Constraints

- Never call real HTTP, storage, Google, payment, messaging, AI, or backend services in unit tests.
- Fakes expose explicit error injection fields and resettable state.
- Fixtures include tenant and permission identity.

## Files

- Modify: `packages/test-support/package.json`, `packages/test-support/src/index.ts`.
- Create: `packages/test-support/src/fakes/fake-http-client.ts`, `packages/test-support/src/fakes/fake-clock.ts`, `packages/test-support/src/fakes/fake-storage.ts`, `packages/test-support/src/fixtures/appointment.fixture.ts`, `packages/test-support/src/fixtures/customer.fixture.ts`, `packages/test-support/src/fixtures/service.fixture.ts`, `packages/test-support/src/fixtures/tenant.fixture.ts`, `packages/test-support/src/providers/test-wrapper.tsx`, `packages/test-support/src/providers/test-query-provider.tsx`, `packages/test-support/src/providers/test-auth-provider.tsx`, and `packages/test-support/src/providers/test-tenancy-provider.tsx`.

### Task 1: HTTP, clock, and storage fakes

**Test:** `packages/test-support/src/fakes/fake-http-client.test.ts`

```ts
it('returns queued responses in request order and records requests', async () => {
  const http = new FakeHttpClient();
  http.enqueue({ id: 'service-1' });
  await expect(http.get('/services')).resolves.toEqual({ id: 'service-1' });
  expect(http.requests[0]).toMatchObject({ method: 'GET', path: '/services' });
});
```

- [x] **Step 1:** Write failing tests for queued responses, injected errors, fixed time, and isolated memory storage.
- [x] **Step 2:** Implement protocol-compatible fakes with `error: Error | null` and request recording.
- [x] **Step 3:** Run `bun run --filter @emme/test-support test`; expected result is PASS.

### Task 2: Fixtures and providers

- [ ] **Step 1:** Write tests proving `createTestWrapper` provides i18n, auth, tenancy, and query context without leaking state between tests.
- [ ] **Step 2:** Implement fixture factories with override arguments: `createAppointmentFixture`, `createCustomerFixture`, `createServiceFixture`, and `createTenantFixture`.
- [ ] **Step 3:** Implement test providers and export only public factories from `src/index.ts`.
- [ ] **Step 4:** Run `bun run --filter @emme/test-support typecheck` and the focused provider tests; expected result is PASS.

### Task 3: Commit

```bash
git add packages/test-support
git commit -m "test(support): add deterministic shared test doubles"
```

## Definition of Done

- [ ] Every shared fake is deterministic and tested.
- [ ] Test support is not present in production dependency lists.
- [ ] Feature plans can use the fixtures and providers without importing app internals.
