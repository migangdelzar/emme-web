# Frontend Feature Template

```text
apps/emme-salon-app/src/features/<feature>/
├── components/          # feature UI
├── hooks/                # feature state/query orchestration
├── api/                  # feature adapter to typed client
├── model/                # view state/value types, only when needed
├── fixtures/             # synthetic test data, never credentials
└── <Feature>.test.tsx
```

## Feature contract

- Own one user-facing capability.
- Consume `@emme/api-client` and `@emme/contracts`, never backend internals.
- Define loading, empty, error, offline, permission, and success states.
- Keep server state distinct from local UI state.
- Keep network side effects in adapters/hooks, not presentational components.
- Add unit/component and applicable browser evidence.
- Add navigation and accessibility semantics as part of the feature, not later.
