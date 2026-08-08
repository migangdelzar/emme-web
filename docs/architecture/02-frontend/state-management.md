# State Management

Keep server state, UI state, form state, session state, and tenant context separate. Features own query/mutation state and view models; `@emme/core` owns session, tenancy, permissions, flags, and normalized errors; apps own route and workflow composition.

Invalidate or isolate cached data on tenant/session changes. Never infer tenant context from arbitrary component state. Tests cover stale response rejection, cache invalidation, duplicate actions, offline/retry, and recovery after a failed mutation.
