/**
 * @emme/api-client — tenant-aware REST transport and typed platform clients.
 */
export const PACKAGE_VERSION = "0.0.0";

export type {
  AccessTokenProvider,
  ApiClient,
  ApiClientOptions,
  HttpClient,
  TenantSlugProvider,
} from "./client.js";
export { createApiClient, createHttpClient } from "./client.js";
export { ApiHttpError, type ApiProblem } from "./errors.js";
