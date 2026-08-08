# Frontend Feature

Feature presentation consumes its feature API plus `@emme/ui`, `@emme/core`, and `@emme/i18n`; it does not call raw `fetch` or construct adapters. It models user-visible loading, ready, empty, editing, pending, validation/conflict, forbidden, and unavailable states.

Commands prevent duplicate submission or use idempotency. Route/tenant changes cancel or ignore stale work; optimistic behavior defines rollback before use. Component and hook tests assert accessible names, keyboard/focus behavior, loading/empty/error states, and the primary outcome.
