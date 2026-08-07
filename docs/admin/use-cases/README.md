# Admin App — Use Case Index

> **Backend:** `emme-service` Spring Modulith
> **Status:** Backend APIs implemented. Dedicated admin web frontend not yet in this monorepo.

| UC ID | Name | Primary Actor | Status |
|---|---|---|---|
| UC-001 | Access Tenant Workspace | Platform User | Backend |
| UC-002 | Manage Tenant Lifecycle | Platform Administrator | Backend |
| UC-017 | Audit Business Activity | Platform Administrator | Backend |
| UC-018 | Maintain Search Projections | System Operator | Backend |
| UC-019 | Manage Feature Flags | Platform Administrator | Backend |
| UC-020 | Manage Platform Memberships | Platform Administrator | Backend |

## Coverage Map

| Requirements | Use Cases |
|---|---|
| FR-WA001 – FR-WA007 Tenant lifecycle | UC-002 |
| FR-WA008 – FR-WA010 Feature flags | UC-019 |
| FR-WA011 – FR-WA013 Memberships | UC-020 |
| FR-WA014 – FR-WA016 Audit & operations | UC-017, UC-018 |
