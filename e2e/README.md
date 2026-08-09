# Browser E2E

The Playwright workspace contains deterministic mock-provider journeys and
optional real-backend journeys against the sibling `emme-service` repository.

Generated HAR recordings are intentionally not committed. The historical
recordings contained bearer tokens and machine-specific absolute paths. Use the
in-memory `MockProvider` for deterministic tests, or regenerate a sanitized
fixture that contains no credentials before proposing a new recording.

```bash
bun run --filter @emme/e2e test
bun run --filter @emme/e2e test:real
bun run --filter @emme/e2e test:demo

# Recordings (mock + real) — videos, traces, screenshots retained
bun run --filter @emme/e2e test:demo:mock
bun run --filter @emme/e2e test:demo:real

# Full suite recordings (all specs, single worker)
bun run --filter @emme/e2e test:record:mock
bun run --filter @emme/e2e test:record:real
```

## Demo recordings

The `test:demo` command runs the tagged, deterministic mock journeys with
video, trace, and screenshot recording enabled. It requires no backend,
Keycloak instance, or credentials.

To archive the recordings in GitHub Actions, manually dispatch the
`Playwright demo recordings` workflow. It uploads the generated videos and
Playwright reports as a 14-day artifact named with the workflow run ID.
Artifacts are intentionally not committed to the repository.

## Real full-stack recordings

The `test:real:recordings` command is intentionally separate from the mock demo
command. It requires the runtime URLs and a provisioner-generated per-salon
auth JSON file. Credentials are only an emergency bootstrap fallback:

| Variable                | Meaning                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `E2E_MODE=real`         | Selects the real provider and never falls back to mocks.         |
| `RECORD_DEMO=true`      | Retains videos, traces, screenshots, and the HTML report.        |
| `E2E_BASE_URL`          | Web origin used by Playwright, normally `http://127.0.0.1:3000`. |
| `E2E_API_URL`           | Reachable `emme-service` origin for provider setup/cleanup.      |
| `E2E_TENANT_SLUG` | Salon selected from the per-salon auth JSON file. | `e2e-studio` |
| `E2E_USER_ROLE` | Role selected from the salon auth JSON file. | `owner` |
| `E2E_PROVISIONER_AUTH_DIR` | Directory containing one provisioner-generated auth JSON file per salon. | `.auth/provisioned-auth/` |
| `E2E_PROVISIONER_AUTH_FILE` | Optional explicit provisioner-generated auth JSON file override. | unset |
| `E2E_KEYCLOAK_USERNAME` / `E2E_KEYCLOAK_PASSWORD` | Emergency bootstrap fallback when no provisioned storage state exists. | unset |

The web workflow checks out the exact service ref, builds its immutable JVM
image, starts the service-owned Compose stack, runs migrations, and invokes the
service repository's typed `:tools:e2e-provisioner` for the disposable
Keycloak/tenant-owner baseline. Dispatch
`.github/workflows/real-e2e-recordings.yml` with the current service and web
refs plus GitHub Actions secrets. The service-owned fixture contract is
documented in `emme-service/docs/templates/e2e-fixture-contract-template.md`.
Only this real workflow archives full-stack videos; mock recordings remain
local/demo evidence.

Real cleanup is marker-based and dependency-aware: appointments are cancelled
before customers and services are retired. Cleanup failures fail the test so a
partially cleaned environment cannot be mistaken for successful evidence.
