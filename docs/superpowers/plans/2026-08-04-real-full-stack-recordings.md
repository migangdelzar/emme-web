# Real Full-Stack Recordings Implementation Plan

**Goal:** Run reproducible tenant-owner browser journeys against the current
Emme web and service branches, archive the recordings, and leave no runtime
state behind.

**Architecture:** `emme-service` owns the disposable PostgreSQL, Redis,
Keycloak, and database-migration runtime overlay. `emme-web` owns Playwright,
browser recordings, and the cross-repository GitHub Actions orchestrator. Both
repositories are selected by explicit branch/ref inputs and can later default
to `main` without changing the workflow contract.

**Tech Stack:** GitHub Actions, Docker Compose, Spring Boot/Gradle, Keycloak,
Bun, Vite, Playwright, GitHub Actions artifacts, CodeRabbit.

## Global Constraints

- Real E2E must run with `E2E_MODE=real`; it must never fall back to mocks.
- The initial defaults must remain `feat/api-version-contract` and
  `feat/enterprise-module-template-conformance`.
- Credentials must come from GitHub Actions secrets and must never be committed
  or printed.
- Videos, traces, reports, and runtime logs are artifacts, not repository files.
- The service branch must remain responsible for its own disposable runtime
  dependencies and migrations.

## Task List

- [x] Add the service-owned disposable Compose E2E overlay.
- [x] Add typed Keycloak realm provisioning and tenant-owner database seeding tooling in `emme-service`.
- [ ] Replace the URL-only recording lane with a Clara-style ephemeral full-stack
      workflow using the current branch defaults.
- [ ] Add workflow contract tests and validate YAML, shell syntax, and Compose
      rendering.
- [ ] Add repository-specific CodeRabbit guidance and exclude generated noise.
- [ ] Run the real workflow and archive its resulting artifacts.
- [ ] Change default refs to `main` only after both feature branches merge.

## Verification

- `./gradlew :tools:e2e-provisioner:test --no-daemon --no-configuration-cache`
- `docker compose -f deployment/compose/compose.yaml -f deployment/compose/compose.runtime-jvm.yaml -f deployment/compose/compose.environment-e2e.yaml config --quiet`
- Web formatting, typecheck, unit, build, mock E2E, and workflow contract tests.
- GitHub Actions real E2E with disposable Keycloak/PostgreSQL/Redis and the
  current feature refs.
