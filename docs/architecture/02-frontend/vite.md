# Vite and Build Boundary

Vite configuration is shared through `configs/vite` where stable, with app-local entries only for application identity and public runtime needs. It builds each app from its public package exports; aliases must not bypass a package boundary or point from packages into apps.

Build configuration exposes no private values. CI runs the production build, and tests verify app startup with valid configuration plus safe failure for malformed configuration.
