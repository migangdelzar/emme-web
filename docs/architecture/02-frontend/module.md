# Frontend Module

A reusable module is a vertical feature in `@emme/features`; an app-local module stays under its app until a second app demonstrates reuse. Its public barrel exposes stable capabilities, not private folders.

Data flows from presentation through feature API/application ports to infrastructure and the backend, then returns as feature-owned view models or typed results. Modules own their domain policy, use cases, feature adapters, validation, presentation, i18n namespace, and tests. They do not own app routes, generic UI, or global runtime policy.
