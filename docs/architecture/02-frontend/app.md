# Frontend App

Apps are composition roots. They wire runtime config, core providers, concrete infrastructure, router, layouts, and selected feature public APIs; they own routes, branding, navigation, role workflows, and app-only forms/filters.

```text
main -> app config -> error/session/tenant providers -> router/layout -> app workflow -> feature public API
```

No app imports another app's internals or puts feature state/API calls in global providers. Tests cover protected/anonymous routes, session and tenant transitions, app error fallback, and critical workflow composition.
