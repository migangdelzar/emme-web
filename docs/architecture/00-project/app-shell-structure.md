# App Shell Structure

```text
apps/<app>/src/
  app/{App.tsx,AppProviders.tsx,app-config.ts,router.tsx,routes,layouts,error-boundary}/
  features/ config/ theme/ main.tsx
```

Each app owns routing, layouts, navigation, branding, app forms/filters, role-specific permission composition, and workflow orchestration. Concrete dependencies are wired only at its composition root.

The salon app composes tenant-owner/staff workflows; the client app composes customer discovery, booking, history, chat, and calendar flows; platform admin owns tenant lifecycle, flags, memberships, operations, provisioning, and subscriptions. Platform-only pages never force their policy into tenant features.
