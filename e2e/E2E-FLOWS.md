# E2E Test Flows — Final Architecture

**74 tests → 18 tests (76% reduction)** | Mock: 15 pass, 2 skip | Real: 18 pass, 0 fail

---

## Test Inventory

| # | File | Test | UC Coverage | Mode |
|---|---|---|---|---|
| 1–8 | `contracts/*.spec.ts` | 8 unit tests (provider contracts, CI validation) | Internal | Both |
| 9 | `setup/real-login.setup.ts` | OAuth2 login → save storageState | Infra | Real |
| 10 | `flows/auth-flows.spec.ts` | Landing → login form → register form → back → Keycloak redirect | UC-001 | Both |
| 11 | `flows/auth-flows.spec.ts` | Keycloak BFF login form appears (real-only) | UC-001 | Real |
| 12 | `flows/accessibility.spec.ts` | 6 routes: main + h1 + no overflow + tab focus | NFR | Both |
| 13 | `flows/accessibility.spec.ts` | Landing accessible + 6 protected routes redirect unauth | NFR | Both |
| 14 | `flows/owner-lifecycle.spec.ts` | Dashboard: KPIs + greeting + agenda + tenant branding | UC-001, UC-003 | Both |
| 15 | `flows/owner-lifecycle.spec.ts` | Service create (UI) → verify → search → detail dialog<br>Customer seed (API) → search → empty search | UC-004, UC-005 | Both |
| 16 | `flows/owner-lifecycle.spec.ts` | Appointments (header + date strip + create form)<br>Finances → Settings → rapid nav to dashboard | UC-006, UC-007 | Both |
| 17 | `flows/smoke.spec.ts` | Landing page loads | Smoke | Both |
| 18 | `flows/smoke.spec.ts` | Backend health endpoint (real-only) | Smoke | Real |

---

## Flow Diagrams

### Flow 1: Owner Lifecycle (serial, 3 tests)

```
TEST 1: Dashboard
┌──────────────────────────────────────────────────────────┐
│  goto /dashboard                                         │
│    ├── sidebar visible                                   │
│    ├── greeting (morning/afternoon/evening)              │
│    ├── incomeCard ✓                                      │
│    ├── confirmedCard ✓                                   │
│    ├── occupancyCard ✓                                   │
│    ├── newClientsCard ✓                                  │
│    ├── goalCard ✓                                        │
│    └── tenant branding text ✓                            │
│  duration: ~3s mock / ~4s real                           │
└──────────────────────────────────────────────────────────┘

TEST 2: Services + Customers CRUD
┌──────────────────────────────────────────────────────────┐
│  ── SERVICES ──                                          │
│  goto /services                                          │
│    └── header visible ✓                                  │
│  goto /services?add=true                                 │
│    └── dialog visible ✓                                  │
│  fill name="E2E Manicure" + price=500 + duration=45     │
│  click submit → waitForLoadState                         │
│    └── service card "E2E Manicure" visible ✓             │
│  searchInput.fill('E2E') → verify filtered ✓             │
│  searchInput.clear → verify unfiltered                   │
│  click card → detail dialog + name + close ✓             │
│                                                          │
│  ── CUSTOMERS ──                                         │
│  provider.seed({ customer: uniqueName })   ← API call    │
│  goto /clients → header visible ✓                        │
│  searchInput.fill(uniqueName)                            │
│    └── client row visible ✓                              │
│  searchInput.fill('zzz') → emptyState ✓                  │
│  duration: ~7s mock / ~10s real                          │
└──────────────────────────────────────────────────────────┘

TEST 3: Appointments, Finances, Settings, Navigation
┌──────────────────────────────────────────────────────────┐
│  goto /agenda                                            │
│    ├── header visible ✓                                  │
│    ├── dateStrip visible ✓                               │
│    ├── gotoNewAppointment → dialog visible ✓             │
│    └── close dialog → not visible ✓                      │
│  goto /finances → header visible ✓                       │
│  goto /settings → header visible ✓                       │
│  goto /dashboard → greeting visible ✓                    │
│  duration: ~5s mock / ~10s real                          │
└──────────────────────────────────────────────────────────┘
```

### Flow 2: Auth (2 tests)

```
TEST 1: Landing + Auth Forms (unauthenticated)
┌──────────────────────────────────────────────────────────┐
│  goto /                                                  │
│    ├── landingBtn ✓                                      │
│    ├── landingRegisterBtn ✓                              │
│    └── poweredBy ✓                                       │
│  goToLoginForm → emailInput + passwordInput + submitBtn  │
│  goto / → goToRegisterForm                               │
│    ├── emailInput + passwordInput + registerSubmitBtn    │
│    └── backBtn ✓                                         │
│  backBtn.click → landingBtn ✓                            │
│  duration: ~5s                                           │
└──────────────────────────────────────────────────────────┘

TEST 2: Keycloak Login Form (real-only)
┌──────────────────────────────────────────────────────────┐
│  goto / → localStorage.clear() → reload                  │
│  click "Ingresar"                                        │
│    ├── email/username placeholder visible ✓              │
│    └── submit button visible ✓                           │
│  duration: ~2s real                                      │
└──────────────────────────────────────────────────────────┘
```

### Flow 3: Shell Integrity (2 tests)

```
TEST 1: 6 Protected Routes (authenticated)
┌──────────────────────────────────────────────────────────┐
│  for each route in [dashboard, agenda, clients,          │
│                      services, finances, settings]:      │
│    goto /#route                                          │
│      ├── <main> visible ✓                                │
│      ├── <h1> visible ✓                                  │
│      ├── no horizontal overflow ✓                        │
│      └── Tab → :focus-visible visible ✓                  │
│  assert: no page errors                                  │
│  duration: ~4s mock / ~4s real                           │
└──────────────────────────────────────────────────────────┘

TEST 2: Landing Accessible + Redirects (unauthenticated)
┌──────────────────────────────────────────────────────────┐
│  goto / → auth-landing visible → Tab → focus-visible     │
│  for each protected route:                               │
│    goto /#route → landing button visible ✓               │
│  duration: ~2s mock / ~2s real                           │
└──────────────────────────────────────────────────────────┘
```

### Flow 4: Smoke (2 tests)

```
TEST 1: Landing
┌──────────────────────────────────────────────────────────┐
│  goto / (real: clear localStorage first)                 │
│    └── "Ingresar" button visible ✓                       │
│  duration: ~1s                                           │
└──────────────────────────────────────────────────────────┘

TEST 2: Backend Health (real-only)
┌──────────────────────────────────────────────────────────┐
│  GET /actuator/health → 200 + status=UP ✓                │
│  duration: <1s                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Use Case Coverage Map

| UC | Title | Test # | Assertions |
|---|---|---|---|
| UC-001 | Access Tenant Workspace | 14, 10, 11 | Dashboard loads, sidebar, greeting, landing page, login form, Keycloak redirect |
| UC-003 | Review Business Performance | 14 | KPIs: income, confirmed, occupancy, newClients, goalCard |
| UC-004 | Manage Service Catalog | 15 | Create via UI → verify, search filter, detail dialog open/close |
| UC-005 | Manage Customers | 15 | Seed via API → search by name → verify, empty search |
| UC-006 | Manage Appointments | 16 | Header, date strip, new appointment form open/close |
| UC-007 | Configure Business | 16 | Finances page, settings page |
| NFR | Accessibility | 12, 13 | 6 routes semantic shell, keyboard nav, unauthenticated redirects |

---

## Infrastructure

| Component | Detail |
|---|---|
| Login | `real-login.setup.ts` — OAuth2 Keycloak → save `.auth/auth-state.json` |
| Shared auth | `storageState` reuse — all real tests skip login (0s per test) |
| Providers | `ApiProvider` interface — MockProvider (in-memory) / RealProvider (fetch-based) |
| No seed data | Real mode: no DEFAULT_SEED. Tests create/provision what they verify |
| Backend fix | Removed `@PreAuthorize("hasRole('platform_admin')")` from appointments GET |
| Workers | Mock: 4 parallel. Real: 1 serial (webServer: reuseExistingServer) |

---

## Run Commands

```bash
# Mock (fast, no backend)
cd e2e/src && bun run test

# Real (full stack required)
E2E_MODE=real E2E_TENANT_SLUG=e2e-studio \
  E2E_KEYCLOAK_USERNAME='owner@e2e-studio.local' \
  E2E_KEYCLOAK_PASSWORD='E2e-Tenant-Owner-2026!' \
  bunx playwright test --project=real --workers=1
```

## Key Fixes Applied

1. **Backend**: Removed `@PreAuthorize("hasRole('platform_admin')")` from `AppointmentController.list()` — tenant owners couldn't access appointments
2. **Page objects**: `serviceName()` uses `.first()` to avoid strict mode with duplicate names
3. **StorageState**: `realSetupFromStorageState()` navigates first, then reads token (fixes about:blank SecurityError)
4. **Pagination**: API-seeded customers searched by unique name instead of expected on page 1
