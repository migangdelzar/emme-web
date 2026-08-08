# Frontend Testing

Presentation tests use semantic queries and protocol fakes at the feature/API boundary. They cover loading, empty, validation, conflict, forbidden, unavailable, success, focus, keyboard, and accessible-name behavior. Integration tests compose real packages with fake transport; root `e2e` covers critical mocked and configured real-backend journeys.

Tests control time, randomness, and network results. Flakes require an owner and expiry; E2E does not replace focused unit, component, contract, or boundary tests.
