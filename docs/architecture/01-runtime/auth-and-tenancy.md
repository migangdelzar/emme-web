# Authentication and Tenancy

`@emme/core` owns session state and tenant-resolution contracts; `@emme/api` owns auth-session and tenant request contracts; `@emme/infrastructure` implements approved browser storage and HTTP attachment. Apps compose providers at startup.

```text
runtime config -> session restore -> tenant resolution -> explicit request context -> API/infrastructure -> backend
```

Expired sessions, missing/changed tenant context, and unavailable session storage resolve to typed presentation-safe errors and a recoverable sign-in or selection state. Client guards improve UX only: the backend remains authoritative for authorization and tenant isolation. Tests use fake clocks, sessions, tenant stores, and transport; cover restore, expiry, switch, mismatch, and logout cleanup.
