# Client App — Use Case Index

> **Channels:** WhatsApp, web chat, web frontend
> **Backend:** `emme-service` Spring Modulith
> **Status:** Backend APIs implemented. Dedicated web/mobile frontend not yet in this monorepo. Customer interactions flow through WhatsApp and web chat channels.

| UC ID | Name | Primary Actor | Status |
|---|---|---|---|
| UC-001 | Access Tenant Workspace | Customer | Backend |
| UC-008 | Converse Through Channels | Customer | Backend |
| UC-009 | Normalize Multimodal Input | Customer | Backend |
| UC-010 | Receive AI Guidance | Customer | Backend |
| UC-011 | Complete Conversational Booking | Customer | Backend |
| UC-016 | Process Payments | Customer | Backend |
| UC-025 | Discover Services and Designs | Customer | Backend |
| UC-026 | Sync Personal Calendar | Customer | Backend |
| UC-027 | Sign In with Social Identity | Customer | Backend (Draft) |

## Coverage Map

| Requirements | Use Cases |
|---|---|
| FR-WC001 – FR-WC003 Auth | UC-001, UC-027 |
| FR-WC004 – FR-WC007 Channel interaction | UC-008, UC-009 |
| FR-WC008 – FR-WC010 AI guidance | UC-010 |
| FR-WC011 – FR-WC015 Booking | UC-011 |
| FR-WC016 – FR-WC017 Discovery | UC-025 |
| FR-WC018 – FR-WC019 Calendar & notifications | UC-026 |
