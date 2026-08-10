/**
 * @emme/api — typed backend contracts, ports, and capability adapters.
 *
 * Barrel re-export. See individual domain modules for details:
 *   common/, auth/, clients/, services/, appointments/, integrations/, ports/, testing/
 */
export * from './common/common.types.js';
export * from './common/routes.js';
export * from './contracts/index.js';
export * from './auth/auth.types.js';
export * from './auth/api.js';
export * from './clients/api.js';
export * from './services/api.js';
export * from './appointments/api.js';
export * from './integrations/google-oauth/api.js';
export * from './integrations/google-sheets/api.js';
export * from './integrations/calendar-sync/api.js';
export * from './configuration/api.js';
export * from './ports/http-client.js';
export * from './testing/provider.js';
export * from './client/index.js';
export * from './tenant/index.js';
export { createApi, type Api } from './create-api.js';
