import { test, expect } from '@playwright/test';

test.describe('Client customer Google sign-in', () => {
  test.setTimeout(120000);

  test('redirects the customer login button to Google through Keycloak', async ({ page }) => {
    test.skip(
      process.env.E2E_CLIENT_REAL !== 'true',
      'Client real-provider check requires the client HMR server and Keycloak'
    );

    await page.route('https://accounts.google.com/**', (route) => route.abort());
    await page.goto('/');

    const googleAuthorizationRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        url.hostname === 'accounts.google.com' &&
        url.pathname === '/o/oauth2/v2/auth'
      );
    });

    await page.getByRole('button', { name: 'Continue with Google' }).click({
      noWaitAfter: true,
    });

    const request = await googleAuthorizationRequest;
    const url = new URL(request.url());

    expect(url.hostname).toBe('accounts.google.com');
    expect(url.pathname).toBe('/o/oauth2/v2/auth');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:18080/realms/emme-customers/broker/google/endpoint'
    );
  });
});
