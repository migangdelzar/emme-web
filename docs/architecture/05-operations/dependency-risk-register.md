# Dependency Risk Register

This register records dependency advisories that are intentionally scoped or
deferred. It is reviewed with every dependency update and before release.

| Advisory | Dependency | Decision | Compensating control | Review by |
|---|---|---|---|---|
| `GHSA-qwww-vcr4-c8h2` | `react-router` / `react-router-dom` 7.x | Temporarily allowlisted | The application uses client-side routing and does not enable React Server Components or server actions. The dependency remains monitored by Bun audit and dependency review. | 2026-08-30 |

The allowlist is narrow and encoded in the `security:check` script. It MUST be
removed when a compatible patched `react-router-dom` release is available, or
the application must migrate to the patched major version.
