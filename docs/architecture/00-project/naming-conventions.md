# Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| package directory | kebab-case | `test-support` |
| package name | `@emme/<kebab-case>` for libraries; exact app directory name for deployable apps | `@emme/test-support`, `salon-app` |
| feature/layer directory | lowercase kebab-case | `tenant-configuration` |
| React component directory | PascalCase | `AppointmentStatusBadge/` |
| React component file | PascalCase | `AppointmentStatusBadge.tsx` |
| component types | PascalCase file plus `.types` | `AppointmentStatusBadge.types.ts` |
| domain/application module | kebab-case | `cancel-appointment.ts` |
| hook | `use` plus PascalCase symbol | `useAppointments.ts` |
| class/entity/type symbol | PascalCase | `Appointment`, `AppointmentId` |
| function/constant symbol | camelCase | `calculateAppointmentTotal` |
| schema module | kebab-case plus `.schema` | `book-appointment-input.schema.ts` |
| colocated test | source name plus `.test` | `cancel-appointment.test.ts` |
| cross-module test | `src/__tests__/` | `src/__tests__/package-boundary.test.ts` |
| fixture | explicit `.fixture` suffix | `appointment.fixture.ts` |
| request handler | explicit `.handlers` suffix | `appointment.handlers.ts` |
| public barrel | `index.ts` | `appointments/index.ts` |

## Rules

- Names communicate business intent or one technical responsibility.
- Avoid catch-all files such as `utils.ts`, `helpers.ts`, and `common.ts` unless
  the file has one clearly documented responsibility.
- Use `customer` for the canonical feature name; map a backend `clientId` at the
  API boundary instead of spreading transport terminology into the domain.
- Use `salon-app` for the tenant-owner/staff deployable application and
  `admin-app` / `client-app` for the other deployable roots.
- Use `admin-app` for the platform administration deployable. Use `admin` for
  its core-realm role. Reserve `platform-admin` for historical documents or
  migration identifiers; it is not a runtime role name.
- Error names describe the failed invariant or category, not the component that
  happened to display them.
- Route, navigation, permission, and module files use the exact names
  `routes.tsx`, `navigation.ts`, `permissions.ts`, and `module.ts` in each app
  feature.
- The approved client workflow tree preserves `appointmentFilters.schema.ts` as
  a named compatibility example; new schema modules otherwise use kebab-case.

## Export naming

- Public `index.ts` barrels re-export named symbols; default exports are not the
  cross-package convention.
- Factory names begin with `create`, declarative configuration helpers with
  `define`, hooks with `use`, and boolean predicates with `is`, `has`, or `can`.
- Protocol names describe the capability (`AppointmentRepository`, `Clock`),
  while concrete adapters include their mechanism (`GraphQLAppointmentRepository`).
- A public symbol keeps the same name at every barrel; aliases require an
  explicit compatibility reason and removal plan.

## Naming checklist

- [ ] Directory, file, symbol, schema, fixture, handler, test, and barrel names
      match the table.
- [ ] A name does not expose a private transport or provider detail across a
      business boundary.
- [ ] Generic files do not hide unrelated responsibilities.
- [ ] App workflow metadata uses the standard four filenames.
- [ ] Public named exports remain stable and collision-free.
