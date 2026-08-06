# E2E Testing Flows — Complete Reference

## Architecture

```
testWithUser.ts (fixtures)
  ├── MockProvider (in-memory, page.route intercepts)
  │     → localStorage token injection
  │     → no backend required
  │     → ~250ms setup per test
  │
  └── RealProvider (real HTTP, fetch-based)
        → OAuth2 Keycloak browser flow
        → POST/GET/DELETE to real backend
        → ~5.8s setup per test

Page Objects (7 total)
  LoginPage, DashboardPage, AppointmentsPage, ClientsPage,
  ServicesPage, FinancesPage, SettingsPage
```

## MockProvider Flow

```
1. acquireUser() from pool (10 users)
2. new MockProvider()
3. setup(page, user):
   a. Clear in-memory DB
   b. Register 8 page.route() handlers (Promise.all)
      - /api/me → user profile or 401
      - Dashboard SSE → mock stream
      - API_REQUEST (catch-all) → entity CRUD dispatch
      - Appointment cancel, Service retire, Keycloak OIDC, Health
   c. page.addInitScript() inject tokens:
      - sessionStorage: 'oidc.user' (simulates authenticated session)
      - localStorage: 'access_token', 'emmenails_profile', 'emme-ui-state'
4. seed(DEFAULT_SEED):
   - In-memory insert: 3 services + 3 customers
6. await use(provider) — test runs
7. teardown():
   - Clear all database tables
8. releaseUser()
```

### Mock Login Flow (simulated)

```
App loads → oidc-client reads sessionStorage
  → sees valid token → skips Keycloak redirect
  → /api/me returns mocked profile
  → Dashboard renders with seeded data
```

## RealProvider Flow

```
1. acquireUser() from pool
2. realLogin(page, user):
   a. Validate env vars: E2E_BASE_URL, E2E_KEYCLOAK_USERNAME, E2E_KEYCLOAK_PASSWORD
   b. page.addInitScript(): set isFirstTime=false (skip onboarding)
   c. page.goto(baseUrl)
   d. LoginPage.login(username, password):
      - Click landing "Enter" button → login form
      - Fill email input (username)
      - Fill password input
      - Click submit button
   e. Wait for sidebar (testId) or complementary role (5s, fallback)
   f. page.waitForLoadState('networkidle')
   g. Extract token: page.evaluate(localStorage.getItem('access_token'))
      → 5 retries at 500ms intervals
   h. provider.setToken(token)
   i. provider.setup(page, user) → derive tenantSlug
   j. page.waitForLoadState('networkidle')
3. seed(DEFAULT_SEED):
   a. POST /api/customers (3 sequential, map IDs)
   b. POST /api/services (3 sequential, map IDs)
   c. POST /api/appointments (0 by default)
   d. Track created IDs for teardown
4. page.waitForTimeout(1000) + networkidle
5. await use(provider) — test runs
6. teardown():
   a. Cancel appointments: POST /*/cancel
   b. Retire customers: POST /*/retire
   c. Retire services: POST /*/retire
   d. AggregateError if any cleanup fails
7. releaseUser()
```

### Real Login Flow (OAuth2)

```
LoginPage.login()
  └── POST /api/auth/login {email, password}
        → Keycloak realm (emme-e2e-studio)
        → token stored in localStorage
        → app detects token → renders dashboard
```

### HTTP Headers (RealProvider)

```
Every request:
  Accept: application/json
  API-Version: 1.0
  Authorization: Bearer <token>
  X-Emme-Tenant-Slug: e2e-studio     ← tenant routing
  Content-Type: application/json      ← only when body present
```

## Test Categories

### 1. Auth (4 tests) — `specs/auth/login.spec.ts`
**Fixture:** `unauthenticatedPage` (MockProvider, no user)
**Tags:** `@auth @regression`

| # | Test | Selector |
|---|---|---|
| 1 | Landing page shows CTAs | `landingEnterBtn()`, `landingRegisterBtn()` |
| 2 | Login form renders | `emailInput()`, `passwordInput()`, `submitBtn()` |
| 3 | Register form renders | Register inputs + `backBtn()` |
| 4 | Back button returns to landing | Back → landing visible |

### 2. Dashboard (4 tests) — `specs/dashboard/dashboard.spec.ts`
**Fixture:** `authenticatedPage` + DEFAULT_SEED
**Tags:** `@dashboard @regression`
**beforeEach:** `dashboard.goto()` + wait for greeting

| # | Test | Selector |
|---|---|---|
| 5 | Greeting with user name | `greeting()` — contains morning/afternoon/evening |
| 6 | KPI stat cards | `incomeCard()`, `confirmedCard()`, `occupancyCard()`, `newClientsCard()` |
| 7 | Monthly goal card | `goalCard()`, `goalLabel()` |
| 8 | Agenda empty state | `emptyAgenda()` |

### 3. Appointments (4 tests) — `specs/appointments/appointments.spec.ts`
**Fixture:** `authenticatedPage` + seed 3 appointments + 3 customers + 2 services
**Tags:** `@appointments @regression`

| # | Test | Selector |
|---|---|---|
| 9 | Page header renders | `header()` |
| 10 | Date strip navigation | `dateStrip()` |
| 11 | Projected income card | `todayAppointmentsSummary()` |
| 12 | New appointment form opens | `gotoNewAppointment()` → `stepIndicator()` |

### 4. Customers/Clients (5 tests) — 2 files
**Fixture:** `authenticatedPage` + seed 3 customers
**Tags:** `@clients @regression @critical`

| # | File | Test | Selector |
|---|---|---|---|
| 13 | customers.spec.ts | Heading renders | `header()` |
| 14 | customers.spec.ts | List renders items | `clientRow(name)` |
| 15 | customers.spec.ts | Add via URL param | `dialog()` |
| 16 | customers.spec.ts | Empty search | `searchInput().fill("zzz")` → `emptyState()` |
| 17 | mock-lifecycle.spec.ts | Full UI create | `createCustomer(name, phone)` → verify visible |

### 5. Services (9 tests) — 2 files
**Fixture:** `authenticatedPage` + seed 3 services
**Tags:** `@services @regression @critical`

| # | File | Test | Selector |
|---|---|---|---|
| 18 | services.spec.ts | Heading with active count | Service cards visible |
| 19 | services.spec.ts | Cards render name+price | Search → card visible |
| 20 | services.spec.ts | Search filters | Type "Rusa" → only Rusa |
| 21 | services.spec.ts | Category chip | Click chip → filtered |
| 22 | services.spec.ts | Click card → dialog | Dialog with details |
| 23 | services.spec.ts | Dialog close | Open→close→hidden |
| 24 | services.spec.ts | Add via URL | `?add=true` → dialog |
| 25 | services.spec.ts | Empty search | "zzz" → message |
| 26 | mock-lifecycle.spec.ts | Full UI CRUD | Create→verify→edit→verify updated |

### 6. Finances (1 test) — `specs/finances/finances.spec.ts`
**Fixture:** `authenticatedPage` (no additional seed)
**Tags:** `@finances @regression`

| # | Test |
|---|---|
| 27 | Header renders |

### 7. Settings (1 test) — `specs/settings/settings.spec.ts`
**Fixture:** `authenticatedPage`
**Tags:** `@settings @regression`

| # | Test |
|---|---|
| 28 | Header renders |

### 8. Cross-Cutting (9 tests) — 5 files

| # | File | Test | Tags |
|---|---|---|---|
| 29 | navigation.spec.ts | Navigate all 6 sections | `@navigation @regression @smoke` |
| 30 | navigation.spec.ts | Rapid navigation | `@navigation @regression` |
| 31 | accessibility.spec.ts | Semantic shell (auth) | `@smoke @critical` |
| 32 | accessibility.spec.ts | Accessible login (unauth) | `@smoke @critical` |
| 33 | error-flows.spec.ts | Protected routes redirect | `@auth @regression @error-state` |
| 34 | mock-provider-isolation.spec.ts | Seed isolation | (unit test) |
| 35 | real-smoke.spec.ts | Landing + health check | `@smoke @critical` |

### 9. Real-Only (17 tests) — 8 files
**Skip in mock mode:** `test.skip(process.env.E2E_MODE !== 'real', ...)`

| # | File | Tests | Tags |
|---|---|---|---|
| 36-37 | session.spec.ts | Dashboard + tenant shell | `@auth @critical @happy-path` |
| 38-40 | oauth-flow.spec.ts | Login + redirect + dashboard | `@auth @critical @happy-path` |
| 41-44 | tenant-owner-lifecycle.spec.ts | Dashboard+CRUD+clients+finance | `@real @critical` |
| 45-53 | data-persistence.spec.ts | All 6 pages + KPI + create forms | `@critical @happy-path` |
| 54-55 | tenant-isolation.spec.ts | Branding + API seed | `@dashboard @critical @happy-path` |
| 56-58 | real-provider.contract.spec.ts | Seed+setup+cleanup | (unit) |
| 59 | e2e-data-factory.contract.spec.ts | Factory produces records | (unit) |
| 60-63 | recording-contract.spec.ts + workflow | Recording contracts | (unit) |

### 10. Demo Recordings (10 tests) — `specs/demo/demo-recordings.spec.ts`
**Serial mode** (`test.describe.configure({ mode: 'serial' })`)
**All tags:** `@demo @critical`
**Uses:** `waitForTimeout()` for visual pacing, video/screenshot/trace enabled

## Performance

| Phase | Mock | Real |
|---|---|---|
| Login | 0ms (injected) | 3.3s (OAuth2) |
| Seed | <1ms | ~1.5s |
| Setup | ~50ms | ~5.8s |
| Teardown | <1ms | ~1.5s |
| **Per test** | **~250ms** | **~7.3s** |

## Key Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `E2E_MODE` | `mock` or `real` | `mock` |
| `E2E_API_URL` | Backend URL | `http://localhost:8081` |
| `E2E_BASE_URL` | Frontend URL | `http://localhost:3000` |
| `E2E_TENANT_SLUG` | Tenant to test against | `e2e-studio` |
| `E2E_KEYCLOAK_USERNAME` | Keycloak login username | (required) |
| `E2E_KEYCLOAK_PASSWORD` | Keycloak login password | (required) |
| `E2E_EXTERNAL_WEB` | Use pre-built frontend | `false` |
| `RECORD_DEMO` | Enable video/trace | `false` |
