/** Single source of truth for all API and page paths. */

export const API_VERSION = '1.0' as const;

export const API = {
  ME: '/api/me',
  AUTH_LOGIN: '/api/auth/login',
  TENANTS: '/api/tenants',
  APPOINTMENTS: '/api/appointments',
  SERVICES: '/api/services',
  CUSTOMERS: '/api/customers',
  ARTISTS: '/api/artists',
  FINANCES: '/api/finances',
  DASHBOARD_STREAM: '/api/dashboard/stream',
  BUSINESS_CONFIG: '/api/business-config',
  IDENTITY_ROLES: '/api/identity/roles',
  IDENTITY_MEMBERSHIPS: '/api/identity/memberships',
  AI_CHAT: '/api/ai/chat',
  CALENDAR_SYNC: '/api/calendar/sync-states',
  GOOGLE_OAUTH: '/api/google/oauth',
  GOOGLE_SHEETS: '/api/google/sheets',
  DOCUMENTS: '/api/documents',
  NOTIFICATIONS: '/api/notifications',
  PAYMENTS: '/api/payments',
  SUBSCRIPTIONS: '/api/subscriptions',
  WEBHOOK_WHATSAPP: '/api/webhooks/whatsapp',
  OAUTH_AUTHORIZE: '/oauth2/authorization/keycloak',
  OAUTH_LOGOUT: '/oauth2/logout',
  HEALTH: '/actuator/health',
  METRICS: '/actuator/metrics',
  API_DOCS: '/api-docs',
} as const;

export const PAGE = {
  LANDING: '/',
  DASHBOARD: '/#/dashboard',
  AGENDA: '/#/agenda',
  SERVICES: '/#/services',
  CLIENTS: '/#/clients',
  FINANCES: '/#/finances',
  SETTINGS: '/#/settings',
} as const;

export type ApiRoute = (typeof API)[keyof typeof API];
export type PageRoute = (typeof PAGE)[keyof typeof PAGE];
