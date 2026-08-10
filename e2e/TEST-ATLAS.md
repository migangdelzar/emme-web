<task id="ses_026b15ac8ffe3R36zTFm6aBJPv" state="completed">
<task_result>
Now I have everything needed. Here is the comprehensive document:

---

# E2E Test Suite — Complete Test Atlas

**Total tests: 74** | **Files: 24** | **Generated: 2026-08-06**

---

## Infrastructure Summary

| Property | Mock Mode | Real Mode |
|---|---|---|
| `fullyParallel` | `true` | `false` |
| `workers` | undefined (CPU/2) | `1` (serial) |
| `timeout` | 30s per test | 120s per test |
| `expect.timeout` | 8s | 40s |
| `storageState` | Not used | Not used |
| `retries` | 0 (local) / 1 (CI) | 2 (local) / 2 (CI) |
| Login per test | MockProvider (instant) | `realLogin()` via Keycloak (3-8s) |
| Provider scope | `test` (fresh each) | `test` (fresh each) |
| User pool | 10 users, acquire/release per test | 10 users, acquire/release per test |
| Default seed | 3 services + 3 customers | 3 services + 3 customers |

**No `storageState` (login sharing) is used.** Every `authenticatedPage` test gets a fresh login. In mock mode this is instant (localStorage injection). In real mode this performs a full OAuth2 BFF flow through Keycloak (~3-8 seconds per test).

**Parallelism rules:**
- Mock mode: all tests can run in parallel (`fullyParallel: true`)
- Real mode: all tests run serially (`fullyParallel: false`, `workers: 1`)
- Explicit `serial` mode: `demo-recordings` (10 tests), `tenant-owner-lifecycle` (4 tests)

---

## Test #1–4: Auth / Login (`specs/auth/login.spec.ts`)

**Tags:** `@auth`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 1 | `landing page shows CTAs` | `unauthenticatedPage` | None | No | Yes |
| 2 | `login form renders correctly` | `unauthenticatedPage` | None | `goToLoginForm()` (click) | Yes |
| 3 | `register form renders correctly` | `unauthenticatedPage` | None | `goToRegisterForm()` (click) | Yes |
| 4 | `back button returns to landing` | `unauthenticatedPage` | None | 1 click (`backBtn`) | Yes |

**Test 1 — `landing page shows CTAs`**
- **Setup:** `LoginPage.goto()` (navigate to `/`)
- **Steps:** 3 assertions: `landingBtn`, `landingRegisterBtn`, `poweredBy`
- **Teardown:** MockProvider.teardown() (in fixture)
- **Fresh login required:** No (unauthenticated)
- **Parallel safe:** Yes
- **Estimated duration:** ~1s (mock), ~3s (real)

**Test 2 — `login form renders correctly`**
- **Setup:** `LoginPage.goto()`, then `login.goToLoginForm()`
- **Steps:** 3 assertions: `emailInput`, `passwordInput`, `submitBtn`
- **UI interactions:** Clicks the "Ingresar" button on landing page
- **Teardown:** fixture-level
- **Fresh login required:** No
- **Parallel safe:** Yes
- **Estimated duration:** ~1s (mock), ~3s (real)

**Test 3 — `register form renders correctly`**
- **Setup:** `LoginPage.goto()`, then `login.goToRegisterForm()`
- **Steps:** 4 assertions: `emailInput`, `passwordInput`, `registerSubmitBtn`, `backBtn`
- **UI interactions:** Clicks the register button on landing page
- **Teardown:** fixture-level
- **Fresh login required:** No
- **Parallel safe:** Yes
- **Estimated duration:** ~1s (mock), ~3s (real)

**Test 4 — `back button returns to landing`**
- **Setup:** `LoginPage.goto()`, `goToRegisterForm()`
- **Steps:** Click `backBtn`, assert `landingBtn` visible
- **UI interactions:** 2 clicks (goToRegisterForm, backBtn)
- **Teardown:** fixture-level
- **Fresh login required:** No
- **Parallel safe:** Yes
- **Estimated duration:** ~1s (mock), ~3s (real)

### Auth Tests — Merge Candidates
Tests 1-4 could **all be merged into a single test** ("unauthenticated landing page renders and navigates correctly"). They all use `unauthenticatedPage`, visit the same page, and check related UI elements. Merged they'd be 4 clicks + ~10 assertions with no data dependencies.

---

## Test #5–8: Dashboard (`specs/dashboard/dashboard.spec.ts`)

**Tags:** `@dashboard`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 5 | `shows greeting with user name` | `authenticatedPage`, `provider` | None (DEFAULT_SEED in fixture) | No | Yes |
| 6 | `shows KPI stat cards` | `authenticatedPage`, `provider` | None | No | Yes |
| 7 | `shows monthly goal card` | `authenticatedPage`, `provider` | None | No | Yes |
| 8 | `agenda section shows empty state` | `authenticatedPage`, `provider` | None | No | Yes |

**beforeEach (all dashboard tests):**
- `DashboardPage.goto()` (navigate to `/#/dashboard`)
- Assert `dashboard.greeting()` visible (10s timeout)

**Test 5 — `shows greeting with user name`**
- **Steps:** Assert greeting contains morning/afternoon/evening regex
- **Fresh login required:** Yes (authenticatedPage) — but fixture already did login
- **Login reuse:** Could reuse authenticatedPage login — no data mutations
- **Parallel safe:** Yes (mock mode)
- **Estimated duration:** ~2s (mock), ~15s (real, includes Keycloak login)

**Test 6 — `shows KPI stat cards`**
- **Steps:** Assert 4 cards visible: income, confirmed, occupancy, newClients
- **Read-only:** Yes
- **Parallel safe:** Yes (mock)
- **Estimated duration:** ~2s (mock), ~15s (real)

**Test 7 — `shows monthly goal card`**
- **Steps:** Assert goalCard and goalLabel visible
- **Read-only:** Yes
- **Parallel safe:** Yes
- **Estimated duration:** ~2s (mock), ~15s (real)

**Test 8 — `agenda section shows empty state`**
- **Steps:** Assert `emptyAgenda()` visible
- **Read-only:** Yes
- **Parallel safe:** Yes
- **Estimated duration:** ~2s (mock), ~15s (real)

### Dashboard Tests — Merge Candidates
Tests 5-8 are **excellent merge candidates**. All 4 tests share the same beforeEach, visit the same page, and perform read-only assertions. A merged test would be: navigate → assert greeting → assert 4 KPI cards → assert goal card → assert empty agenda. That's ~8 assertions in one test, zero data dependencies, pure read-only.

### Dashboard Tests — Login Sharing Candidates
Since these tests never mutate data, they could all share a single login via `storageState` or a `beforeAll` login + per-test page reuse (like `{ storageState: '...' }`).

---

## Test #9–12: Appointments (`specs/appointments/appointments.spec.ts`)

**Tags:** `@appointments`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 9 | `page header renders` | `authenticatedPage`, `provider` | 3 appointments + 3 customers + 2 services | No | Yes |
| 10 | `date strip navigation visible` | `authenticatedPage`, `provider` | Same | No | Yes |
| 11 | `projected income card shows` | `authenticatedPage`, `provider` | Same | No | Yes |
| 12 | `new appointment form opens via add=true` | `authenticatedPage`, `provider` | Same | `gotoNewAppointment()` (navigate) | Yes |

**beforeEach (all appointments tests):**
- `provider.seed({ appointments: mockApps, customers: mockCustomers, services: mockServices })` — **custom seed beyond DEFAULT**
- `AppointmentsPage.goto()` (navigate to `/#/agenda`)
- Assert `appointments.header()` visible

**Custom seed data:**
- 3 appointments (`apt-1`, `apt-2`, `apt-3`) with confirmed status, today's date
- 3 linked customers (`Elena Garcia`, `Valeria Arriaza`, `Maria Lopez`)
- 2 services (`Manicure Rusa`, `Soft Gel Premium`)

**Test 9 — `page header renders`** (`@smoke`)
- **Steps:** Assert `.header()` visible (already verified in beforeEach — redundant)
- **Read-only:** Yes
- **Parallel safe:** Yes (mock)
- **Estimated duration:** ~2s (mock), ~20s (real with seed API calls)

**Test 10 — `date strip navigation visible`**
- **Steps:** Assert `dateStrip()` visible
- **Read-only:** Yes

**Test 11 — `projected income card shows`**
- **Steps:** Assert `todayAppointmentsSummary()` visible
- **Read-only:** Yes

**Test 12 — `new appointment form opens via add=true`** (`@happy-path`)
- **Steps:** `gotoNewAppointment()`, assert `stepIndicator()` visible
- **UI interactions:** Navigation via URL param
- **Read-only:** Yes (opens form, doesn't submit)

### Appointments Tests — Merge Candidates
Tests 9-11 are good merge candidates (same page, same seed, read-only). Test 12 navigates away (to `?add=true`) so could remain separate or be the last step in a merged test.

### Appointments Tests — Login Sharing
Could share login for tests 9-11 since they are read-only and don't mutate. Test 12 also read-only but navigates to a different view.

---

## Test #13–16: Customers (`specs/customers/customers.spec.ts`)

**Tags:** `@clients`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 13 | `customers heading renders` | `authenticatedPage`, `provider` | 3 customers (custom mockCustomers) | No | Yes |
| 14 | `customer list renders items` | `authenticatedPage`, `provider` | Same | No | Yes |
| 15 | `add client via URL param opens dialog` | `authenticatedPage`, `provider` | Same | `goto('/#/clients?add=true')` | Yes |
| 16 | `empty search shows no client results` | `authenticatedPage`, `provider` | Same | `searchInput().fill('zzz-...')` | Yes |

**beforeEach:**
- `provider.seed({ customers: mockCustomers })` — **custom seed** (3 customers: Valeria Arriaza, Elena Garcia, Maria Jose)
- `ClientsPage.goto()`
- Assert `header()` visible

**Test 13 — `customers heading renders`** (`@smoke`)
- **Steps:** Assert `header()` visible (redundant with beforeEach)
- **Read-only:** Yes

**Test 14 — `customer list renders items`**
- **Steps:** Assert 3 client rows visible by name
- **Read-only:** Yes

**Test 15 — `add client via URL param opens dialog`**
- **Steps:** Navigate to `/#/clients?add=true`, assert `dialog()` visible
- **UI interactions:** URL-based navigation (no click)
- **Read-only:** Yes (opens dialog, doesn't submit)

**Test 16 — `empty search shows no client results`** (`@empty-state`)
- **Steps:** `goto()`, assert header, fill search with `zzz-non-existent`, assert `emptyState()` visible
- **UI interactions:** Fill search input
- **Read-only:** Yes (no data created)

### Customers Tests — Merge Candidates
Tests 13-14 are merge-ready (same page, same assertions). Test 15 is a different URL/flow. Test 16 uses the same page but adds UI interaction (fill). Tests 13-14-16 could merge: navigate → assert list → fill search → assert empty state → clear → assert list returns.

---

## Test #17: Customers Mock Lifecycle (`specs/customers/mock-lifecycle.spec.ts`)

**Tags:** `@clients`, `@critical`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 17 | `creates a customer through the visible UI` | `authenticatedPage` | None (uses DEFAULT_SEED from fixture) | `createCustomer()` → dialog open, fill name+phone, submit | **No** — writes |

- **Setup:** None (no `provider.seed()` in this file — uses DEFAULT_SEED from fixture)
- **Steps:** `createCustomer('E2E Customer', '555-0199')` → opens dialog, fills form, submits. Assert `clientRow('E2E Customer')` visible.
- **Teardown:** Provider teardown (fixture) cleans up seeded data
- **Fresh login required:** Yes
- **Login reuse:** Cannot share — this test creates data
- **Parallel safe:** Yes (mock mode), but should not conflict with other customer tests that also seed
- **Estimated duration:** ~3s (mock)

---

## Test #18–25: Services (`specs/services/services.spec.ts`)

**Tags:** `@services`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 18 | `catalog heading renders with active count` | `authenticatedPage`, `provider` | 3 services (custom mockServices) | No | Yes |
| 19 | `service cards render with name and price` | `authenticatedPage`, `provider` | Same | `searchInput().fill()` + clear | Yes |
| 20 | `search filters services by name` | `authenticatedPage`, `provider` | Same | `searchInput().fill('Rusa')` | Yes |
| 21 | `category chip filters services` | `authenticatedPage`, `provider` | Same | Click extension chip | Yes |
| 22 | `click card opens detail dialog` | `authenticatedPage`, `provider` | Same | Click card | Yes |
| 23 | `detail dialog close button works` | `authenticatedPage`, `provider` | Same | Click card then close button | Yes |
| 24 | `add service dialog opens via url param` | `authenticatedPage`, `provider` | Same | Navigate to `?add=true` | Yes |
| 25 | `empty search shows no-results message` | `authenticatedPage`, `provider` | Same | `searchInput().fill('zzz-...')` | Yes |

**beforeEach:**
- `provider.seed({ services: mockServices })` — **custom seed** (Manicure Clasica, Manicure Rusa, Soft Gel Premium)
- `ServicesPage.goto()`
- Assert `header()` visible

**Test 18 — `catalog heading renders with active count`**
- **Steps:** Assert `activeCountBadge()` visible
- **Read-only:** Yes

**Test 19 — `service cards render with name and price`** (`@smoke`)
- **Steps:** Fill search with 'Manicure Clasica', wait 500ms, assert card visible, clear search, wait 500ms
- **UI interactions:** Fill + clear search input
- **Read-only:** Yes

**Test 20 — `search filters services by name`**
- **Steps:** Fill search 'Rusa', assert Manicure Rusa visible, Manicure Clasica NOT visible
- **UI interactions:** Fill search input
- **Read-only:** Yes

**Test 21 — `category chip filters services`**
- **Steps:** Assert 'Extensiones' chip visible, click it, assert Soft Gel Premium visible, Manicure Clasica NOT visible
- **UI interactions:** 1 click
- **Read-only:** Yes

**Test 22 — `click card opens detail dialog`**
- **Steps:** Click 'Manicure Rusa' card, assert dialog, name, duration, price visible
- **UI interactions:** 1 click
- **Read-only:** Yes (opens detail, no edit)

**Test 23 — `detail dialog close button works`**
- **Steps:** Click 'Manicure Rusa' card, assert dialog, click close, assert dialog gone
- **UI interactions:** 2 clicks
- **Read-only:** Yes

**Test 24 — `add service dialog opens via url param`**
- **Steps:** Navigate to `/#/services?add=true`, assert dialog, nameInput, priceInput, submitBtn
- **UI interactions:** Navigation (URL-based)
- **Read-only:** Yes (opens form, doesn't submit)

**Test 25 — `empty search shows no-results message`**
- **Steps:** Fill search with 'zzz-non-existent', assert `emptySearchMsg()` visible
- **UI interactions:** Fill input
- **Read-only:** Yes

### Services Tests — Merge Candidates
**Excellent merge candidates** — all 8 tests visit the same page with the same seed data and perform read-only operations. A logical merge set:
- Tests 18-19-20-25: List rendering + search + empty state → ~6 assertions, 2 fills
- Tests 21: Category filtering → exists in merged flow
- Tests 22-23: Detail dialog open/close → 2 clicks + assertions
- Test 24: Add dialog open → separate URL navigation

Could merge into 3 tests: "Catalog CRUD view", "Detail dialog interactions", "Create dialog opens".

### Services Tests — Login Sharing
All 8 tests are read-only (no data mutations from the UI). Perfect candidates for login sharing via `storageState`.

---

## Test #26: Services Mock Lifecycle (`specs/services/mock-lifecycle.spec.ts`)

**Tags:** `@services`, `@critical`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 26 | `creates and updates a service through the visible UI` | `authenticatedPage` | None | Fill name/price/duration, submit click, editService, fill again, submit | **No** — writes |

- **Setup:** No custom seed — navigates to `/#/services?add=true`
- **Steps:** (1) Assert dialog visible, (2) fill 'E2E Service' / '650' / '60', (3) submit, (4) assert new service visible, (5) `editService('E2E Service')`, (6) fill 'E2E Updated Service', (7) submit, (8) assert updated name visible
- **Teardown:** Fixture provider.teardown()
- **Fresh login required:** Yes
- **Login reuse:** No — data mutation
- **Parallel safe:** Mock mode yes, but should not conflict with services.spec.ts (which seeds services)
- **Estimated duration:** ~4s (mock), ~30s (real)

---

## Test #27: Finances (`specs/finances/finances.spec.ts`)

**Tags:** `@finances`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 27 | `finances header renders` | `authenticatedPage` | None | No | Yes |

- **beforeEach:** `FinancesPage.goto()`, assert header (10s timeout)
- **Steps:** Assert header visible (redundant with beforeEach)
- **Read-only:** Yes
- **Login reuse:** Yes — no mutations
- **Parallel safe:** Yes
- **Estimated duration:** ~2s (mock), ~15s (real)

---

## Test #28: Settings (`specs/settings/settings.spec.ts`)

**Tags:** `@settings`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 28 | `settings header renders` | `authenticatedPage` | None | No | Yes |

- **beforeEach:** `SettingsPage.goto()`, assert header
- **Steps:** Assert header visible (redundant with beforeEach)
- **Read-only:** Yes
- **Login reuse:** Yes
- **Parallel safe:** Yes
- **Estimated duration:** ~2s (mock), ~15s (real)

---

## Test #29–30: Navigation (`specs/cross-cutting/navigation.spec.ts`)

**Tags:** `@navigation`, `@regression`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 29 | `navigate all 6 sections without error` | `authenticatedPage` | None | 5 nav item clicks | Yes |
| 30 | `rapid navigation no white screen` | `authenticatedPage` | None | 4 rapid nav item clicks | Yes |

**beforeEach:**
- `DashboardPage.goto()`
- Assert `sidebar()` visible

**Test 29 — `navigate all 6 sections without error`** (`@smoke`)
- **Steps:** Click appointments, assert header. Click finances, assert header. Click clients, assert header. Click services, assert header. Click settings, assert header.
- **UI interactions:** 5 clicks
- **Read-only:** Yes (just navigation)
- **Estimated duration:** ~4s (mock), ~25s (real)

**Test 30 — `rapid navigation no white screen`**
- **Steps:** Rapidly click appointments → dashboard → clients → services, then assert services header
- **UI interactions:** 4 rapid clicks
- **Read-only:** Yes
- **Estimated duration:** ~2s (mock), ~15s (real)

### Navigation Tests — Merge Candidates
Tests 29 and 30 could merge into one "Navigation works correctly" test. Test 29 checks all sections; test 30 checks rapid navigation doesn't break. Combined: navigate all 6 sections, then rapid-navigate back to verify resilience.

---

## Test #31–32: Accessibility (`specs/cross-cutting/accessibility.spec.ts`)

**Tags:** `@smoke`, `@critical`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 31 | `protected routes render a semantic, keyboard-reachable shell` | `authenticatedPage` | None | Keyboard Tab presses + goto navigation | Yes |
| 32 | `unauthenticated users receive an accessible sign-in entry point` | `unauthenticatedPage` | None | Keyboard Tab press | Yes |

**Test 31 — `protected routes render a semantic, keyboard-reachable shell`**
- **Setup:** Listens for `pageerror` events
- **Steps:** For each of 6 routes: (1) `goto`, (2) assert `<main>` visible, (3) assert `<h1>` visible, (4) evaluate horizontal overflow check, (5) press Tab, (6) assert `:focus-visible` visible. Final: assert no page errors.
- **UI interactions:** 6 Tab presses, 6 navigations
- **Read-only:** Yes
- **Parallel safe:** Yes (mock)
- **Estimated duration:** ~5s (mock), ~30s (real with 6 page loads)

**Test 32 — `unauthenticated users receive an accessible sign-in entry point`**
- **Setup:** None
- **Steps:** Goto `/`, assert `auth-landing` testid visible, press Tab, assert focus-visible
- **UI interactions:** 1 Tab press
- **Fresh login required:** No (unauthenticated)
- **Parallel safe:** Yes
- **Estimated duration:** ~1s (mock)

---

## Test #33: Error Flows (`specs/cross-cutting/error-flows.spec.ts`)

**Tags:** `@auth`, `@regression`, `@error-state`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 33 | `all protected sections redirect to landing when unauthenticated` | `unauthenticatedPage` | None | 5 navigations (goto) | Yes |

- **Setup:** None
- **Steps:** For each of 5 protected routes, `goto`, assert landing button visible (5s timeout)
- **UI interactions:** 5 URL navigations
- **Fresh login required:** No (unauthenticated)
- **Parallel safe:** Yes
- **Estimated duration:** ~3s (mock), ~5s (real)

---

## Test #34: Mock Provider Isolation (`specs/cross-cutting/mock-provider-isolation.spec.ts`)

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 34 | `mock provider instances keep seeded records isolated` | Plain `test` + manual `MockProvider` | Custom seed via `first.seed()` | No (API-level test) | Yes (in-memory, no UI) |

- **Import:** `@playwright/test` (not testWithUser fixture)
- **Setup:** Creates 2 MockProvider instances manually
- **Steps:** Seed first with 1 customer, assert first has 1, second has 0. Manual teardown both.
- **Fresh login required:** No (no browser)
- **Parallel safe:** Yes (no browser dependency)
- **Estimated duration:** <1s

---

## Test #35–36: Real Smoke (`specs/cross-cutting/real-smoke.spec.ts`)

**Tags:** `@smoke`, `@dashboard`, `@critical`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 35 | `landing page loads` | Plain `page` | None | No | Yes |
| 36 | `backend health endpoint reachable` | Plain `page` | None | No (HTTP GET via page.request) | Yes |

**Test 35 — `landing page loads`**
- **Import:** `@playwright/test` (not testWithUser)
- **Steps:** Goto `/`, assert button with text /ingresar|Iniciar/ visible
- **Fresh login required:** No
- **Parallel safe:** Yes
- **Estimated duration:** ~2s

**Test 36 — `backend health endpoint reachable`**
- **Skip condition:** `E2E_MODE !== 'real'`
- **Steps:** HTTP GET to `${E2E_API_URL}/actuator/health`, assert 200, assert status 'UP'
- **Fresh login required:** No (no browser login)
- **Parallel safe:** Yes (mock skips, real is serial)
- **Estimated duration:** ~1s

---

## Test #37–38: Session Management — Real (`specs/real/session.spec.ts`)

**Tags:** `@auth`, `@critical`, `@happy-path`

**Skip condition:** `E2E_MODE !== 'real'`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 37 | `dashboard loads after OAuth2 login` | `authenticatedPage` | DEFAULT_SEED (fixture) | No | Yes |
| 38 | `authenticated owner sees the tenant-scoped application shell` | `authenticatedPage` | DEFAULT_SEED (fixture) | No | Yes |

**Test 37 — `dashboard loads after OAuth2 login`**
- **Setup:** Real login through fixture (`realLogin()`)
- **Steps:** Goto `/#/dashboard`, assert `sidebar-container` testId visible (15s timeout)
- **Read-only:** Yes
- **Estimated duration:** ~20s (includes full OAuth2 flow)

**Test 38 — `authenticated owner sees the tenant-scoped application shell`**
- **Setup:** Same real login
- **Steps:** Goto `/#/dashboard`, assert sidebar, assert `greeting-heading` testId
- **Read-only:** Yes
- **Estimated duration:** ~20s

### Session Tests — Merge Candidates
Tests 37 and 38 **should merge**. Test 38 is a superset of test 37 — both navigate to dashboard, test 38 just adds one more assertion. Merged: goto dashboard → assert sidebar (15s) → assert greeting.

### Session Tests — Login Sharing
Both tests do the same real login flow (~8s each). In real mode (serial, workers=1), they run sequentially anyway. With `storageState`, one login could serve both.

---

## Test #39–41: OAuth2 Flow — Real (`specs/real/oauth-flow.spec.ts`)

**Tags:** `@auth`, `@critical`, `@happy-path`

**Skip condition:** `E2E_MODE !== 'real'`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 39 | `landing page shows login button` | Plain `page` | None | No | Yes |
| 40 | `login redirects to Keycloak` | Plain `page` | None | 1 click (login button) | Yes |
| 41 | `dashboard loads after successful login` | `authenticatedPage` | DEFAULT_SEED | No | Yes |

**Test 39 — `landing page shows login button`**
- **Steps:** Goto `/`, assert button with /ingresar|Iniciar/ visible
- **Fresh login required:** No (plain page)
- **Estimated duration:** ~2s

**Test 40 — `login redirects to Keycloak`**
- **Steps:** Goto `/`, click login button, assert email/username placeholder visible (5s), assert login button visible
- **UI interactions:** 1 click
- **Fresh login required:** No (plain page, tests BFF login form appearance)
- **Estimated duration:** ~4s

**Test 41 — `dashboard loads after successful login`**
- **Steps:** (AuthenticatedPage already logged in). Goto `/#/dashboard`, assert sidebar visible
- **Read-only:** Yes
- **Estimated duration:** ~20s (includes realLogin in fixture)

### OAuth Flow — Merge Candidates
Test 39 and Test 35 (`landing page loads` from real-smoke) are **near-duplicates** — both assert the login button on the landing page. Tests 39-40 could merge: goto landing → assert login button → click login button → assert BFF form appears.

---

## Test #42–45: Real Tenant-Owner Lifecycle (`specs/real/tenant-owner-lifecycle.spec.ts`)

**Tags:** `@real`, `@critical`

**Mode:** `serial` (all 4 tests run sequentially in the same worker)
**Skip condition:** `E2E_MODE !== 'real'`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 42 | `owner reaches dashboard with tenant context` | `authenticatedPage` | DEFAULT_SEED (fixture) | No | Yes |
| 43 | `owner can read and update a tenant service` | `authenticatedPage`, `provider` | 1 service via factory (`source-service`) | `editService()`, fill name, submit click | **No** — updates |
| 44 | `owner can read customers and open appointment creation` | `authenticatedPage`, `provider` | 1 customer + 1 service via factory | `gotoNewAppointment()` (navigation) | Yes |
| 45 | `owner can open finance and business settings sections` | `authenticatedPage` | None beyond fixture | 2 navigations | Yes |

**Test 42 — `owner reaches dashboard with tenant context`**
- **Setup:** Real login (fixture)
- **Steps:** `DashboardPage.goto()`, assert sidebar, assert greeting
- **Read-only:** Yes
- **Estimated duration:** ~20s

**Test 43 — `owner can read and update a tenant service`**
- **Setup:** `createE2eDataFactory('service-{timestamp}')` → creates unique service. `provider.seed({ services: [factory.service()] })`. **Custom seed beyond DEFAULT.**
- **Steps:** Goto services, assert service name visible, `editService(name)`, fill `${name} Updated`, submit, assert updated name visible
- **UI interactions:** 1 click (editService), 1 fill, 1 submit click
- **Writes data:** Yes (updates service name in backend)
- **Estimated duration:** ~25s

**Test 44 — `owner can read customers and open appointment creation`**
- **Setup:** `createE2eDataFactory('appointment-{timestamp}')`. `provider.seed({ customers: [factory.customer()], services: [factory.service()] })`. **Custom seed.**
- **Steps:** Goto clients, assert customer row. Goto new appointment, assert dialog visible.
- **UI interactions:** Navigation
- **Read-only:** Yes (opens form, doesn't submit)
- **Estimated duration:** ~25s

**Test 45 — `owner can open finance and business settings sections`**
- **Setup:** None beyond fixture
- **Steps:** `FinancesPage.goto()`, assert header. `SettingsPage.goto()`, assert header.
- **Read-only:** Yes
- **Estimated duration:** ~22s

### Tenant Lifecycle — Serial Constraint
Must be serial because test 43 writes data (updates service). In serial mode, tests don't parallelize. However, each test gets its own provider/login (scope: 'test'), so they use different users each time. The serial mode here is for logical grouping, not data dependency — each test seeds its own data with unique timestamps.

---

## Test #46–54: Data Persistence — Real (`specs/real/data-persistence.spec.ts`)

**Tags:** `@dashboard`, `@services`, `@clients`, `@appointments`, `@critical`, `@happy-path`

**Skip condition:** `E2E_MODE !== 'real'`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 46 | `services page loads with real catalog data` | `authenticatedPage` | None | No | Yes |
| 47 | `clients page loads with real customer data` | `authenticatedPage` | None | No | Yes |
| 48 | `appointments page loads with real agenda` | `authenticatedPage` | None | No | Yes |
| 49 | `finances page loads with real data` | `authenticatedPage` | None | No | Yes |
| 50 | `settings page loads with real business config` | `authenticatedPage` | None | No | Yes |
| 51 | `dashboard KPI values are numeric (real data)` | `authenticatedPage` | None | No | Yes |
| 52 | `create client via add=true opens form` | `authenticatedPage` | None | URL navigation | Yes |
| 53 | `create appointment form accessible` | `authenticatedPage` | None | URL navigation | Yes |
| 54 | `seed client via API → appears in UI` | `authenticatedPage`, `provider` | 1 customer via `makeClient()` factory **Custom seed beyond DEFAULT** | No (API seed, UI verification) | **Writes via API** |

**Test 46 — `services page loads with real catalog data`**
- **Steps:** Goto `/#/services`, assert header (5s), assert `<main>` visible
- **Read-only:** Yes
- **Estimated duration:** ~18s

**Test 47 — `clients page loads with real customer data`**
- **Steps:** Goto `/#/clients`, assert header (5s)
- **Read-only:** Yes
- **Estimated duration:** ~18s

**Test 48 — `appointments page loads with real agenda`**
- **Steps:** Goto `/#/agenda`, assert header (5s)
- **Read-only:** Yes
- **Estimated duration:** ~18s

**Test 49 — `finances page loads with real data`**
- **Steps:** Goto `/#/finances`, assert header (5s), assert analytics/intelligence text
- **Read-only:** Yes
- **Estimated duration:** ~18s

**Test 50 — `settings page loads with real business config`**
- **Steps:** Goto `/#/settings`, assert header (5s)
- **Read-only:** Yes
- **Estimated duration:** ~18s

**Test 51 — `dashboard KPI values are numeric (real data)`**
- **Steps:** Goto `/#/dashboard`, assert sidebar, get income card text, assert contains `$`
- **Read-only:** Yes
- **Estimated duration:** ~20s

**Test 52 — `create client via add=true opens form`**
- **Steps:** Goto `/#/clients?add=true`, assert dialog (5s)
- **Read-only:** Yes (opens form, no submit)
- **Estimated duration:** ~18s

**Test 53 — `create appointment form accessible`**
- **Steps:** Goto `/#/agenda?add=true`, assert dialog (5s)
- **Read-only:** Yes (opens form, no submit)
- **Estimated duration:** ~18s

**Test 54 — `seed client via API → appears in UI`**
- **Setup:** Generate unique name `API-{timestamp}`, call `provider.seed({ customers: [makeClient({...})] })` **— custom seed**
- **Steps:** Goto `/#/clients`, assert header (10s), assert unique name text visible (8s)
- **Writes data:** Yes (creates customer via RealProvider API)
- **Estimated duration:** ~25s

### Data Persistence — Merge Candidates
Tests 46-50 are **near-identical patterns** (goto page → assert header). They could be merged into one test: "All pages load with real data" — 5 navigations + 6 assertions. Tests 52-53 are similar (goto ?add=true → assert dialog). Test 51 is dashboard-specific (KPI numeric). Test 54 is the only write test in this file.

### Data Persistence — Login Sharing
Tests 46-53 are pure read-only (headless navigation + assertions). They are **prime candidates for login sharing**. Each test currently does a full OAuth2 login (~8s). With `storageState`, 8 tests × 8s = 64s saved.

---

## Test #55–56: Tenant Isolation — Real (`specs/real/tenant-isolation.spec.ts`)

**Tags:** `@dashboard`, `@critical`, `@happy-path`

**Skip condition:** `E2E_MODE !== 'real'`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 55 | `dashboard shows current tenant branding` | `authenticatedPage` | None | No | Yes |
| 56 | `seed service via API → visible in catalog` | `authenticatedPage`, `provider` | 1 service via `makeService()` factory | No (API seed) | **Writes via API** |

**Test 55 — `dashboard shows current tenant branding`**
- **Steps:** Goto `/#/dashboard`, assert sidebar (10s), assert `dashboard.studioLevel` i18n text
- **Read-only:** Yes
- **Estimated duration:** ~20s

**Test 56 — `seed service via API → visible in catalog`**
- **Setup:** Generate `API-Svc-{timestamp}`, `provider.seed({ services: [makeService({...})] })` **— custom seed**
- **Steps:** Goto `/#/services`, assert header (10s), assert unique service name (8s)
- **Writes data:** Yes (API-level)
- **Estimated duration:** ~25s

---

## Test #57–59: RealProvider Contract (`specs/real/real-provider.contract.spec.ts`)

**Tags:** None (no tag annotation)
**Import:** `@playwright/test` (not testWithUser)

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 57 | `seeds through typed APIs and cleans dependent records first` | Plain test + manual RealProvider | Custom seed (customer, service, appointment) | No (pure API test) | **Writes** (API) |
| 58 | `rejects setup without a configured base URL or browser token` | Plain test + manual RealProvider | None | No | Yes |
| 59 | `surfaces cleanup failures instead of silently swallowing them` | Plain test + manual RealProvider | 1 customer | No | **Writes** (API, then fails cleanup) |

**Test 57 — `seeds through typed APIs and cleans dependent records first`**
- **Setup:** Creates `RealProvider` with custom fetcher (Response stub), sets token
- **Steps:** Seed customer + service + appointment. Assert API call order: POST customers → POST services → POST appointments → POST cancel → POST retire customer → POST retire service. Assert headers (API-Version: 1.0, Authorization: Bearer, X-Emme-Tenant-Slug)
- **No browser:** Pure Node.js test
- **Parallel safe:** Yes (no browser)
- **Estimated duration:** <1s

**Test 58 — `rejects setup without a configured base URL or browser token`**
- **Setup:** Creates RealProvider with baseUrl but no token
- **Steps:** Call `provider.setup()`, expect reject with 'authenticated browser token'
- **No browser**
- **Parallel safe:** Yes
- **Estimated duration:** <1s

**Test 59 — `surfaces cleanup failures instead of silently swallowing them`**
- **Setup:** Creates RealProvider with custom fetcher (customer POST 200, others 500)
- **Steps:** Seed 1 customer, call teardown, expect reject with 'cleanup failed'
- **No browser**
- **Parallel safe:** Yes
- **Estimated duration:** <1s

---

## Test #60: E2E Data Factory Contract (`specs/real/e2e-data-factory.contract.spec.ts`)

**Tags:** None
**Import:** `@playwright/test`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 60 | `E2E data factory produces unique tenant-scoped records with stable markers` | Plain test | None | No | Yes |

- **Setup:** `createE2eDataFactory('worker-1-test-2')`
- **Steps:** Create customer, service, appointment. Assert naming pattern: `E2E-worker-1-test-2 Customer`, email `e2e-worker-1-test-2.customer@emme.test`, service name `E2E-worker-1-test-2 Service`, appointment times 10:00-11:00
- **No browser:** Pure function test
- **Parallel safe:** Yes
- **Estimated duration:** <1s

---

## Test #61: Recording Contract (`specs/real/recording-contract.spec.ts`)

**Tags:** None
**Import:** `@playwright/test`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 61 | `exposes a unified recording command for both mock and real` | Plain test | None | No | Yes |

- **Setup:** Reads `package.json` and `demo-recordings.spec.ts` from filesystem
- **Steps:** Assert package.json scripts contain correct recording commands, assert spec file contains `Tag.DEMO` and `Tag.CRITICAL`
- **No browser:** File inspection test
- **Parallel safe:** Yes
- **Estimated duration:** <1s

---

## Test #62–64: Recording Workflow Contract (`specs/real/recording-workflow.contract.spec.ts`)

**Tags:** None
**Import:** `@playwright/test`

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 62 | `real recording workflow protects the full-stack evidence contract` | Plain test | None | No | Yes |
| 63 | `frontend CI exposes safe deployment and runtime choices` | Plain test | None | No | Yes |
| 64 | `real mode and recording mode cannot silently be selected by mock commands` | Plain test | None | No | Yes |

**Test 62 — `real recording workflow protects the full-stack evidence contract`**
- **Setup:** Reads `.github/workflows/real-e2e-recordings.yml`
- **Steps:** ~20 assertions checking workflow structure (service_ref, web_ref, E2E_MODE, compose files, upload-artifact, etc.)
- **No browser:** YAML/workflow validation
- **Parallel safe:** Yes
- **Estimated duration:** <1s

**Test 63 — `frontend CI exposes safe deployment and runtime choices`**
- **Setup:** Reads `.github/workflows/ci-frontend.yml`
- **Steps:** ~14 assertions checking deployment_target, runtime choices, compose/k3d/k3s options, e2e_suite defaults
- **No browser**
- **Parallel safe:** Yes

**Test 64 — `real mode and recording mode cannot silently be selected by mock commands`**
- **Setup:** Reads `package.json`, `playwright.config.ts`, `ci-frontend.yml`
- **Steps:** ~7 assertions verifying E2E_MODE env var protection, VITE_API_BASE_URL config, bun run test:e2e:mock command
- **No browser**
- **Parallel safe:** Yes

---

## Test #65–74: Demo Recordings (`specs/demo/demo-recordings.spec.ts`)

**Tags:** `@demo`, `@critical`
**Mode:** `serial` (all 10 tests run sequentially)

| # | Test Name | Fixture | Seeds beyond DEFAULT | UI Mutations | Read-Only? |
|---|---|---|---|---|---|
| 65 | `01-landing-and-login` | `unauthenticatedPage` | None | `goToLoginForm()` click | Yes |
| 66 | `02-dashboard-overview` | `authenticatedPage` | DEFAULT_SEED | None | Yes |
| 67 | `03-navigation-all-sections` | `authenticatedPage` | DEFAULT_SEED | 3 nav clicks | Yes |
| 68 | `04-service-catalog` | `authenticatedPage` | DEFAULT_SEED | None | Yes |
| 69 | `05-client-crm` | `authenticatedPage` | DEFAULT_SEED | None | Yes |
| 70 | `06-appointment-views` | `authenticatedPage` | DEFAULT_SEED | `gotoNewAppointment()`, click close | Yes |
| 71 | `07-finances-overview` | `authenticatedPage` | DEFAULT_SEED | None | Yes |
| 72 | `08-settings-and-tabs` | `authenticatedPage` | DEFAULT_SEED | Up to 6 tab clicks | Yes |
| 73 | `09-settings-appearance-language` | `authenticatedPage` | DEFAULT_SEED | Up to 3 tab clicks | Yes |
| 74 | `10-security-logout` | `authenticatedPage` | DEFAULT_SEED | Click 'Seguridad' tab, assert logout button | Yes |

**Test 65 — `01-landing-and-login`**
- **Setup:** `unauthenticatedPage` fixture
- **Steps:** Goto landing, wait 2s, assert landing button (10s timeout with fallback selector), goToLoginForm, assert email + password inputs (10s timeout each)
- **UI interactions:** 1 click (login button)
- **Fresh login required:** No (unauthenticated)
- **Estimated duration:** ~5s (mock), ~8s (real)

**Test 66 — `02-dashboard-overview`**
- **Setup:** `authenticatedPage` fixture (full login)
- **Steps:** Goto dashboard, wait for networkidle, assert sidebar + greeting + agendaSection
- **Read-only:** Yes
- **Estimated duration:** ~6s (mock), ~25s (real)

**Test 67 — `03-navigation-all-sections`**
- **Steps:** Goto dashboard, wait for networkidle, click services nav (wait 500ms), click clients nav (wait 500ms), click dashboard nav (wait 500ms), assert greeting
- **UI interactions:** 3 nav clicks with 500ms waits
- **Read-only:** Yes
- **Estimated duration:** ~5s (mock), ~25s (real)

**Test 68 — `04-service-catalog`**
- **Steps:** Goto services page, wait 800ms, assert header
- **Read-only:** Yes
- **Estimated duration:** ~3s (mock), ~18s (real)

**Test 69 — `05-client-crm`**
- **Steps:** Goto clients page, wait 800ms, assert header
- **Read-only:** Yes
- **Estimated duration:** ~3s (mock), ~18s (real)

**Test 70 — `06-appointment-views`**
- **Steps:** Goto appointments, wait 1s, gotoNewAppointment, assert dialog, click close, assert dialog gone
- **UI interactions:** 1 click (close)
- **Read-only:** Yes (opens and closes, no submit)
- **Estimated duration:** ~4s (mock), ~20s (real)

**Test 71 — `07-finances-overview`**
- **Steps:** Goto finances, wait 1s, assert header
- **Read-only:** Yes
- **Estimated duration:** ~3s (mock), ~18s (real)

**Test 72 — `08-settings-and-tabs`**
- **Steps:** Goto settings, wait 1s, assert header. For each tab (Perfil, Horarios, Notificaciones, WhatsApp Bot, Promociones, Google Workspace): if visible, click, wait 300ms.
- **UI interactions:** Up to 6 tab clicks
- **Read-only:** Yes
- **Estimated duration:** ~6s (mock), ~25s (real)

**Test 73 — `09-settings-appearance-language`**
- **Steps:** Goto settings, wait 1s. For each tab (Apariencia, Idioma, Datos): if visible, click, wait 300ms.
- **UI interactions:** Up to 3 tab clicks
- **Read-only:** Yes
- **Estimated duration:** ~5s (mock), ~22s (real)

**Test 74 — `10-security-logout`**
- **Steps:** Goto settings, wait 1s. Click 'Seguridad' tab (if visible, 2s timeout), wait 400ms. Assert logout button visible (8s timeout).
- **UI interactions:** 1 click
- **Read-only:** Yes
- **Estimated duration:** ~5s (mock), ~22s (real)

### Demo Recordings — Serial Constraint
Must be serial (`mode: 'serial'`) because these are designed for video recording as a single narrative flow. Test 65 is unauthenticated (before login), tests 66-74 use authenticatedPage. Each authenticatedPage call still gets a fresh login (scope: 'test'), so the serial constraint is for recording coherence, not data dependency.

### Demo Recordings — Login Sharing Opportunity
Tests 65-74 run serially. Test 65 uses unauthenticatedPage. Tests 66-74 each get a fresh `authenticatedPage` with fresh login. For a recording this makes sense (each section is a separate video clip), but for efficiency, tests 66-74 could share one login via `{ storageState: 'demo-state.json' }` since none of them mutate data.

---

## Cross-Cutting Analysis

### 1. Tests That Call `provider.seed()` with Data Beyond DEFAULT_SEED

| File | Test #(s) | Seed Data |
|---|---|---|
| `appointments/appointments.spec.ts` | 9-12 | 3 appointments + 3 customers + 2 services |
| `customers/customers.spec.ts` | 13-16 | 3 customers |
| `services/services.spec.ts` | 18-25 | 3 services |
| `real/tenant-owner-lifecycle.spec.ts` | 43 | 1 service via factory |
| `real/tenant-owner-lifecycle.spec.ts` | 44 | 1 customer + 1 service via factory |
| `real/data-persistence.spec.ts` | 54 | 1 customer via `makeClient()` |
| `real/tenant-isolation.spec.ts` | 56 | 1 service via `makeService()` |
| `cross-cutting/mock-provider-isolation.spec.ts` | 34 | 1 customer (manual MockProvider) |
| `real/real-provider.contract.spec.ts` | 57, 59 | Customers, services, appointments (manual RealProvider) |

### 2. Tests That Do UI Interactions (clicks, fills) vs Pure Assertions

**Pure assertion tests (no clicks/fills beyond navigation):**
Tests: 1, 5-8, 9-11, 13-14, 18, 27-28, 35-39, 41-42, 45-51, 52-53, 55, 60-64, 66, 68-69, 71
**Count: ~38 tests (51%)** — headless assertion-only

**Tests with UI interactions (clicks, fills, keyboard):**
Tests: 2-4 (clicks on landing page), 12 (navigation), 15 (URL param), 16 (fill search), 17 (fill + submit), 19 (fill + clear), 20 (fill), 21 (click chip), 22-23 (click card, click close), 24 (URL param), 25 (fill), 26 (fill + submit × 2), 29-30 (nav clicks), 31 (Tab presses), 32 (Tab press), 33 (navigations), 40 (click), 43 (editService + fill + submit), 44 (navigate), 54 (goto → assertion), 56 (goto → assertion), 65 (click), 67 (nav clicks), 70 (click close), 72-74 (tab clicks)
**Count: ~36 tests (49%)**

### 3. Read-Only Tests (No Mutations)

**Read-only:** 1-16, 18-25, 27-33, 35, 37-42, 44-53, 55, 58, 60-74
**Count: ~60 tests (81%)** — these never mutate data through the UI

**Write/mutate tests:**
- Test 17: Creates customer via UI (mock)
- Test 26: Creates + updates service via UI (mock)
- Test 34: API-level seed isolation test
- Test 36: Health endpoint check (not a mutation but external)
- Test 43: Updates service via UI (real)
- Test 54: Seeds customer via API, verifies in UI (real)
- Test 56: Seeds service via API, verifies in UI (real)
- Test 57: API-level contract test with seed + teardown
- Test 59: API-level contract test with seed + failed teardown
**Count: ~9 tests (12%)**

### 4. Merge Recommendations

**High-priority merges (tests that visit the same page, same seed, read-only):**

| Group | Tests to Merge | File | # Tests | Resulting Tests |
|---|---|---|---|---|
| Auth Landing | 1, 2, 3, 4 | login.spec.ts | 4 → 1 | "Landing page renders and all navigation works" |
| Dashboard Read | 5, 6, 7, 8 | dashboard.spec.ts | 4 → 1 | "Dashboard renders all sections correctly" |
| Appointments Read | 9, 10, 11 | appointments.spec.ts | 3 → 1 | "Appointments page renders all components" |
| Customers Read | 13, 14, 16 | customers.spec.ts | 3 → 1 | "Customers page renders list, handles empty search" |
| Services Read | 18-25 | services.spec.ts | 8 → 3 | "Services catalog + search" / "Services detail dialog" / "Services add dialog" |
| Navigation | 29, 30 | navigation.spec.ts | 2 → 1 | "Navigation works correctly (all sections + rapid)" |
| Session Real | 37, 38 | session.spec.ts | 2 → 1 | "Dashboard loads with tenant-scoped shell after OAuth2" |
| OAuth Flow | 39, 40 | oauth-flow.spec.ts | 2 → 1 | "Login flow renders and redirects" |
| Data Persistence Pages | 46-50 | data-persistence.spec.ts | 5 → 1 | "All pages load with real data" |
| Data Persistence Forms | 52, 53 | data-persistence.spec.ts | 2 → 1 | "Create forms open via add=true" |
| Demo Settings Tabs | 72, 73, 74 | demo-recordings.spec.ts | 3 → 1 | "Settings all tabs render and navigation works" |

**Total merge savings:** 74 tests → approximately 50 tests (24 tests merged into 11)

### 5. Login Sharing Candidates (storageState)

All **60 read-only tests** could use a shared login. The biggest wins:

| File | Tests | Login Time Saved (real mode) |
|---|---|---|
| `data-persistence.spec.ts` (tests 46-53) | 8 tests | 8 × 8s = 64s |
| `services/services.spec.ts` (tests 18-25) | 8 tests | 8 × 8s = 64s |
| `dashboard/dashboard.spec.ts` (tests 5-8) | 4 tests | 4 × 8s = 32s |
| `customers/customers.spec.ts` (tests 13-16) | 4 tests | 4 × 8s = 32s |
| `appointments/appointments.spec.ts` (tests 9-12) | 4 tests | 4 × 8s = 32s |
| `demo-recordings.spec.ts` (tests 66-74) | 9 tests | 9 × 8s = 72s |
| `navigation.spec.ts` (tests 29-30) | 2 tests | 2 × 8s = 16s |
| All others | ~21 tests | ~168s |

**Total potential savings in real mode: ~480 seconds (8 minutes)** if all read-only authenticated tests shared a single login per file group.

### 6. Parallel vs Serial Summary

| Mode | Parallel Capability | Tests That Require Serial |
|---|---|---|
| **Mock** | All tests parallel (`fullyParallel: true`) | `tenant-owner-lifecycle` (4 tests, explicit `serial`), `demo-recordings` (10 tests, explicit `serial`), `mock-lifecycle` tests (17, 26 — should not conflict with other tests that seed same entity type) |
| **Real** | None — all serial (`fullyParallel: false`, `workers: 1`) | Everything is serial |

**Note on mock parallelism:** The `mock-lifecycle` tests (17, 26) create data via UI. In mock mode they use MockProvider which keeps data in-memory per provider instance. Since each test gets its own provider (scope: 'test'), there is no cross-contamination. However, test 17 (creates customer `E2E Customer`) could theoretically conflict with test 26 (creates service `E2E Service`) if the UI has global state — but since MockProvider isolates per page, this is safe in practice.

### 7. Expected Duration Estimates

| Mode | All 74 Tests (Parallel where allowed) | All 74 Tests (Fully Serial) |
|---|---|---|
| **Mock** | ~10-15s (parallel, 8 workers) | ~120-180s (serial) |
| **Real** | N/A (always serial) | ~25-40 minutes (74 × ~20-30s each with Keycloak login) |
| **Real with login sharing** | N/A | ~15-20 minutes (login time saved for ~60 read-only tests) |

### 8. Tests Without Browser / Pure Unit Tests

These tests import `@playwright/test` directly (not `testWithUser`) and do not use a browser:

| Test # | File | What It Tests |
|---|---|---|
| 34 | `mock-provider-isolation.spec.ts` | MockProvider instance isolation |
| 57 | `real-provider.contract.spec.ts` | RealProvider API call order |
| 58 | `real-provider.contract.spec.ts` | RealProvider setup validation |
| 59 | `real-provider.contract.spec.ts` | RealProvider cleanup failure handling |
| 60 | `e2e-data-factory.contract.spec.ts` | Factory naming conventions |
| 61 | `recording-contract.spec.ts` | Package.json scripts integrity |
| 62 | `recording-workflow.contract.spec.ts` | CI workflow structure |
| 63 | `recording-workflow.contract.spec.ts` | CI deployment choices |
| 64 | `recording-workflow.contract.spec.ts` | Mode enforcement in configs |

These 9 tests (12%) are fast (<1s each), have no browser overhead, and are perfectly safe to run in parallel at all times in both modes.

### 9. Tags Taxonomy

| Tag | Tests |
|---|---|
| `@auth` | 1-4, 33, 37-41 |
| `@dashboard` | 5-8, 35-36, 46-56 |
| `@services` | 18-26, 46, 56 |
| `@clients` | 13-17, 47, 54 |
| `@appointments` | 9-12, 48, 53 |
| `@finances` | 27, 49 |
| `@settings` | 28, 50 |
| `@navigation` | 29-30 |
| `@smoke` | 9, 13, 19, 29, 31-32, 35-36 |
| `@critical` | 17, 26, 31-32, 35-36, 37-41, 42-45, 46-56, 65-74 |
| `@demo` | 65-74 |
| `@regression` | 1-16, 18-30, 33 |
| `@happy-path` | 12, 37-41, 46-56 |
| `@empty-state` | 8, 16, 25 |
| `@error-state` | 33 |
| `@real` | 42-45 |
| `@mock` / `@real` | Set automatically by fixtures (execution tags) |

### 10. Redundant/Overlapping Tests

The following tests assert the same thing with minimal variation and could be de-duplicated:

1. **Test 27** (`finances header renders`) is identical in pattern to **Test 28** (`settings header renders`) — both just assert header after goto. Same with **Test 9** (`appointments page header renders`). All three: goto page → assert header.

2. **Test 35** (`landing page loads` from real-smoke) and **Test 39** (`landing page shows login button` from oauth-flow) are **functionally identical** — both assert a button with /ingresar|Iniciar/.

3. **Test 37** and **Test 38** (session.spec.ts) — test 38 is a superset of test 37.

4. **Test 42** (`owner reaches dashboard`) is nearly identical to **Test 37** and **Test 38**.

5. **Test 46-50** (data-persistence) — all the same pattern: goto page → assert header.

6. **Test 9** (appointments header) assertion is already done in the beforeEach — the test body assertion is redundant.

7. **Test 13** (customers header) same — already in beforeEach.

8. **Test 27** (finances header) same — already in beforeEach.

9. **Test 28** (settings header) same — already in beforeEach.
</task_result>
</task>