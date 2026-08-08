# React Boundary

React belongs in app shells and feature presentation. Feature domain/application layers, kernel, API contracts, and infrastructure protocols remain React-free. Presentation hooks call public feature APIs and return observable view state; components remain accessible renderers of that state.

Use composition over boolean-heavy shared components, maintain effect cleanup for request/session/tenant changes, and keep browser APIs behind adapters. Component tests assert user behavior, not React implementation details.
