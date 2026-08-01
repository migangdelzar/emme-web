/**
 * @emme/api-client — GraphQL client with tenant-aware fetch.
 */
export const PACKAGE_VERSION = "0.0.0";

export type {
  AccessTokenProvider,
  ApiClient,
  ApiClientOptions,
  HttpClient,
  TenantSlugProvider,
} from "./client.js";
export { createApiClient } from "./client.js";
export { ApiHttpError, type ApiProblem } from "./errors.js";
