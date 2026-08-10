# App Shell and Workflow Structure

Each app is an independent composition root and deployable artifact. All three
shells share the authentication gate primitive through `@emme/auth`; each app
owns its own login presentation. Current product features are owned by
`salon-app` only.

## Shell template

```text
apps/<app>/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   ├── app-config.ts
│   ├── router.tsx
│   └── layouts/
├── features/                 # only salon-app owns product features today
└── main.tsx
```

`AppProviders` creates the runtime contexts and injects infrastructure. `App`
composes `AuthGate`, app-local signed-out/tenant fallbacks, layouts, and routes.
Backend authorization remains authoritative.

## Salon app

```text
apps/salon-app/src/features/
├── appointments/{api,components,hooks,mappers,presentation,validation}/
├── clients/{api,components,hooks}/
├── dashboard/{components,hooks}/
├── finances/{components,hooks}/
├── google-workspace/{components,hooks}/
├── navigation/
├── onboarding/{components}/
├── services/{api,components,domain,hooks,validation}/
├── settings/{components,context,hooks}/
├── shared/{components,hooks,uiStore}/
└── feature-boundary.test.ts
```

Salon owns the current pages, hooks, feature state, role workflows, API
composition, and business-specific components. Reusable framework-free rules
and use cases are consumed from `@emme/business`.

## Admin and client apps

```text
apps/admin-app/src/
├── app/
└── main.tsx

apps/client-app/src/
├── app/
├── features/auth/            # app-local login presentation only
└── main.tsx
```

The admin and client applications remain separate deployable shells so their
security policies, URLs, environments, releases, and rollback paths stay
independent. They may render the shared `@emme/auth` gate and call shared
API/core packages, but their login pages remain local and they do not consume
salon product features or `@emme/features`.

## Composition flow

```mermaid
flowchart TB
    Main[main.tsx] --> Providers[AppProviders.tsx]
    Providers --> Infra["@emme/infrastructure"]
    Providers --> Core["@emme/core"]
    App[App.tsx] --> Auth["@emme/auth gate + app login"]
    Auth --> Routes[router.tsx]
    Routes --> Salon["salon-app local workflow"]
    Salon --> Business["@emme/business"]
    Salon --> API["@emme/api"]
```

## Checklist

- [ ] Each app has its own build, runtime configuration, and production image.
- [ ] All three apps use the shared auth gate with app-local login pages.
- [ ] Salon product features remain under `apps/salon-app/src/features`.
- [ ] Admin/client shells do not import salon feature internals.
- [ ] Concrete infrastructure is created only in composition-root wiring.
- [ ] Route, auth, loading, error, and workflow tests exist for active flows.
