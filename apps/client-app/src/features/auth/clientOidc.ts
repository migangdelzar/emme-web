import { UserManager, WebStorageStateStore, type UserManagerSettings } from 'oidc-client-ts';

export interface ClientOidcEnvironment {
  readonly VITE_OIDC_ISSUER?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
}

export function createClientOidcSettings(
  environment: ClientOidcEnvironment,
  origin: string
): UserManagerSettings {
  const authority = environment.VITE_OIDC_ISSUER?.trim();
  const clientId = environment.VITE_OIDC_CLIENT_ID?.trim();
  if (!authority || !clientId) {
    throw new Error('Client OIDC issuer and client ID are required');
  }

  const normalizedOrigin = origin.replace(/\/$/, '');
  return {
    authority,
    client_id: clientId,
    redirect_uri: `${normalizedOrigin}/auth/callback`,
    post_logout_redirect_uri: `${normalizedOrigin}/`,
    response_type: 'code',
    scope: 'openid profile email',
  };
}

export function createClientOidcManager(): UserManager {
  const settings = createClientOidcSettings(
    import.meta.env as ClientOidcEnvironment,
    window.location.origin
  );
  return new UserManager({
    ...settings,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  });
}

export async function startClientSocialLogin(): Promise<void> {
  await createClientOidcManager().signinRedirect();
}

export async function completeClientSocialLogin(): Promise<void> {
  const user = await createClientOidcManager().signinCallback();
  localStorage.setItem('access_token', user.access_token);
  if (user.refresh_token) localStorage.setItem('refresh_token', user.refresh_token);
  window.location.replace('/');
}
