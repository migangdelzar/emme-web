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
```

## Demo recordings

The `test:demo` command runs the tagged, deterministic mock journeys with
video, trace, and screenshot recording enabled. It requires no backend,
Keycloak instance, or credentials.

To archive the recordings in GitHub Actions, manually dispatch the
`Playwright demo recordings` workflow. It uploads the generated videos and
Playwright reports as a 14-day artifact named with the workflow run ID.
Artifacts are intentionally not committed to the repository.
