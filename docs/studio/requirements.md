# EmmeNails Studio Manager — User-Facing Requirements

| Field | Value |
|---|---|
| App | `apps/salon-app/` |
| Stack | React 19, Vite, TanStack Query, Zustand, react-router-dom |
| Backend | Spring Modulith (`emme-service`) |
| Audience | Salon owners, managers, staff |
| Source | Reverse-engineered from actual React components |

## Functional Requirements

### Authentication & Access

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS001 | Sign in with credentials | As a studio user, I want to sign in with email and password or via Keycloak OAuth so that I can access my workspace. | Implemented |
| FR-WS002 | View landing page | As a visitor, I want to see a branded landing page with options to sign in or register before authenticating. | Implemented |
| FR-WS003 | Select tenant workspace | As a user with multiple salon memberships, I want to choose which salon to manage from a list of my active memberships. | Implemented |
| FR-WS004 | Sign out | As a studio user, I want to sign out from any screen so that my session is terminated. | Implemented |

### Dashboard

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS005 | View today's KPIs | As a salon manager, I want to see today's income, confirmed appointments, occupancy rate, and new clients at a glance. | Implemented |
| FR-WS006 | View today's agenda | As a salon manager, I want to see today's upcoming appointments with client and service details in chronological order. | Implemented |
| FR-WS007 | Open appointment detail from dashboard | As a salon manager, I want to click an appointment to see full details and manage its status without leaving the dashboard. | Implemented |
| FR-WS008 | Quick-create appointment from dashboard | As a salon manager, I want a one-click button to create a new appointment directly from the dashboard. | Implemented |
| FR-WS009 | Quick-create client from dashboard | As a salon manager, I want a one-click button to register a new client from the dashboard. | Implemented |
| FR-WS010 | Set and track monthly goal | As a salon owner, I want to set a monthly revenue target and see a progress bar tracking actual vs goal. | Implemented |

### Appointment Management

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS011 | View calendar in multiple layouts | As a staff member, I want to view appointments in list, day, week, and month calendar views. | Implemented |
| FR-WS012 | Navigate dates | As a staff member, I want to navigate between dates using a 5-day horizontal strip and a collapsible monthly calendar picker. | Implemented |
| FR-WS013 | Create appointment via wizard | As a staff member, I want to create an appointment through a 3-step wizard: select client → select service → choose date and time slot. | Implemented |
| FR-WS014 | See available time slots | As a staff member, I want available time slots computed from salon hours, service duration, existing bookings, and break times. | Implemented |
| FR-WS015 | View appointment detail | As a staff member, I want to see client info, service, time, price, status, allergies, preferences, and notes for any appointment. | Implemented |
| FR-WS016 | Cancel appointment with confirmation | As a staff member, I want to cancel an appointment with a confirmation dialog before the action takes effect. | Implemented |
| FR-WS017 | Contact client via WhatsApp | As a staff member, I want to open a WhatsApp conversation with the client from the appointment detail with a pre-filled reminder message. | Implemented |
| FR-WS018 | Share appointment to Google Calendar | As a staff member, I want to generate a Google Calendar link or download an ICS file for any appointment. | Implemented |
| FR-WS019 | Change appointment status | As a staff member, I want to update an appointment's status (pending, confirmed, completed, cancelled) from the detail view. | Partially (UI exists, backend write pending) |
| FR-WS020 | Drag-and-drop reschedule | As a staff member, I want to drag an appointment card to a different day or time slot to reschedule it. | Partially (visual only, backend write pending) |
| FR-WS021 | See today's projected revenue | As a staff member, I want to see the sum of all service prices for today's appointments. | Implemented |

### Client Management

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS022 | Browse client list | As a staff member, I want to view all clients in a paginated card grid with name, phone, total spent, and visit count. | Implemented |
| FR-WS023 | Search clients | As a staff member, I want to search clients by name or phone number. | Implemented |
| FR-WS024 | Filter and sort clients | As a staff member, I want to filter by VIP status, new/loyal/inactive segments and sort by name, spending, visits, or recency. | Implemented |
| FR-WS025 | Create client profile | As a staff member, I want to register a new client through a 2-step form: basic info (name, phone, email, VIP) → care details (birthday, allergies, notes). | Implemented |
| FR-WS026 | View client detail | As a staff member, I want to see a client's full profile including stats (total spent, visits), allergies, preferences, notes, and appointment history timeline. | Implemented |
| FR-WS027 | Edit client profile | As a staff member, I want to edit any client's name, phone, email, birthday, allergies, preferences, VIP status, and notes from their detail view. | Implemented |
| FR-WS028 | Delete client | As a staff member, I want to delete a client profile with a confirmation dialog warning about permanent data loss. | Implemented |
| FR-WS029 | Contact client via WhatsApp from profile | As a staff member, I want to open a WhatsApp conversation or initiate a phone call from the client's profile. | Implemented |

### Service Catalog

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS030 | Browse services by category | As a salon manager, I want to view services grouped by category with price and duration shown. | Implemented |
| FR-WS031 | Create service | As a salon manager, I want to create a new service with name, category, duration, price, and description. | Implemented |
| FR-WS032 | Edit service | As a salon manager, I want to edit any service's details. | Implemented |
| FR-WS033 | Toggle service active/inactive | As a salon manager, I want to enable or disable a service with one action to hide or restore offerings. | Implemented |
| FR-WS034 | Delete service | As a salon manager, I want to delete a service with a confirmation dialog. | Implemented |
| FR-WS035 | Search services | As a salon manager, I want to search services by name or description. | Implemented |

### Financial Analytics

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS036 | View monthly revenue | As a salon owner, I want to see total revenue for a selected month with previous/next month navigation. | Implemented |
| FR-WS037 | View revenue charts | As a salon owner, I want to see revenue trends (area chart), weekly comparisons (bar chart), and revenue by category (pie chart). | Implemented |
| FR-WS038 | View top services and daily transactions | As a salon owner, I want to see highest-earning services and a list of completed appointments with revenue per transaction. | Implemented |
| FR-WS039 | View advanced stats | As a salon owner, I want to see average ticket, growth rate, retention rate, busiest day, and peak hour metrics. | Implemented |
| FR-WS040 | Export finances | As a salon owner, I want to export financial data for external analysis. | Partially |

### Business Configuration

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS041 | Edit business profile | As a salon owner, I want to configure business name, owner name, contact details, address, Instagram, and description. | Implemented |
| FR-WS042 | Manage weekly operating hours | As a salon owner, I want to set per-day opening and closing times with active/inactive toggles for each day. | Implemented |
| FR-WS043 | Configure break times | As a salon owner, I want to define break periods within each operating day so appointments are not scheduled during staff breaks. | Implemented |
| FR-WS044 | Manage special dates | As a salon owner, I want to add holidays, vacations (with date ranges), and reduced-hour days so the calendar reflects exceptions. | Implemented |
| FR-WS045 | Configure WhatsApp auto-reply bot | As a salon owner, I want to enable auto-reply, set a welcome message, and define keyword-response pairs. | Implemented |
| FR-WS046 | Manage promotions | As a salon owner, I want to create time-limited service promotions with discount type (percentage or fixed) and value. | Implemented |
| FR-WS047 | Configure notification preferences | As a salon owner, I want to set reminder timing and notification templates. | Implemented |

### Google Workspace Integration

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS048 | Connect Google account | As a salon owner, I want to authorize Google OAuth to enable calendar sync and Sheets export. | Implemented |
| FR-WS049 | View Google connection status | As a salon owner, I want to see the connected Google account email and connection state. | Implemented |
| FR-WS050 | Disconnect Google account | As a salon owner, I want to revoke Google OAuth access from the settings. | Implemented |
| FR-WS051 | Toggle auto-sync to Google Calendar | As a salon owner, I want to enable or disable automatic appointment sync to Google Calendar. | Implemented |
| FR-WS052 | Trigger manual calendar sync | As a salon owner, I want to manually trigger a calendar sync to force an immediate update. | Implemented |
| FR-WS053 | Export data to Google Sheets | As a salon owner, I want to export appointments, clients, or full business data to a new Google Sheet. | Implemented |
| FR-WS054 | View exported spreadsheets | As a salon owner, I want to see a list of previously exported spreadsheets with re-export capability. | Implemented |

### Appearance & Language

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS055 | Switch theme | As a studio user, I want to switch between light, dark, and system theme. | Implemented |
| FR-WS056 | Switch language | As a studio user, I want to switch the interface language between Spanish and English. | Implemented |

### Data Management & Security

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS057 | Export data backup | As a salon owner, I want to download all business data as a JSON backup file. | Implemented |
| FR-WS058 | Clear local cache | As a studio user, I want to purge the browser cache and reload the application. | Implemented |
| FR-WS059 | Request account deletion | As a salon owner, I want to request account deletion with multi-step confirmation to prevent accidents. | Implemented |

### Onboarding

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WS060 | Complete first-time walkthrough | As a new salon owner, I want a guided 5-step walkthrough introducing the app's main features. | Implemented |
| FR-WS061 | Dismiss onboarding | As a salon owner, I want to skip or dismiss the walkthrough and return to it later via settings. | Implemented |

## Non-Functional Requirements

| ID | Title | Requirement |
|---|---|---|
| NFR-WS001 | Responsive layout | The app must be usable on viewports from 320px to 2560px with mobile bottom navigation. |
| NFR-WS002 | Loading states | Every data-dependent view must show skeleton loaders during data fetch. |
| NFR-WS003 | Error states | API errors must display an error banner; views must not show blank screens on failure. |
| NFR-WS004 | Empty states | Empty lists must show descriptive empty-state messages with calls to action. |
| NFR-WS005 | Offline resilience | The app must display cached data when the backend is unreachable. |
| NFR-WS006 | Session expiry | When the session expires, the app must redirect to login. |
| NFR-WS007 | PWA support | The app must work as a Progressive Web App with service worker caching. |
| NFR-WS008 | i18n coverage | All user-visible strings must be externalized in Spanish (es-MX, default) and English (en-US). |
