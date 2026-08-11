# Documentation and Decisions

> **Status: Updated.** This retained policy now names the approved handbook and
> plan portfolio as the source of future architecture decisions.

## Source hierarchy

| Artifact | Purpose |
| --- | --- |
| [Project architecture specification](../PROJECT-ARCHITECTURE-SPEC.md) | Current architecture index and ownership map |
| Architecture handbook page | Durable repeated structure, boundary, and quality rule |
| ADR | Consequential decision and its lifecycle |
| [Master plan portfolio](../../superpowers/plans/2026-08-08-00-complete-monorepo-index.md) | Implementation sequence and status |
| Service contract | Executable API/event compatibility source |
| Test/evidence record | Proof that behavior and delivery gates passed |

The handbook preserves the current canonical trees. Earlier migration plans and
superseded decisions are archived outside the active handbook and must not be
used as competing implementation guidance.

## ADR lifecycle and triggers

Use `Proposed → Accepted → Superseded` or `Deprecated`. Never delete an ADR
that explains a consequential past choice. A replacement references the old
decision, and the old page links to its replacement.

Record an ADR when changing workspace boundaries, public package/API
compatibility, authentication/session storage, caching, browser security,
delivery runtime, or a material accessibility/performance trade-off.

## Diagram policy

Use Mermaid for ownership, dependencies, request/validation flow, state,
testing lanes, and delivery relationships. Every diagram has nearby prose that
states its invariant. A diagram is not a substitute for exact trees, public
exports, failure behavior, or checklists.

## Review checklist

- [ ] The document has one purpose, owner, and status.
- [ ] Normative rules are distinguishable from examples and historical context.
- [ ] Canonical trees and filenames are complete rather than summarized.
- [ ] Every retained conflicting page is updated or explicitly superseded.
- [ ] Relative links resolve and every handbook page is indexed.
- [ ] Commands match the Bun workspace and validation is non-mutating.
- [ ] No credentials, tokens, private recordings, or local-only paths appear.
- [ ] Cross-repository claims link to the service source of truth.
