import { describe, expect, it } from 'vitest';
import { createClientOidcSettings } from './clientOidc.js';

describe('client OIDC settings', () => {
  it('uses the shared customer realm and client-app callback', () => {
    expect(
      createClientOidcSettings(
        {
          VITE_OIDC_ISSUER: 'http://localhost:18080/realms/emme-customers',
          VITE_OIDC_CLIENT_ID: 'client-app',
        },
        'http://localhost:3001'
      )
    ).toEqual({
      authority: 'http://localhost:18080/realms/emme-customers',
      client_id: 'client-app',
      redirect_uri: 'http://localhost:3001/auth/callback',
      post_logout_redirect_uri: 'http://localhost:3001/',
      response_type: 'code',
      scope: 'openid profile email',
      extraQueryParams: { kc_idp_hint: 'google' },
    });
  });

  it('fails when the customer realm configuration is missing', () => {
    expect(() => createClientOidcSettings({}, 'http://localhost:3001')).toThrow(
      'Client OIDC issuer and client ID are required'
    );
  });
});
