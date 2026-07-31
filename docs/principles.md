# Web Engineering Principles

- Organize by user-facing capability and reason to change.
- Keep app shell, feature state, transport adapters, and shared UI separate.
- Depend on typed contracts, not backend implementation details.
- Keep network, storage, time, and browser APIs at visible boundaries.
- Prefer immutable data and explicit state machines for async UI behavior.
- Keep accessibility, security, and error states part of the feature contract.
- Avoid global mutable singletons and hidden browser side effects.
- Do not add shared package abstractions until at least two consumers need the
  same stable behavior.
- Never use `any` or unchecked casts without a documented external-boundary reason.
- Do not commit credentials, tokens, HAR recordings, or customer data.

Ask before every change: which feature owns it, what contract does it consume,
what can fail, and what evidence proves the user-visible behavior?
