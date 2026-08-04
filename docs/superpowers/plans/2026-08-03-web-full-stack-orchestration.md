# Web Full-Stack Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `emme-web` run real tenant-owner browser journeys against an immutable service image from a selected service ref and archive recordings and diagnostics in GitHub Actions.

**Architecture:** The web repository owns Playwright, the web development server, and workflow orchestration. The workflow checks out `emme-service` at an explicit branch/tag/SHA and invokes the service repository’s Compose contract. No backend Compose or Kubernetes configuration is copied into the web repository.

**Tech Stack:** Bun, TypeScript, Playwright, GitHub Actions, Docker Compose, Spring Boot image supplied by `emme-service`.

## Global Constraints

- The workflow is real-only: no mock fallback is permitted when recording.
- Both repository refs are explicit workflow inputs and default to the current feature branches until merge.
- The service image is built once and started through service-owned Compose.
- The web development server is started from the checked-out web ref.
- Credentials are GitHub Actions secrets and are never written to artifacts.
- Videos, traces, HTML reports, JSON reports, service logs, Compose logs, and failed screenshots are retained as artifacts.
- Teardown runs on success, failure, cancellation, and provisioning errors.
- The workflow must be dispatchable without changing source code.

---

### Task 1: Normalize the full-stack workflow contract

**Files:**
- Modify: `.github/workflows/real-e2e-recordings.yml`
- Modify: `e2e/src/specs/real/recording-workflow.contract.spec.ts`
- Modify: `e2e/README.md`
- Modify: `tasks/todo.md`

**Interfaces:**
- Inputs: `service_ref`, `web_ref`, and `e2e_owner_username`.
- Environment: `EMME_SERVICE_IMAGE`, `E2E_BASE_URL`, `E2E_API_URL`, `E2E_KEYCLOAK_USERNAME`, and `E2E_KEYCLOAK_PASSWORD`.
- Artifacts: `emme-real-full-stack-recordings-${{ github.run_id }}` and `emme-real-full-stack-diagnostics-${{ github.run_id }}`.

- [ ] **Step 1: Extend the workflow contract test.**

Assert that the workflow checks out both refs, invokes `containerBuild`, validates Compose with runtime and E2E overlays, starts `emme-platform` through Compose, runs `test:real:recordings`, uploads the recording directory, and tears down with `--volumes --remove-orphans`. Assert that it contains no host `java -jar` or PID-management path.

- [ ] **Step 2: Run the contract test before implementation.**

```bash
bun run --filter @emme/e2e test -- recording-workflow.contract.spec.ts
```

Expected: FAIL because the current workflow starts a boot JAR on the runner.

- [ ] **Step 3: Update the workflow.**

The service step must:

```bash
./gradlew :applications:emme-platform:bootJar containerBuild \
  -Pemme.container.imageName="emme-service:e2e-sha-${GITHUB_SHA}" \
  -Pemme.container.imageTags="e2e-sha-${GITHUB_SHA}" \
  --no-daemon --no-configuration-cache --stacktrace
```

The Compose commands must use the service-owned files:

```bash
docker compose \
  -f deployment/compose/compose.yaml \
  -f deployment/compose/compose.runtime-jvm.yaml \
  -f deployment/compose/compose.environment-e2e.yaml
```

- [ ] **Step 4: Run the contract and YAML checks.**

```bash
bun run --filter @emme/e2e test -- recording-workflow.contract.spec.ts
npx prettier --check .github/workflows/real-e2e-recordings.yml e2e/README.md
```

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add .github/workflows/real-e2e-recordings.yml e2e/src/specs/real/recording-workflow.contract.spec.ts e2e/README.md tasks/todo.md
git commit -m "ci(e2e): orchestrate service image full-stack recordings"
```

### Task 2: Start the selected web ref and expose the real API contract

**Files:**
- Modify: `e2e/src/playwright.config.ts`
- Modify: `e2e/src/fixtures/testWithUser.ts`
- Modify: `apps/emme-salon-app/package.json`
- Test: `e2e/src/specs/real/session.spec.ts`

**Interfaces:**
- The browser uses `E2E_BASE_URL` for navigation.
- Real fixtures use `E2E_API_URL` and `E2E_KEYCLOAK_USERNAME`/`E2E_KEYCLOAK_PASSWORD`.
- Playwright starts the selected web app with the workflow-provided `VITE_API_BASE_URL`.

- [ ] **Step 1: Add configuration tests.**

Test that real mode fails fast when the API URL or credentials are missing, and that it never silently falls back to the mock provider.

- [ ] **Step 2: Run the focused tests.**

```bash
bun run --filter @emme/e2e test -- session.spec.ts
```

Expected: FAIL for missing explicit real-mode contract values.

- [ ] **Step 3: Implement explicit environment handling.**

Set `E2E_KEYCLOAK_USERNAME` and `E2E_KEYCLOAK_PASSWORD` in the workflow. Keep Playwright’s web server command rooted in `apps/emme-salon-app`, and make the command use the selected branch’s package scripts rather than a globally installed tool.

- [ ] **Step 4: Run the web unit and E2E contract checks.**

```bash
bun run quality
bun run --filter @emme/e2e test -- session.spec.ts recording-workflow.contract.spec.ts
```

Expected: PASS, with real-only tests skipped only when the test command is not in real mode.

- [ ] **Step 5: Commit.**

```bash
git add e2e/src/playwright.config.ts e2e/src/fixtures/testWithUser.ts apps/emme-salon-app/package.json e2e/src/specs/real/session.spec.ts
git commit -m "test(e2e): enforce explicit real runtime configuration"
```

### Task 3: Archive complete evidence and guarantee teardown

**Files:**
- Modify: `.github/workflows/real-e2e-recordings.yml`
- Modify: `e2e/README.md`
- Test: `e2e/src/specs/real/recording-workflow.contract.spec.ts`

**Interfaces:**
- Recording artifacts include `e2e/src/test-results/real-recordings` and `e2e/src/playwright-report`.
- Diagnostics include service logs, Compose logs, Keycloak logs, and a rendered Compose configuration.

- [ ] **Step 1: Add artifact and teardown assertions.**

The contract test must assert `if: always()` on uploads and teardown, `if: failure()` on diagnostic dumps, 30-day recording retention, and `docker compose down --volumes --remove-orphans`.

- [ ] **Step 2: Implement diagnostics collection.**

Collect logs into `${RUNNER_TEMP}` before teardown so artifacts remain readable after containers are removed. Do not include environment dumps containing secrets.

- [ ] **Step 3: Run workflow contract and static validation.**

```bash
bun run --filter @emme/e2e test -- recording-workflow.contract.spec.ts
npx prettier --check .github/workflows/real-e2e-recordings.yml e2e/README.md
```

- [ ] **Step 4: Commit.**

```bash
git add .github/workflows/real-e2e-recordings.yml e2e/README.md e2e/src/specs/real/recording-workflow.contract.spec.ts
git commit -m "ci(e2e): archive full-stack diagnostics safely"
```

### Task 4: Add container smoke verification for the web image

**Files:**
- Create: `.github/workflows/container-smoke.yml`
- Modify: `apps/emme-salon-app/Dockerfile`
- Create: `apps/emme-salon-app/compose.web-smoke.yaml`
- Test: `e2e/src/specs/real/container-smoke-workflow.contract.spec.ts`

**Interfaces:**
- Full-stack recordings use the web development server for source-level diagnostics.
- Container smoke uses the built web image and the service image without recording videos.

- [ ] **Step 1: Add workflow contract test.**

Assert that the smoke workflow builds the web image, consumes an explicit service image, waits for health, runs a critical Playwright smoke suite, and tears down the web container.

- [ ] **Step 2: Implement the web container smoke workflow.**

Use immutable image tags for both repositories. Keep this workflow separate from recording because image smoke verifies packaging, while recordings verify user journeys and produce large artifacts.

- [ ] **Step 3: Run static checks.**

```bash
bun run --filter @emme/e2e test -- container-smoke-workflow.contract.spec.ts
npx prettier --check .github/workflows/container-smoke.yml apps/emme-salon-app/compose.web-smoke.yaml
```

- [ ] **Step 4: Commit.**

```bash
git add .github/workflows/container-smoke.yml apps/emme-salon-app/Dockerfile apps/emme-salon-app/compose.web-smoke.yaml e2e/src/specs/real/container-smoke-workflow.contract.spec.ts
git commit -m "ci(container): smoke test the web image with service runtime"
```

### Task 5: Run full web verification and publish the branch

**Files:**
- Modify: `docs/superpowers/plans/2026-08-03-web-full-stack-orchestration.md`
- Modify: `tasks/todo.md`

- [ ] **Step 1: Run web quality and mock E2E.**

```bash
bun run quality
bun run security:check
bun run test:e2e:mock
```

- [ ] **Step 2: Validate workflow and service contract references.**

```bash
npx prettier --check .github/workflows/*.yml e2e/README.md
bun run --filter @emme/e2e test -- recording-workflow.contract.spec.ts container-smoke-workflow.contract.spec.ts
```

- [ ] **Step 3: Run real recordings when GitHub secrets are available.**

Dispatch `Real full-stack E2E recordings` with:

```text
service_ref=feat/enterprise-module-template-conformance
web_ref=feat/api-version-contract
```

Verify the run uploads videos, traces, HTML report, JSON report, service logs, and Compose diagnostics.

- [ ] **Step 4: Record evidence and push.**

Update this plan and `tasks/todo.md`, commit logical slices, push `feat/api-version-contract`, and verify the remote head.

