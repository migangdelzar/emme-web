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
```
