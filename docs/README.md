# emme-web — Frontend Documentation

## Architecture

This monorepo contains the web frontend packages and apps for the EMME platform.

### Packages (shared)

| Package | Purpose |
|---|---|
| `@emme/core` | Auth, tenancy, permissions, runtime configuration, shared errors |
| `@emme/business` | Framework-free business capabilities with internal domain/application layers |
| `@emme/api` | Typed backend contracts, routes, ports, and capability adapters |
| `@emme/infrastructure` | Concrete HTTP, auth-token, storage, and external adapters |
| `@emme/i18n` | Typed translation keys, Spanish (es-MX) and English (en-US) |
| `@emme/ui` | Shared UI components |
| `@emme/auth` | Shared authentication gate primitive; login pages remain app-local |
| `@emme/validation` | Zod schemas shared across apps |

### Apps

| App | Path | Status |
|---|---|---|
| **Admin** | `apps/admin-app/` | Platform administration frontend |
| **Salon** | `apps/salon-app/` | Current tenant-owner/staff React 19 + Vite PWA and product feature owner |
| **Client** | `apps/client-app/` | Separate deployable shell; auth-only scope for now |
| **Admin** | `apps/admin-app/` | Separate deployable shell; auth-only scope for now |

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
