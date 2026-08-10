# ADR-002: Separate deployable frontend applications

## Status

Accepted

## Date

2026-08-09

## Context

EMME has three different browser products with different users, security
policies, authentication behavior, release cadence, and scaling needs:

- platform administration at `admin.emme.com`;
- salon tenant-owner/staff operations at `app.emme.com`;
- public client booking at `book.emme.com` or tenant custom domains.

They share TypeScript packages, API contracts, UI primitives, and infrastructure
adapters, but combining their production output would make cache invalidation,
rollback, security policy, and release ownership unnecessarily coupled.

## Decision

Keep one Bun monorepo with three independent application roots and package names:

| Application | Package | Image | Primary host |
| --- | --- | --- | --- |
| Platform admin | `admin-app` | `emme/admin-frontend` | `admin.emme.com` |
| Salon | `salon-app` | `emme/salon-frontend` | `app.emme.com` |
| Client | `client-app` | `emme/client-frontend` | `book.emme.com` |

Use `deploy/docker/frontend.Dockerfile` as the shared parameterized build
recipe. `APP_NAME` selects exactly one app build and copies only that app's
`dist` directory into the Nginx runtime image. Kubernetes has one Deployment
and Service per frontend, with one Ingress routing the three hosts.

The salon application is tenant-agnostic. Tenant identity is resolved by the
authenticated session, hostname, or request context; it is not encoded in the
image or deployment name.

## Alternatives Considered

### One combined frontend image

Rejected because admin, salon, and client releases, security policies, cache
invalidation, scaling, and rollback would be coupled.

### Three unrelated Dockerfiles

Rejected because build behavior would drift between applications. A single
parameterized recipe keeps the production stages and security defaults aligned.

## Consequences

### Positive

- Each frontend can be released and rolled back independently.
- Images contain only the selected app's production artifact.
- Shared packages remain reusable without sharing deployment fate.
- Kubernetes health checks and monitoring identify each product separately.

### Negative

- CI builds three artifacts when all applications change.
- Deployment configuration must keep three image references and services
  compatible with the API gateway.

### Risks

- A shared package change can still affect all applications. Mitigation:
  build and smoke-test every affected app before promotion.
- Public runtime configuration can be misconfigured. Mitigation: validate
  browser-safe runtime config at startup and keep secrets out of images.
