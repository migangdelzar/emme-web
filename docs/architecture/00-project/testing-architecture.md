# Testing Architecture

Every change follows Red, Green, Refactor, Verify. Unit tests use deterministic protocol fakes; they never call real HTTP, storage, providers, or backend services.

| Layer | Focus |
| --- | --- |
| kernel/domain and application | invariants, typed errors, orchestration and port calls |
| validation/API/infrastructure | boundaries, contract mapping, retries, storage and provider behavior |
| presentation | observable states, accessibility, keyboard and focus behavior |
| package boundaries | public exports and forbidden dependency directions |
| integration/E2E | package composition and critical mocked/real-backend journeys |

Applicable test plans cover success, empty, boundary, validation/transport failure, offline/retry, duplicate action, permission denied, tenant mismatch, loading/error UI, and cleanup. Shared non-trivial fakes belong in `@emme/test-support`.
