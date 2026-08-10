import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseProvisionerCredentials,
  readProvisionedSalonCredentials,
} from './provisionerCredentials';

describe('parseProvisionerCredentials', () => {
  it('derives the tenant owner email from owner provisioner settings', () => {
    const credentials = parseProvisionerCredentials(
      [
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME: "admin"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD: "admin-password"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_OWNER_USERNAME: "owner"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_OWNER_PASSWORD: "test-only-password"',
      ].join('\n'),
      'e2e-studio',
      'owner'
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
      'e2e-studio',
      'owner'
    );

    assert.equal(credentials.username, 'owner@example.test');
  });

  it('resolves the tenant admin credentials independently from the owner', () => {
    const credentials = parseProvisionerCredentials(
      [
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME: "admin"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD: "admin-password"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_OWNER_USERNAME: "owner"',
        'APP_KEYCLOAK_PROVISIONING_INITIAL_OWNER_PASSWORD: "owner-password"',
      ].join('\n'),
      'e2e-studio',
      'admin'
    );

    assert.deepEqual(credentials, {
      username: 'admin@e2e-studio.local',
      password: 'admin-password',
    });
  });

  it('fails with an actionable error when the provisioner values are absent', () => {
    assert.throws(
      () => parseProvisionerCredentials('services: {}', 'e2e-studio'),
      /E2E provisioner credentials were not found/
    );
  });

  it('reads role credentials from the provisioner-generated salon artifact', () => {
    const directory = mkdtempSync(join(tmpdir(), 'emme-e2e-auth-'));
    const authFile = join(directory, 'e2e-studio.json');
    writeFileSync(
      authFile,
      JSON.stringify({
        version: 1,
        tenantSlug: 'e2e-studio',
        users: {
          admin: {
            credentials: { username: 'admin@e2e-studio.local', password: 'admin-pass' },
            storageState: { cookies: [], origins: [] },
          },
          owner: {
            credentials: { username: 'owner@e2e-studio.local', password: 'owner-pass' },
            storageState: { cookies: [], origins: [] },
          },
        },
      })
    );

    try {
      assert.deepEqual(
        readProvisionedSalonCredentials({
          E2E_TENANT_SLUG: 'e2e-studio',
          E2E_USER_ROLE: 'admin',
          E2E_PROVISIONER_AUTH_FILE: authFile,
        }),
        { username: 'admin@e2e-studio.local', password: 'admin-pass' }
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
