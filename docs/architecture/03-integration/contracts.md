# Integration Contracts

The backend owns canonical HTTP/event authority; `@emme/api` owns version-aware transport protocols, envelopes, errors, pagination, tenant request context, contract validation, and shared generated types. Features own the capability contracts, DTO mapping, queries, mutations, and fragments they use.

Unknown response fields are forward-compatible; missing required fields are explicit contract failures. Contract changes require provider and affected-consumer compatibility tests before deprecated fields are removed. Browser clients never import backend internals.
