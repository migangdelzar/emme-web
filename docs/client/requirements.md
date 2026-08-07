# EMME Client — User-Facing Requirements

| Field | Value |
|---|---|
| App | Client-facing channels (WhatsApp, web chat, web frontend) |
| Backend | Spring Modulith (`emme-service`) |
| Audience | End customers of salon tenants |
| Status | Backend implemented; dedicated frontend not yet built in this monorepo |

## Functional Requirements

### Customer Authentication

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC001 | Sign in with phone number | As a customer, I want to authenticate using my phone number so I can access my booking history and profile. | Backend |
| FR-WC002 | Sign in with social identity | As a customer, I want to sign in using Google, Apple, or other providers so I don't need a separate password. | Backend (Draft) |
| FR-WC003 | Update my profile | As a customer, I want to update my name, contact details, and preferences. | Backend |

### Conversational Interaction

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC004 | Send message via WhatsApp | As a customer, I want to send a message through the salon's WhatsApp number and get a response. | Backend |
| FR-WC005 | Use web chat | As a customer, I want to chat with the salon through a web chat widget. | Backend |
| FR-WC006 | Send voice notes | As a customer, I want to send voice notes that the system transcribes and understands. | Backend |
| FR-WC007 | Send nail design images | As a customer, I want to send a photo of a nail design I like so the system can recommend matching services. | Backend |

### AI-Powered Assistance

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC008 | Get service recommendations | As a customer, I want the AI to suggest salon services based on what I describe. | Backend |
| FR-WC009 | Get price estimates | As a customer, I want the AI to tell me how much a service would cost based on the salon's actual pricing. | Backend |
| FR-WC010 | Ask policy questions | As a customer, I want to ask about salon policies (hours, cancellations, etc.) and get accurate answers. | Backend |

### Booking

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC011 | Search available slots | As a customer, I want to find open appointment times for a service and date. | Backend |
| FR-WC012 | Book appointment | As a customer, I want to book an appointment for a service, date, and time. | Backend |
| FR-WC013 | Confirm booking | As a customer, I want the system to ask me to confirm before finalizing a booking. | Backend |
| FR-WC014 | Reschedule appointment | As a customer, I want to move my appointment to a different time. | Backend |
| FR-WC015 | Cancel appointment | As a customer, I want to cancel my appointment if I can't make it. | Backend |

### Discovery

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC016 | Browse services and prices | As a customer, I want to see what services the salon offers with descriptions and prices. | Backend |
| FR-WC017 | Browse nail design catalog | As a customer, I want to browse the salon's nail design inspiration gallery. | Backend |

### Calendar & Notifications

| ID | Title | User Story | Status |
|---|---|---|---|
| FR-WC018 | Sync appointment to my calendar | As a customer, I want my confirmed appointment automatically added to my Google Calendar. | Backend |
| FR-WC019 | Receive appointment reminder | As a customer, I want to get a WhatsApp reminder before my appointment. | Backend |
