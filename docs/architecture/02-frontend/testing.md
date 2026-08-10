# Frontend Testing

> **Status: Updated.** Detailed presentation and browser guidance complements
> the canonical [test-location matrix](../00-project/testing-architecture.md).

| Level | Purpose | Boundary |
| --- | --- | --- |
| unit | pure functions, reducers, validators, formatters | no browser/network |
| component/hook | rendering, interaction, accessibility, observable state | DOM with protocol fake |
| integration | app/feature composition, routing, providers | real packages with fake transport |
| contract/adapter | schema, mapping, request, retry, storage | deterministic protocol boundary |
| E2E | critical journey | mock provider or configured running service |

## Minimum presentation suite

```text
feature presentation tests
├── renders loading and ready states
├── renders empty state
├── completes the primary outcome
├── rejects invalid input with associated errors
├── renders conflict, forbidden, and unavailable states
├── prevents duplicate action and stale result
├── restores focus/keyboard flow
└── cleans up on route, session, or tenant change
```

Tests use semantic queries and mock owned protocols, not private React modules.
Time, randomness, locale, network, tenant, session, and permissions are
controlled. E2E proves only critical composition and does not replace focused
state/error tests.

## Frontend test checklist

- [ ] Tests assert user-visible behavior rather than component internals.
- [ ] API outcomes include malformed, validation, conflict, unauthorized,
      forbidden, unavailable, tenant mismatch, and success cases.
- [ ] Session expiry, tenant change, permission change, and cleanup are covered.
- [ ] Keyboard, focus, accessible names, and error association are covered.
- [ ] Mock and real E2E lanes are explicitly identified.
- [ ] Diagnostics contain no credentials, tokens, private response data, or
      local paths.
- [ ] Tests are deterministic, isolated, parallel-safe, and not skipped.
