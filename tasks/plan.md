# Superseded Implementation Plan

This earlier package-first plan assumed a shared `@emme/features` package and
separate `@emme/domain`/`@emme/application` packages. The approved salon-first
architecture replaced that topology.

Use the current plan instead:

- [Salon-first architecture specification](../docs/superpowers/specs/2026-08-09-salon-first-architecture-design.md)
- [Salon-first migration plan](../docs/superpowers/plans/2026-08-09-salon-first-business-migration.md)
- [Architecture handbook](../docs/architecture/README.md)

The current rules are:

- `@emme/business` contains reusable framework-free business capabilities.
- `apps/salon-app/src/features` owns current product UI and workflows.
- `@emme/auth` contains the shared auth gate; each app owns its login page.
- `admin-app`, `salon-app`, and `client-app` remain separate deployables.
