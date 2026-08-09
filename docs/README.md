# emme-web — Frontend Documentation

## Architecture

This monorepo contains the web frontend packages and apps for the EMME platform.

### Packages (shared)

| Package | Purpose |
|---|---|
| `@emme/core` | Auth, tenancy, permissions, runtime configuration, shared errors |
| `@emme/domain` | Pure business rules and models; no framework or browser dependencies |
| `@emme/application` | Use cases and ports that orchestrate domain behavior |
| `@emme/api` | Typed backend contracts, routes, ports, and capability adapters |
| `@emme/infrastructure` | Concrete HTTP, auth-token, storage, and external adapters |
| `@emme/i18n` | Typed translation keys, Spanish (es-MX) and English (en-US) |
| `@emme/ui` | Shared UI components |
| `@emme/validation` | Zod schemas shared across apps |

### Apps

| App | Path | Status |
|---|---|---|
| **Admin** | `apps/admin-app/` | Platform administration frontend |
| **Studio** | `apps/salon-app/` | Tenant-owner/staff React 19 + Vite PWA |
| **Client** | `apps/client-app/` | Public client booking frontend |
| **Client** | _(not yet built)_ | Backend APIs ready, frontend pending |
| **Admin** | _(not yet built)_ | Backend APIs ready, frontend pending |

## Relationship to Backend

All three apps consume the same **Spring Modulith** backend (`emme-service`) through typed capabilities in `@emme/api`. Each app sees a subset of the backend's module capabilities:

```
┌──────────────────────────────────────┐
│           emme-service               │
│  (Spring Modulith — 16 modules)     │
└──────┬──────────┬──────────┬─────────┘
       │          │          │
   Studio App  Client App  Admin App
   (React)     (WA/Chat)   (future)
```

## Document Structure

```
docs/
├── README.md                 ← this file
│
├── studio/                   ← Studio app (active frontend)
│   ├── requirements.md       ← 61 user-facing functional requirements
│   └── use-cases/
│       ├── README.md         ← use case index + backend gap list
│       └── UC-XXX-name.md    ← 10 use case specs
│
├── client/                   ← Client app (backend-only today)
│   ├── requirements.md       ← 19 user-facing functional requirements
│   └── use-cases/
│       └── README.md         ← use case index
│
└── admin/                    ← Admin app (backend-only today)
    ├── requirements.md       ← 16 user-facing functional requirements
    └── use-cases/
        └── README.md         ← use case index
```

## Conventions

- **UC IDs** match the backend use case IDs for cross-reference.
- **Requirements** are prefixed `FR-WS###` (studio), `FR-WC###` (client), `FR-WA###` (admin).
- **Status** reflects the frontend implementation state, not backend availability.
- The studio docs are grounded in the actual React component tree. Client and admin docs describe what the backend APIs support as user expectations for future frontend builds.
