# Quality Gates

The root quality sequence is documentation validation, i18n validation, architecture checks, typecheck, lint, unit/component tests, coverage, build, and security checks; applicable mocked and real E2E provide final journey evidence.

| Gate | Evidence |
| --- | --- |
| documentation | `bun run docs:check` resolves links and fences |
| architecture | public exports and dependency rules pass |
| code quality | typecheck, format/lint, focused and regression tests pass |
| integration | contracts, mocked E2E, and configured real E2E pass |
| delivery/operations | build, security, observability, rollback and smoke evidence are present |

No skipped test, unresolved architecture violation, secret exposure, or undocumented exception passes a release gate.
