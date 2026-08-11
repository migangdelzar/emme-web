# Salon Feature Structure

> **Status: Updated.** Product features are currently owned by
> `apps/salon-app`. Only framework-free behavior with demonstrated reuse is
> extracted into `@emme/business`.

The frontend feature model is FSD-inspired vertical slicing, not canonical FSD.
Hexagonal/Clean layers are introduced inside a feature only when the feature
has a real application port or adapter. See
[architecture patterns](architecture-patterns.md) for the scope of each
architecture pattern.

## Salon feature template

```text
apps/salon-app/src/features/<feature>/
├── api/                         # feature queries, mutations, mappers
├── components/                  # salon-specific components
├── hooks/                       # React query/workflow hooks
├── mappers/                     # API/view-model mapping
├── presentation/               # reusable within salon app only
├── validation/                  # form/workflow schemas
├── i18n/                        # feature namespace translations
├── test/                        # fixtures and integration tests when needed
└── index.ts                     # local public barrel
```

Pages, routes, navigation, permissions, workflow state, and role-specific
forms remain in this tree or the nearest salon app shell directory. A salon
feature may depend on `@emme/business/<capability>`, `@emme/api`,
`@emme/core`, `@emme/i18n`, `@emme/infrastructure`, and `@emme/ui` according
to the dependency rules.

## Business capability template

```text
packages/business/src/<capability>/
├── domain/
│   ├── entities/ or *.types.ts
│   ├── value-objects/ or *.ts
│   ├── policies/ or *.rules.ts
│   ├── errors/ or *-errors.ts
│   └── index.ts
├── application/
│   ├── commands/ or *.ts
│   ├── queries/ or *.ts
│   ├── ports/ or ports.ts
│   ├── dto/                  # only when a stable business DTO is needed
│   └── index.ts
└── index.ts
```

Business domain and application code are React-free. Dependencies are injected
through TypeScript protocols. Concrete HTTP, storage, and provider adapters
are created by the app composition root or implemented in the owning app
feature's adapter folder.

## Authentication boundary and app-local login

```text
packages/auth/src/
├── components/AuthGate.tsx
├── __tests__/AuthGate.test.tsx
└── index.ts
```

`@emme/auth` provides the shared authentication state gate and accepts app-owned
fallbacks for signed-out and tenant-required states. Every app owns its login
page and may give it different branding, copy, fields, or navigation. Session
state delegates to `@emme/core`.
Authorization remains a backend concern; `AuthGate` is a user-experience
boundary, not a security control.

## Naming rules

- Feature folders use lowercase kebab-case (`google-workspace`,
  `appointments`).
- React components use PascalCase files and symbols (`AppointmentForm.tsx`).
- Hooks use `use<Name>.ts`; schemas use `<subject>.schema.ts`.
- Business rules use `<subject>.rules.ts`; errors use `<subject>-errors.ts`.
- API operations use verb-first names (`listAppointments`, `cancelAppointment`).
- Tests stay beside the source for unit/component tests; feature integration
  suites live under `test/` or a feature `__tests__/` boundary.
- Public boundaries use `index.ts`; consumers do not deep-import internals.

## Ownership checklist

- [ ] Product UI and workflows are under `apps/salon-app/src/features`.
- [ ] Reusable business behavior is framework-free and under `@emme/business`.
- [ ] Generic visual components are under `@emme/ui`.
- [ ] Auth gating uses `@emme/auth`; login and tenant-selection pages are
      app-local.
- [ ] No app imports a shared product-feature package; product features are
      app-local and `@emme/features` is retired.
- [ ] Each feature has loading, empty, error, forbidden, and success tests.
