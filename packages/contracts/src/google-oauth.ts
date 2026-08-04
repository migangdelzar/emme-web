import { API } from "./routes.js";
import type { HttpClient } from "./transport.js";

export interface GoogleOAuthStatus {
  connected: boolean;
  email?: string;
}

export interface GoogleOAuthApi {
  status(): Promise<GoogleOAuthStatus>;
  disconnect(): Promise<void>;
}

export function createGoogleOAuthApi(http: HttpClient): GoogleOAuthApi {
  return {
    status: async () => http.get<GoogleOAuthStatus>(`${API.GOOGLE_OAUTH}/status`),
    disconnect: async () => http.delete<void>(`${API.GOOGLE_OAUTH}/disconnect`),
  };
}
