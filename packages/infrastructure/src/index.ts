/**
 * @emme/infrastructure — concrete HTTP and external-system adapters.
 */
export const PACKAGE_VERSION = "0.0.0";

export type {
  AccessTokenProvider,
  ApiClient,
  ApiClientOptions,
  HttpClient,
  TenantSlugProvider,
} from "./http/fetch-http-client.js";
export { createApiClient, createHttpClient } from "./http/fetch-http-client.js";
export { ApiHttpError, type ApiProblem } from "./http/api-error.js";
export { createClientRepository } from "./api/client-repository.adapter.js";
export {
  createBrowserTokenStorage,
  createTokenStorage,
  type TokenStorage,
  type Tokens,
} from "./auth/token-storage.js";
