# Engineering Lessons

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
