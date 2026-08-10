# Permissions

`@emme/core` owns frontend permission contracts, `useCan`, and
`PermissionGuard`. Features publish capability requirements; apps compose
role-specific routes and navigation. Backend enforcement is mandatory and
cannot be replaced by hidden routes or disabled controls.

```mermaid
flowchart LR
    Session[authorized session] --> Core[core permission vocabulary]
    Feature[feature capability requirement] --> App[app permissions.ts]
    Core --> App
    App --> Route[route/navigation guard]
    Route --> Request[backend-authorized request]
    Request -->|forbidden| Denied[explicit access-denied state]
```

Permission denial exposes no restricted payload and does not imply that a
hidden action is secure. Session/tenant changes recompute capabilities and
invalidate stale protected work.

## Realm-scoped role vocabulary

Role names are interpreted together with the token issuer:

| Issuer | Role | Meaning |
| --- | --- | --- |
| `emme-core` | `admin` | Platform administration and tenant metadata. |
| tenant realm | `tenant_owner` | Full salon access for the current tenant. |
| tenant realm | `tenant_staff` | Staff workflows allowed by the tenant policy. |
| `emme-customers` | `customer` | Customer identity used by client booking. |

The shared customer role does not grant salon administration. Tenant access is
derived from the authenticated customer identity plus a tenant-scoped
membership, and the backend remains the final authorization decision point.

## Permission checklist

- [ ] Every protected route/action names its required capability.
- [ ] Apps, not shared features, map roles to workflow visibility.
- [ ] Allowed, denied, changed-session, and tenant-mismatch behavior is tested.
- [ ] Backend contract tests prove server-side enforcement.
- [ ] Denied states are accessible and reveal no restricted information.
