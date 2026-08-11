# Boundary Verification

Every architectural boundary must have executable evidence: a focused test,
the repository architecture validator, or both. Documentation alone does not
protect a boundary.

## Verification matrix

| Boundary | Rule | Evidence |
| --- | --- | --- |
| Package → app | Shared packages cannot import an app | `scripts/validate-architecture.mjs`, `scripts/validate-architecture.test.mjs` |
| App → app | An application cannot import another application | `scripts/validate-architecture.mjs`, `scripts/validate-architecture.test.mjs`, app route-boundary tests |
| Package aliases | Packages cannot use app-only `@/` aliases | Architecture validator and validator test fixture |
| Retired product package | No source imports `@emme/features` | Architecture validator, `apps/salon-app/src/features/feature-boundary.test.ts`, `apps/client-app/src/features/feature-boundary.test.ts` |
| UI → business | `@emme/ui` remains generic and business-agnostic | `packages/ui/src/__tests__/package-boundary.test.ts` |
| UI platform | Web and native exports stay behind the UI platform boundary | `packages/ui/src/__tests__/platform-boundary.test.ts` |
| Business → framework | `@emme/business` remains React/browser/transport-free | `packages/business/src/__tests__/package-boundary.test.ts` |
| Business public API | Capability entry points remain importable | `packages/business/src/__tests__/package-boundary.test.ts`, package export map |
| API contracts | Backend-shaped DTOs and requests stay under API contracts | `packages/api/src/contracts/contracts-boundary.test.ts` |
| Feature ownership | Salon workflows remain in salon features | `apps/salon-app/src/features/feature-boundary.test.ts` |
| Composition root | Concrete HTTP/auth adapters are wired in `AppProviders` | `apps/salon-app/src/app/composition-boundary.test.ts` |
| Auth transport | Auth transport stays behind the app/API boundary | `apps/salon-app/src/app/auth/transport-boundary.test.ts` |
| Translation | App translation usage stays behind the typed translation boundary | `apps/salon-app/src/app/translation-provider-boundary.test.tsx`, i18n boundary tests |
| Styling | App styles use the approved source boundary | `apps/salon-app/src/app/style-source-boundary.test.ts` |
| Production workspace | The frontend image does not escape the workspace boundary | `apps/salon-app/src/app/dockerfile-workspace-boundary.test.ts` |
| Public feature exports | Cross-feature consumers use barrels, not private paths | Feature `index.ts` review rule and feature boundary tests |

## Required test placement

When adding a new boundary:

1. Add a focused test that fails when the boundary is violated.
2. Add or extend a repository validator when the rule applies across packages
   or applications.
3. Add the boundary to this matrix.
4. Run the focused test and the architecture validator.
5. Run the affected package/app suite before committing.

## Current validator rules

`scripts/validate-architecture.mjs` currently rejects:

- package imports of application packages or app paths;
- app-only `@/` aliases inside packages;
- business/API/infrastructure imports from `@emme/ui`;
- imports of the retired `@emme/features` package;
- application imports of another application package or app path.

The validator has fixture coverage in
`scripts/validate-architecture.test.mjs`. The fixture intentionally violates
each rule and asserts the reported rule, file, and import specifier.

## Definition of done

- [ ] New boundary has a focused test or validator rule.
- [ ] The test fails for the intended violation before implementation.
- [ ] The test passes after the boundary is enforced.
- [ ] The boundary is listed in this matrix.
- [ ] `bun run architecture:check` passes.
- [ ] Relevant package/app tests pass with no skipped tests.
