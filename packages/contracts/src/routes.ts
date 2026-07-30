/** Single source of truth for all API and page paths. */

export const API = {
  ME: "/api/me",
  TENANTS: "/api/v1/tenants",
  APPOINTMENTS: "/api/v1/appointments",
  SERVICES: "/api/v1/services",
  CUSTOMERS: "/api/v1/customers",
  ARTISTS: "/api/v1/artists",
  FINANCES: "/api/v1/finances",
  DASHBOARD_STREAM: "/api/v1/dashboard/stream",
  BUSINESS_CONFIG: "/api/v1/business-config",
  IDENTITY_ROLES: "/api/v1/identity/roles",
  IDENTITY_MEMBERSHIPS: "/api/v1/identity/memberships",
  AI_CHAT: "/api/v1/ai/chat",
  CALENDAR_SYNC: "/api/v1/calendar/sync-states",
  GOOGLE_OAUTH: "/api/v1/google/oauth",
  GOOGLE_SHEETS: "/api/v1/google/sheets",
  DOCUMENTS: "/api/v1/documents",
  NOTIFICATIONS: "/api/v1/notifications",
  PAYMENTS: "/api/v1/payments",
  SUBSCRIPTIONS: "/api/v1/subscriptions",
  WEBHOOK_WHATSAPP: "/api/v1/webhooks/whatsapp",
  OAUTH_AUTHORIZE: "/oauth2/authorization/keycloak",
  OAUTH_LOGOUT: "/oauth2/logout",
  HEALTH: "/actuator/health",
  METRICS: "/actuator/metrics",
  API_DOCS: "/api-docs",
} as const;

export const PAGE = {
  LANDING: "/",
  DASHBOARD: "/#/dashboard",
  AGENDA: "/#/agenda",
  SERVICES: "/#/services",
  CLIENTS: "/#/clients",
  FINANCES: "/#/finances",
  SETTINGS: "/#/settings",
} as const;

export type ApiRoute = (typeof API)[keyof typeof API];
export type PageRoute = (typeof PAGE)[keyof typeof PAGE];
