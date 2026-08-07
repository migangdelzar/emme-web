# EMME Admin — User-Facing Requirements

| Field | Value |
|---|---|
| App | Platform administration interface |
| Backend | Spring Modulith (`emme-service`) |
| Audience | Platform administrators, system operators |
| Status | Backend implemented; dedicated frontend not yet built in this monorepo |

## Functional Requirements

### Tenant Lifecycle

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WA001 | Create tenant | As a platform administrator, I want to create a new salon tenant with domain, subscription plan, and configuration. | Backend |
| FR-WA002 | List and filter tenants | As a platform administrator, I want to view all tenants filtered by status. | Backend |
| FR-WA003 | View tenant details | As a platform administrator, I want to see tenant configuration, health, and provisioning status. | Backend |
| FR-WA004 | Update tenant | As a platform administrator, I want to change a tenant's domain, plan, limits, or configuration. | Backend |
| FR-WA005 | Suspend and reactivate tenant | As a platform administrator, I want to safely suspend a tenant while preserving data, and reactivate when resolved. | Backend |
| FR-WA006 | Stage tenant deletion | As a platform administrator, I want to stage deletion with an audit hold before permanent destruction. | Backend |
| FR-WA007 | Request tenant provisioning | As a platform administrator, I want to trigger infrastructure provisioning for a new tenant. | Backend |

### Feature Flags

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WA008 | Manage global feature flags | As a platform administrator, I want to define and toggle platform-wide feature flags for gradual rollout. | Backend |
| FR-WA009 | Override features per tenant | As a platform administrator, I want to override a feature flag for a specific tenant. | Backend |
| FR-WA010 | View tenant effective features | As a platform administrator, I want to see which features are active for a tenant including overrides. | Backend |

### Membership & Access

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WA011 | View all memberships | As a platform administrator, I want to list all user memberships across tenants. | Backend |
| FR-WA012 | Assign membership | As a platform administrator, I want to assign a user to a tenant with a specific role. | Backend |
| FR-WA013 | Revoke membership | As a platform administrator, I want to revoke a user's membership to immediately remove access. | Backend |

### Audit & Operations

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WA014 | View audit log | As a platform administrator, I want to see security-sensitive events with tenant, actor, and request metadata. | Backend |
| FR-WA015 | Reconcile search projections | As a system operator, I want to detect and rebuild stale tenant search projections. | Backend |
| FR-WA016 | View tenant subscriptions | As a platform administrator, I want to view any tenant's subscription plan, status, and entitlements. | Backend |
