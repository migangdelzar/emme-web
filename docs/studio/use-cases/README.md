# Studio App — Use Case Index

> **Source:** `apps/emme-salon-app/` — React 19 + Vite PWA
> **Backend:** `emme-service` Spring Modulith
> **Traceability:** Use case IDs match backend specs for cross-reference

| UC ID | Name | Primary Actor | Frontend Status |
|---|---|---|---|
| UC-001 | [Sign In and Select Workspace](UC-001-sign-in-select-workspace.md) | Studio User | Implemented |
| UC-003 | [View Business Dashboard](UC-003-view-business-dashboard.md) | Salon Manager | Implemented |
| UC-004 | [Manage Service Catalog](UC-004-manage-service-catalog.md) | Salon Manager | Implemented |
| UC-005 | [Manage Client Profiles](UC-005-manage-client-profiles.md) | Staff Member | Implemented |
| UC-006 | [Manage Appointments](UC-006-manage-appointments.md) | Staff Member | Implemented |
| UC-007 | [Configure Business](UC-007-configure-business.md) | Salon Owner | Implemented |
| UC-021 | [Complete Studio Onboarding](UC-021-complete-studio-onboarding.md) | Salon Owner | Implemented |
| UC-022 | [Integrate Google Workspace](UC-022-integrate-google-workspace.md) | Salon Owner | Implemented |
| UC-024 | [Manage Studio Data and Account](UC-024-manage-studio-data-and-account.md) | Salon Owner | Implemented |
| UC-028 | [Use AI Chat Assistant](UC-028-ai-chat-assistant.md) | Staff Member | Backend ready, frontend pending |

## Coverage Map

| Requirements | Use Cases |
|---|---|
| FR-WS001 – FR-WS004 Auth & access | UC-001 |
| FR-WS005 – FR-WS010 Dashboard | UC-003 |
| FR-WS011 – FR-WS021 Appointments | UC-006 |
| FR-WS022 – FR-WS029 Clients | UC-005 |
| FR-WS030 – FR-WS035 Services | UC-004 |
| FR-WS036 – FR-WS040 Finances | UC-003 |
| FR-WS041 – FR-WS047 Business configuration | UC-007 |
| FR-WS048 – FR-WS054 Google Workspace | UC-022 |
| FR-WS055 – FR-WS056 Appearance & language | UC-024 |
| FR-WS057 – FR-WS059 Data & security | UC-024 |
| FR-WS060 – FR-WS061 Onboarding | UC-021 |

## Backend Use Cases Not Yet in Frontend

These backend capabilities have APIs but no dedicated UI in the studio app yet:

| UC ID | Name | Backend Module |
|---|---|---|
| UC-012 | Review Conversation History | `assistant` |
| UC-013 | Manage Knowledge Sources | `documents` |
| UC-014 | Deliver Notifications (history view) | `notification` |
| UC-015 | Manage Subscription | `subscriptions` |
| UC-016 | Process Payments | `payment` |
| UC-023 | Manage Nail Design Catalog | `catalog` |
