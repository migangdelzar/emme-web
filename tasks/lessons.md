# Engineering Lessons

## 2026-08-08 — Publish NodeNext-safe internal ESM specifiers

- Failure mode: shared package source used extensionless relative imports that
  passed bundler resolution but failed NodeNext typechecking.
- Detection signal: TS2835 reported the missing emitted `.js` extension from a
  public barrel re-export.
- Prevention rule: for published ESM package internals, use `.js` relative
  specifiers and keep implementation modules from importing runtime values back
  through their own public barrel.

## 2026-08-03 — Validate package-specific test selectors

- Failure mode: the first API-client test command passed a repository path to a
  package-scoped Vitest script, so Vitest discovered no test files.
- Detection signal: the command exited non-zero with a “no test files found”
  message even though the targeted test file existed.
- Prevention rule: inspect the package script first and invoke the test runner
  from the package root or pass only arguments supported by that script.

## 2026-08-03 — Provide runtime configuration to browser test servers

- Failure mode: Playwright launched Vite without the required `VITE_API_BASE_URL`
  and `VITE_WEB_BASE_DOMAIN` values, producing a blank application page and
  cascading UI failures.
- Detection signal: unrelated tests failed to find the first page controls,
  while the screenshot showed an entirely white page.
- Prevention rule: define deterministic runtime environment variables in the
  Playwright `webServer.env` configuration and restart any reused dev server
  after changing them.

## 2026-08-03 — Match mock API routes at the URL boundary

- Failure mode: a glob catch-all for `**/api/**` matched Vite source modules
  under `/src/api/` and returned a mock 401 before the application could boot.
- Detection signal: the browser loaded the document but React rendered a blank
  page, and the failed request was a JavaScript module rather than an API call.
- Prevention rule: constrain browser mock routes to URLs whose path begins at
  the host root (`/api/`), and keep a smoke test that proves the app boots.

## 2026-08-03 — Verify library exports and generic test inputs

- Failure mode: the first generic mutation implementation imported a
  `mutationOptions` helper that is not exported by the installed TanStack Query
  version, and the first query test invoked a parameterized query with unrelated
  arguments.
- Detection signal: the focused test failed at runtime before exercising the
  mutation, followed by a query assertion that received the wrong parameters.
- Prevention rule: verify the installed library's runtime exports before using
  convenience helpers, and make generic tests invoke the exact input captured
  by each resource factory.

## 2026-08-03 — Avoid overloaded domain names in frontend transport

- Failure mode: the first name for a path-scoped HTTP wrapper was
  `DomainClient`, which blurred the distinction between a DDD domain model and
  an HTTP resource boundary.
- Detection signal: the name did not communicate whether it represented a
  business domain, an external provider, or a transport helper.
- Prevention rule: keep `HttpClient` as the shared transport and use existing
  capability API adapters rather than introducing another scoped-client layer;
  reserve `Provider` for replaceable external adapters.

## 2026-08-03 — Keep browser locale and test locale aligned

- Failure mode: changing the application default locale to English made legacy
  E2E page-object assertions look for Spanish labels, causing unrelated auth,
  navigation, and form failures.
- Detection signal: the UI rendered valid translated content, but selectors
  built from the shared E2E catalog did not match it.
- Prevention rule: define one documented default locale for the application and
  derive browser assertions from the same typed catalog; when changing it,
  update the E2E runtime contract in the same slice.

## 2026-08-08 — Keep subagents on the controller branch

- Failure mode: an implementation subagent changed the shared checkout to a
  different feature branch while the controller was executing the migration.
- Detection signal: `git branch --show-current` changed even though the
  controller had not requested a branch transition.
- Prevention rule: verify the branch before and after every delegated task;
  interrupt and close any subagent that performs an unsolicited checkout, then
  restore the approved branch before continuing.

## 2026-08-08 — Keep shared dialog positioning on canonical utilities

- Failure mode: dialog primitives used arbitrary percentage utility classes
  that were not emitted in the application stylesheet, leaving tall dialogs
  below the viewport and making their controls unclickable.
- Detection signal: Playwright reported a visible dialog control as outside
  the viewport; measured geometry showed `top: 720px` and `transform: none`.
- Prevention rule: use canonical Tailwind positioning utilities in shared UI
  primitives (`top-1/2`, `left-1/2`, `-translate-x-1/2`, and
  `-translate-y-1/2`) and protect them with a component regression test plus
  an end-to-end dialog flow.

## 2026-08-08 — Audit composition roots for legacy transport seams

- Failure mode: feature hooks had been migrated, but authentication and the
  app composition root still retained direct fetch and legacy client wrappers.
- Detection signal: source scans found `fetch('/api/...')`, `restClient`, and
  unused `platformClient`/`apiClientInstance` files despite green feature tests.
- Prevention rule: audit composition roots and auth/session code separately from
  feature consumers; enforce the public API boundary with source-level tests.

## 2026-08-08 — Keep shared tooling factories dependency-injected

- Failure mode: moving ESLint imports into a root-level shared config changed
  Node's package-resolution boundary and made app-local lint dependencies unavailable.
- Detection signal: `bun run lint` failed with `ERR_MODULE_NOT_FOUND` for
  `@eslint/js` from `configs/eslint`.
- Prevention rule: shared workspace config factories must receive toolchain
  dependencies from the consuming package, whose manifest owns those dependencies.
