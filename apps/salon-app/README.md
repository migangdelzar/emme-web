# Emme Salon App

Production PWA for EmmeNails salon management.

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 + vite-plugin-pwa |
| UI | shadcn/ui + Tailwind 4 |
| State | Zustand + TanStack Query |
| Auth | Firebase Auth (Google OAuth) |
| APIs | Google Calendar, Google Sheets |
| i18n | `@emme/i18n` (ES-MX + EN-US) |
| PWA | Service Worker + installable |

## Quick Start

```bash
# Install (from monorepo root)
pnpm install

# Fast HMR development loop (from the repository root)
mise run dev

# Production build
bun run --filter salon-app build

# Preview production build
bun run --filter salon-app preview
```

## Environment

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_BASE_URL=http://localhost:3000
API_PROXY_TARGET=http://localhost:8081
VITE_OIDC_ISSUER=http://localhost:8081/realms/emme
VITE_OIDC_CLIENT_ID=emme-salon-app
VITE_WEB_BASE_DOMAIN=localhost
```

`VITE_API_BASE_URL` is the browser-visible web origin. Vite proxies API
requests to `API_PROXY_TARGET` during local development. In the production
container, set `EMME_API_UPSTREAM` to the backend's internal DNS name and port,
for example `emme-service:8081`; it is substituted into Nginx when the
container starts.

## Docker

```bash
docker build -f deploy/docker/frontend.Dockerfile \
  --build-arg APP_NAME=salon-app \
  -t emme/salon-frontend:local .
```

Run all three frontend containers together with:

```bash
mise run frontend:up

Stop them with:

```bash
mise run frontend:down
```
```

The Compose services map `host.docker.internal:8081` to the host backend. When
the frontend containers and backend share a Compose network, override
`EMME_API_UPSTREAM` with the backend service name instead.

## PWA

The app is installable as a PWA on desktop and mobile:
- Open in Chrome/Safari → "Install" or "Add to Home Screen"
- Works offline via service worker caching
- Push notifications supported

## Features

- Dashboard with KPIs (revenue, occupancy, new clients)
- Appointment scheduling (list/day/week/month views)
- Client CRM with search and VIP tracking
- Service catalog management
- Financial reporting
- Google Calendar sync
- Google Sheets export
- Dark mode
- Spanish/English i18n
