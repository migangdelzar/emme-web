# Web Documentation and Decisions

## Source hierarchy

| Artifact | Purpose |
|---|---|
| Architecture rule | Repeated frontend constraint |
| ADR | Consequential frontend/tooling decision |
| Service contract | Executable API/event compatibility source |
| README | Current setup and commands |
| Test/evidence record | Proof that behavior and delivery gates passed |

Focused pages explain their boundary once and link to the owning policy. Do not
copy backend domain rules into web documentation.

## ADR triggers

Record an ADR when changing workspace boundaries, API compatibility strategy,
authentication/session storage, PWA caching, browser security headers, delivery
runtime, or a meaningful accessibility/performance trade-off.

## Diagram policy

Use Mermaid for ownership, request flow, state, and delivery relationships. Every
diagram must have nearby prose that states the invariant it illustrates.

## Review checklist

- [ ] The document has one purpose and an explicit owner.
- [ ] Normative rules are distinguishable from examples.
- [ ] Relative links resolve.
- [ ] Commands match the current Bun workspace.
- [ ] No credentials, tokens, or recordings are shown.
- [ ] Cross-repository claims link to the service source of truth.
