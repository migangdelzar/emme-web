import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseProvisionedSalonAuthFile } from './authState';

export interface E2ECredentials {
  username: string;
  password: string;
}

function provisionedAuthFilePath(env: NodeJS.ProcessEnv, tenantSlug: string): string {
  const explicitFile = env.E2E_PROVISIONER_AUTH_FILE?.trim();
  if (explicitFile) return explicitFile;
  const directory =
    env.E2E_PROVISIONER_AUTH_DIR?.trim() ||
    resolve(import.meta.dirname, '../.auth/provisioned-auth');
  return resolve(directory, `${tenantSlug}.json`);
}

function extractValue(source: string, key: string): string | undefined {
  const match = source.match(
    new RegExp(`${key}:?\\s*(?:"([^"]+)"|'([^']+)'|([^\\s#]+))`)
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

export function parseProvisionerCredentials(
  source: string,
  tenantSlug: string,
  role: 'admin' | 'owner' = 'owner'
): E2ECredentials {
  const prefix = role === 'owner' ? 'OWNER' : 'ADMIN';
  const username =
    extractValue(source, `APP_KEYCLOAK_PROVISIONING_INITIAL_${prefix}_USERNAME`) ??
    (role === 'owner'
      ? extractValue(source, 'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME')
      : undefined);
  const password =
    extractValue(source, `APP_KEYCLOAK_PROVISIONING_INITIAL_${prefix}_PASSWORD`) ??
    (role === 'owner'
      ? extractValue(source, 'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD')
      : undefined);

  if (!username || !password) {
    throw new Error(
      'E2E provisioner credentials were not found; start emme-service provisioning or set E2E_KEYCLOAK_USERNAME and E2E_KEYCLOAK_PASSWORD.'
    );
  }

  return {
    username: username.includes('@') ? username : `${username}@${tenantSlug}.local`,
    password,
  };
}

export function readProvisionedSalonCredentials(
  env: NodeJS.ProcessEnv = process.env,
  tenantSlug = env.E2E_TENANT_SLUG?.trim() || 'e2e-studio'
): E2ECredentials | null {
  const authFilePath = provisionedAuthFilePath(env, tenantSlug);
  if (!existsSync(authFilePath)) return null;

  const authFile = parseProvisionedSalonAuthFile(readFileSync(authFilePath, 'utf8'));
  if (authFile.tenantSlug !== tenantSlug) {
    throw new Error(
      `Provisioned auth file is for ${authFile.tenantSlug}, not selected tenant ${tenantSlug}.`
    );
  }
  const role = env.E2E_USER_ROLE?.trim() === 'admin' ? 'admin' : 'owner';
  return authFile.users[role]?.credentials ?? null;
}

export function resolveRealE2ECredentials(
  env: NodeJS.ProcessEnv = process.env,
  tenantSlug = env.E2E_TENANT_SLUG?.trim() || 'e2e-studio'
): E2ECredentials {
  const username = env.E2E_KEYCLOAK_USERNAME?.trim();
  const password = env.E2E_KEYCLOAK_PASSWORD?.trim();
  if (username && password) return { username, password };

  const provisionedCredentials = readProvisionedSalonCredentials(env, tenantSlug);
  if (provisionedCredentials) return provisionedCredentials;

  const composeFile =
    env.E2E_PROVISIONER_COMPOSE_FILE?.trim() ||
    resolve(import.meta.dirname, '../../../../emme-service/deployment/compose/compose.environment-e2e.yaml');

  if (!existsSync(composeFile)) {
    throw new Error(
      `E2E provisioner configuration was not found at ${composeFile}; set E2E_PROVISIONER_COMPOSE_FILE or provide the CI credential variables.`
    );
  }

  return parseProvisionerCredentials(
    readFileSync(composeFile, 'utf8'),
    tenantSlug,
    env.E2E_USER_ROLE?.trim() === 'admin' ? 'admin' : 'owner'
  );
}
