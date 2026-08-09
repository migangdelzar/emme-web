import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface E2ECredentials {
  username: string;
  password: string;
}

function extractValue(source: string, key: string): string | undefined {
  const match = source.match(
    new RegExp(`${key}:?\\s*(?:"([^"]+)"|'([^']+)'|([^\\s#]+))`)
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

export function parseProvisionerCredentials(source: string, tenantSlug: string): E2ECredentials {
  const ownerUsername = extractValue(
    source,
    'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_USERNAME'
  );
  const password = extractValue(source, 'APP_KEYCLOAK_PROVISIONING_INITIAL_ADMIN_PASSWORD');

  if (!ownerUsername || !password) {
    throw new Error(
      'E2E provisioner credentials were not found; start emme-service provisioning or set E2E_KEYCLOAK_USERNAME and E2E_KEYCLOAK_PASSWORD.'
    );
  }

  return {
    username: ownerUsername.includes('@') ? ownerUsername : `${ownerUsername}@${tenantSlug}.local`,
    password,
  };
}

export function resolveRealE2ECredentials(
  env: NodeJS.ProcessEnv = process.env,
  tenantSlug = env.E2E_TENANT_SLUG?.trim() || 'e2e-studio'
): E2ECredentials {
  const username = env.E2E_KEYCLOAK_USERNAME?.trim();
  const password = env.E2E_KEYCLOAK_PASSWORD?.trim();
  if (username && password) return { username, password };

  const composeFile =
    env.E2E_PROVISIONER_COMPOSE_FILE?.trim() ||
    resolve(import.meta.dirname, '../../../../emme-service/deployment/compose/compose.environment-e2e.yaml');

  if (!existsSync(composeFile)) {
    throw new Error(
      `E2E provisioner configuration was not found at ${composeFile}; set E2E_PROVISIONER_COMPOSE_FILE or provide the CI credential variables.`
    );
  }

  return parseProvisionerCredentials(readFileSync(composeFile, 'utf8'), tenantSlug);
}
