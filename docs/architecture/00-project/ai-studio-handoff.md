# AI Studio Handoff

This page is the short operational handoff for importing EMME Web into Google
AI Studio or another AI coding agent. The detailed architecture rules remain in
the linked handbook pages.

## Import the correct source

Use the repository root, not only `apps/salon-app`, so the agent can see the
workspace, packages, export maps, tests, build scripts, and cross-app rules.

- [Repository](https://github.com/migangdelzar/emme-web)
- [Current architecture branch](https://github.com/migangdelzar/emme-web/tree/feat/api-version-contract)
- [Salon app](https://github.com/migangdelzar/emme-web/tree/feat/api-version-contract/apps/salon-app)
- [Client app](https://github.com/migangdelzar/emme-web/tree/feat/api-version-contract/apps/client-app)
- [Admin app](https://github.com/migangdelzar/emme-web/tree/feat/api-version-contract/apps/admin-app)
- [Architecture handbook](../README.md)
- [Project structure](repository-structure.md)
- [Architecture patterns](architecture-patterns.md)
- [App shells](app-shell-structure.md)
- [Feature structure](feature-module-structure.md)
- [Package ownership](package-ownership.md)
- [Dependency rules](dependency-rules.md)

At the time of this handoff, `main` contains an older package topology. Use
`feat/api-version-contract` or merge it into `main` before importing.

## Analysis prompt

```text
Analyze the imported EMME web repository as an architecture reference.

The project uses:
- FSD-inspired vertical feature slices in each frontend app;
- Hexagonal/Clean Architecture for shared business and integration boundaries;
- pragmatic capability-oriented DDD in @emme/business;
- Component-Driven Development for @emme/ui.

This is a hybrid architecture, not canonical FSD. Do not introduce mandatory
global entities/widgets/pages layers.

Before changing files, report:
1. The exact current repository tree.
2. The responsibilities of admin-app, client-app, and salon-app.
3. The responsibilities and allowed dependencies of every packages/* package.
4. The salon feature structure and public-boundary rules.
5. The dependency graph and composition-root flow.
6. The proposed client and admin feature trees based on salon-app.
7. Any conflict between source code and documentation, identifying historical
   documents that must not guide new implementation.
```

## Implementation prompt

```text
Implement client-app and admin-app using salon-app as the structural reference,
while keeping each application independently deployable.

Preserve these invariants:
- app shell code is under apps/<app>/src/app;
- product workflows are under apps/<app>/src/features/<capability>;
- feature folders are vertical slices with optional api, components, hooks,
  mappers, domain, application, infrastructure, presentation, state, and
  validation folders;
- every feature exposes a public index.ts and forbids deep imports;
- reusable domain/application behavior belongs in @emme/business/<capability>;
- API contracts belong in @emme/api;
- concrete HTTP, storage, auth, and telemetry adapters belong in
  @emme/infrastructure;
- runtime auth, tenancy, permissions, and providers belong in @emme/core;
- the shared auth gate belongs in @emme/auth;
- generic accessible visual components belong in @emme/ui;
- no package imports app code;
- no app imports another app;
- client and admin must not import salon feature internals;
- concrete dependencies are instantiated only in composition roots;
- backend authorization and tenant isolation remain authoritative.

First show the proposed file tree and dependency map. Then work incrementally,
adding tests before behavior changes and preserving the Bun scripts and package
exports. Do not invent backend endpoints or add dependencies without documenting
the decision first.
```

## Do not upload

Exclude `.env` files except sanitized `.env.example` files, API keys, OAuth
secrets, generated auth storage states, local credentials, `node_modules`,
`dist`, coverage, Playwright reports, and backend/private repositories.

## Agent invariants

- Do not flatten the monorepo into one application.
- Do not copy salon product workflows into `@emme/ui`.
- Do not resurrect `@emme/domain`, `@emme/application`, or `@emme/features` as
  current ownership destinations.
- Do not rename `admin-app`, `client-app`, or `salon-app` to historical names.
- Do not move app login pages into `@emme/auth`.
- Do not put business policy inside API clients or UI components.
- Do not replace Bun with npm, pnpm, or Turbo without an explicit migration.
- Treat frontend guards as UX only; backend authorization is authoritative.
