import { API } from '../common/routes.js';
import type { CurrentUser } from './auth.types.js';
import type { HttpClient } from '../ports/http-client.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: CurrentUser;
}

export interface AuthApi {
  currentUser(): Promise<CurrentUser>;
  login(input: LoginInput): Promise<LoginResponse>;
}

export function createAuthApi(http: HttpClient): AuthApi {
  return {
    currentUser: () => http.get<CurrentUser>(API.ME),
    login: (input) => http.post<LoginResponse>(API.AUTH_LOGIN, input),
  };
}
