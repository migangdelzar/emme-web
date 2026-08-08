# Feature Module Structure

Reusable business behavior lives in `packages/features/src/<feature>/`.

```text
<feature>/{domain,application/{commands,queries,ports,dto},api/{queries,mutations,fragments,mappers},infrastructure,validation,presentation/{components,hooks,view-models},i18n,test/{fixtures,domain,application},index.ts}
```

Domain and application are React-free. Infrastructure implements feature application ports; presentation consumes UI, core, i18n, and feature APIs but owns no app routes or role workflow. Initial reusable modules are appointments, catalog, customers, staff, payments, communications, integrations, tenant-configuration, onboarding, and analytics.

An app-local feature follows the same separation under `apps/<app>/src/features`; it is promoted only after demonstrated second-app reuse and a dedicated plan.
