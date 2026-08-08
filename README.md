# EMME Web

![React](https://img.shields.io/badge/UI-React%2019-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/bundler-Vite-646CFF?logo=vite)
![Bun](https://img.shields.io/badge/package%20manager-Bun-F9F1E1?logo=bun)
[![CI](https://github.com/migangdelzar/emme-web/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/migangdelzar/emme-web/actions/workflows/ci-frontend.yml)

EMME Web is the React/Vite browser application for salon operations. It is a
standalone Bun workspace with capability-oriented frontend modules, typed API
packages, localized UI, PWA assets, and Playwright browser journeys.

> **Backend partner:** [emme-service](https://github.com/migangdelzar/emme-service)

The web repository owns presentation and interaction. The service repository
owns authorization, tenancy, validation, persistence, and business truth.

## Architecture at a glance

```mermaid
flowchart LR
    MAIN[main.tsx] --> APP[App shell]
    APP --> ROUTER[Routes and providers]
    ROUTER --> FEATURE[Capability feature]
    FEATURE --> API[Typed API client]
    API --> CONTRACT[HTTP contract]
    CONTRACT --> SERVICE[emme-service]
    FEATURE --> SHARED[Shared UI/platform packages]
    E2E[Playwright] --> APP
    E2E --> SERVICE
```

## Quick start

### Prerequisites

| Tool | Version | Purpose |
|---|---:|---|
| Bun | 1.2.x | Workspace install, scripts, and test runner |
| Node-compatible shell | Current | Tooling interoperability |
| Docker | Current, optional | Container and integrated E2E workflows |
| emme-service | Sibling checkout | Real backend API journeys |

Expected integrated layout:

```text
workspace/
├── emme-service/
└── emme-web/
```

```bash
git clone https://github.com/migangdelzar/emme-web.git
cd emme-web

bun install --frozen-lockfile
bun run dev
```

The Vite application runs at `http://localhost:3000`. Copy
`apps/emme-salon-app/.env.example` to a local `.env` and set only public
browser configuration. Never put private provider keys in `VITE_*` variables.

## Repository structure

```text
apps/emme-salon-app/  Main React/Vite/PWA application
packages/infrastructure/ Concrete HTTP, auth, storage, and external adapters
packages/api/          Typed backend contracts and API boundary
packages/core/         Auth, tenancy, permissions, and runtime providers
packages/domain/       Pure business rules and models
packages/application/  Use cases and application ports
packages/i18n/        Locale catalogs and translation helpers
packages/ui/          Reusable presentational primitives
packages/validation/  Shared boundary validation
packages/test-support/ Shared test fixtures and factories
e2e/src/              Playwright journeys and test providers
docs/                 Frontend and integration architecture
```

## Frontend boundaries

```text
apps/emme-salon-app/src/
├── app/          Composition root, routes, and providers
├── auth/         Session and tenant selection behavior
├── features/     User-facing capabilities
├── api/          Feature API adapters and query hooks
├── shared/       Deliberately reusable UI and layout
├── config/       Validated public runtime configuration
└── main.tsx      Browser entry point
```

Features own user outcomes and feature state. The app shell owns routing and
cross-feature providers. Shared code must be stable and genuinely reused.
Backend internals are never imported; all communication crosses the typed HTTP
contract through `@emme/infrastructure` and `@emme/api`.

## Container image

The production web image is published as:

```text
ghcr.io/migangdelzar/emme-web
```

The Dockerfile labels this image with the web repository as its source. Image
publishing and deployment credentials belong to CI or the deployment secret
manager; they must never be placed in `VITE_*` variables or committed files.

## Verification

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

For real browser verification, start the sibling backend and run:

```bash
E2E_MODE=real bun run --filter @emme/e2e test:real
```

For deterministic product-flow videos, run `bun run --filter @emme/e2e
test:demo` locally or manually dispatch the `Playwright demo recordings`
GitHub Actions workflow. Videos and reports are uploaded as a 14-day artifact;
they are not committed.

The default `test` command is intentionally limited to unit/component tests.
Run `bun run test:e2e` for Playwright; critical real journeys require the
sibling backend, deterministic users/tenants, and must not commit tokens,
recordings, or environment files.

## Documentation

| Topic | Location |
|---|---|
| Architecture handbook | [`docs/architecture/README.md`](docs/architecture/README.md) |
| App shell | [`docs/architecture/02-frontend/app.md`](docs/architecture/02-frontend/app.md) |
| Frontend modules | [`docs/architecture/02-frontend/module.md`](docs/architecture/02-frontend/module.md) |
| Features | [`docs/architecture/02-frontend/feature.md`](docs/architecture/02-frontend/feature.md) |
| React boundaries | [`docs/architecture/02-frontend/react.md`](docs/architecture/02-frontend/react.md) |
| Vite | [`docs/architecture/02-frontend/vite.md`](docs/architecture/02-frontend/vite.md) |
| Testing | [`docs/architecture/02-frontend/testing.md`](docs/architecture/02-frontend/testing.md) |
| Backend integration | [`docs/architecture/03-integration/frontend-backend.md`](docs/architecture/03-integration/frontend-backend.md) |
| Contract consumption | [`docs/architecture/03-integration/contracts.md`](docs/architecture/03-integration/contracts.md) |
| End-to-end | [`docs/architecture/03-integration/end-to-end.md`](docs/architecture/03-integration/end-to-end.md) |
| Delivery | [`docs/architecture/04-delivery/`](docs/architecture/04-delivery/) |
| Operations | [`docs/architecture/05-operations/production-readiness.md`](docs/architecture/05-operations/production-readiness.md) |
| Policies | [`docs/principles.md`](docs/principles.md), [`docs/security.md`](docs/security.md), [`docs/testing.md`](docs/testing.md) |

## License

Proprietary. See the service repository and project policy before distributing
the application or generated assets.
