import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface StorageState {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

export interface ProvisionedSalonAuthFile {
  version: 1;
  tenantSlug: string;
  users: Record<string, { storageState: StorageState }>;
}

function defaultAuthDirectory(): string {
  return resolve(import.meta.dirname, '../.auth/provisioned-auth');
}

function provisionedAuthFilePath(env: NodeJS.ProcessEnv, tenantSlug: string): string {
  const explicitFile = env.E2E_PROVISIONER_AUTH_FILE?.trim();
  if (explicitFile) return explicitFile;
  const directory = env.E2E_PROVISIONER_AUTH_DIR?.trim() || defaultAuthDirectory();
  return resolve(directory, `${tenantSlug}.json`);
}

export function parseProvisionedSalonAuthFile(source: string): ProvisionedSalonAuthFile {
  const value = JSON.parse(source) as Partial<ProvisionedSalonAuthFile>;
  if (
    value.version !== 1 ||
    !value.tenantSlug ||
    !value.users ||
    typeof value.users !== 'object'
  ) {
    throw new Error(
      'E2E provisioned salon auth file must contain version 1, tenantSlug, and a users object.'
    );
  }
  return value as ProvisionedSalonAuthFile;
}

export function resolveRealAuthStatePath(env: NodeJS.ProcessEnv = process.env): string {
  const tenantSlug = env.E2E_TENANT_SLUG?.trim() || 'e2e-studio';
  const role = env.E2E_USER_ROLE?.trim() || 'owner';
  return resolve(process.cwd(), '.auth', `${tenantSlug}-${role}-selected.json`);
}

export function readProvisionedSalonAuthState(
  env: NodeJS.ProcessEnv = process.env
): StorageState | null {
  const tenantSlug = env.E2E_TENANT_SLUG?.trim() || 'e2e-studio';
  const role = env.E2E_USER_ROLE?.trim() || 'owner';
  const authFilePath = provisionedAuthFilePath(env, tenantSlug);
  if (!existsSync(authFilePath)) return null;

  const authFile = parseProvisionedSalonAuthFile(readFileSync(authFilePath, 'utf8'));
  if (authFile.tenantSlug !== tenantSlug) {
    throw new Error(
      `Provisioned auth file is for ${authFile.tenantSlug}, not selected tenant ${tenantSlug}.`
    );
  }
  return authFile.users[role]?.storageState ?? null;
}
