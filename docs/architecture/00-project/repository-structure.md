# Repository Structure

The workspace remains a Bun monorepo. `apps/emme-salon-app` and `@emme/emme-salon-app` are preserved names; `salon-app` is only the conceptual role name.

```text
apps/{platform-admin-app,emme-salon-app,client-app}/
packages/{kernel,ui,core,i18n,api,infrastructure,features,test-support}/
configs/{eslint,typescript,prettier,vite}/
e2e/ docs/ scripts/ tasks/
```

Apps are composition roots, packages are reusable boundaries, and `e2e` owns cross-app browser journeys. Build tooling belongs in `configs`; it does not contain product behavior. Plan 01 establishes this tree and package boundaries.
