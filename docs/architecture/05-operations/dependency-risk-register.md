# Dependency Risk Register

This register records dependency advisories that are intentionally scoped or
deferred. It is reviewed with every dependency update and before release.

| Advisory | Dependency | Decision | Compensating control | Review by |
|---|---|---|---|---|
| `GHSA-qwww-vcr4-c8h2` | `react-router` / `react-router-dom` 7.x | Temporarily allowlisted | The application uses client-side routing and does not enable React Server Components or server actions. The dependency remains monitored by Bun audit and dependency review. | 2026-08-30 |
| `GHSA-mh99-v99m-4gvg` | `brace-expansion` 1.x/2.x transitive build tooling | Temporarily allowlisted | The vulnerable branches are pulled by ESLint-era `minimatch` dependencies and are not bundled into the application runtime. The global override previously attempted broke ESLint 9; the advisory remains visible in Bun audit and must be re-evaluated with the next compatible ESLint/a11y toolchain. | 2026-08-30 |

The allowlist is narrow and encoded in the `security:check` script. Each entry
MUST be removed when a compatible patched release is available, or the affected
toolchain must be migrated. These exceptions do not authorize adding the
affected packages to production runtime dependencies.
