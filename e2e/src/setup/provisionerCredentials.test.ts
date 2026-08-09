import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseProvisionerCredentials } from './provisionerCredentials';

describe('parseProvisionerCredentials', () => {
  it('derives the tenant owner email from provisioner username and tenant slug', () => {
    const credentials = parseProvisionerCredentials(
      [
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME: "owner"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD: "test-only-password"',
      ].join('\n'),
      'e2e-studio'
    );

    assert.deepEqual(credentials, {
      username: 'owner@e2e-studio.local',
      password: 'test-only-password',
    });
  });

  it('preserves an already-qualified provisioner username', () => {
    const credentials = parseProvisionerCredentials(
      [
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME: "owner@example.test"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD: "test-only-password"',
      ].join('\n'),
      'e2e-studio'
    );

    assert.equal(credentials.username, 'owner@example.test');
  });

  it('fails with an actionable error when the provisioner values are absent', () => {
    assert.throws(
      () => parseProvisionerCredentials('services: {}', 'e2e-studio'),
      /E2E provisioner credentials were not found/
    );
  });
});
