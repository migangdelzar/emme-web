# Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| package, feature, layer directory | lowercase kebab-case | `tenant-configuration` |
| package name | `@emme/<kebab-case>` | `@emme/test-support` |
| component directory and file | PascalCase | `AppointmentStatusBadge/AppointmentStatusBadge.tsx` |
| component type file | PascalCase plus `.types` | `AppointmentStatusBadge.types.ts` |
| domain/application module | kebab-case | `cancel-appointment.ts` |
| hook | `use` plus PascalCase symbol | `useAppointments.ts` |
| class, entity, type | PascalCase | `AppointmentId` |
| function and constant | camelCase | `calculateAppointmentTotal` |
| schema | kebab-case plus `.schema` | `book-appointment-input.schema.ts` |
| test and fixture | `.test` and `.fixture` suffixes | `cancel-appointment.test.ts` |

Every public package and feature entry point is `index.ts`. Avoid catch-all names such as `utils.ts`, `helpers.ts`, and `common.ts` unless one responsibility is documented.
