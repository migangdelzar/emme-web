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
bun run --filter @emme/e2e test:real:recordings
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
command. It requires all of the following environment variables:

| Variable | Meaning |
|---|---|
| `E2E_MODE=real` | Selects the real provider and never falls back to mocks. |
| `RECORD_DEMO=true` | Retains videos, traces, screenshots, and the HTML report. |
| `E2E_BASE_URL` | Web origin used by Playwright, normally `http://127.0.0.1:3000`. |
| `E2E_API_URL` | Reachable `emme-service` origin for provider setup/cleanup. |
| `E2E_KEYCLOAK_USERNAME` | Synthetic tenant-owner credential supplied out of band. |
| `E2E_KEYCLOAK_PASSWORD` | Synthetic tenant-owner credential supplied out of band. |

The service must already contain a deterministic tenant-owner identity and be
reachable from the runner. The web workflow checks out the exact service ref
for traceability, but does not pretend that the current service Compose files
provision Keycloak and tenant data automatically. Dispatch
`.github/workflows/real-e2e-recordings.yml` with the deployed service URL and
GitHub Actions secrets. Only this real workflow archives full-stack videos;
mock recordings remain local/demo evidence.

Real cleanup is marker-based and dependency-aware: appointments are cancelled
before customers and services are retired. Cleanup failures fail the test so a
partially cleaned environment cannot be mistaken for successful evidence.
