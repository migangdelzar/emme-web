import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseProvisionedSalonAuthFile,
  readProvisionedSalonAuthState,
  resolveRealAuthStatePath,
} from './authState';

describe('per-salon Playwright auth state', () => {
  it('parses one salon file containing multiple role states', () => {
    const authFile = parseProvisionedSalonAuthFile(
      JSON.stringify({
        version: 1,
        tenantSlug: 'e2e-studio',
        users: {
          owner: { storageState: { cookies: [], origins: [] } },
          staff: { storageState: { cookies: [], origins: [] } },
        },
      })
    );

    assert.deepEqual(authFile.users.staff.storageState, { cookies: [], origins: [] });
  });

  it('uses a deterministic selected-state path for the chosen salon and role', () => {
    assert.equal(
      resolveRealAuthStatePath({ E2E_TENANT_SLUG: 'e2e-salon', E2E_USER_ROLE: 'staff' }),
      `${process.cwd()}/.auth/e2e-salon-staff-selected.json`
    );
  });

  it('returns no state when the provisioner has not produced the salon file', () => {
    assert.equal(
      readProvisionedSalonAuthState({
        E2E_TENANT_SLUG: 'missing-salon',
        E2E_PROVISIONER_AUTH_DIR: '/tmp/emme-e2e-no-such-directory',
      }),
      null
    );
  });

  it('reads the selected role state from the salon JSON file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'emme-e2e-auth-'));
    const authFile = join(directory, 'e2e-salon.json');
    writeFileSync(
      authFile,
      JSON.stringify({
        version: 1,
        tenantSlug: 'e2e-salon',
        users: {
          owner: { storageState: { cookies: [], origins: [] } },
          staff: { storageState: { cookies: [], origins: [] } },
        },
      })
    );

    try {
      assert.deepEqual(
        readProvisionedSalonAuthState({
          E2E_TENANT_SLUG: 'e2e-salon',
          E2E_USER_ROLE: 'staff',
          E2E_PROVISIONER_AUTH_FILE: authFile,
        }),
        { cookies: [], origins: [] }
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
