import type { APIRequestContext } from '@playwright/test';

function required(name: 'E2E_KEYCLOAK_USERNAME' | 'E2E_KEYCLOAK_PASSWORD'): string {
  const value = process.env[name];
  if (!value) throw new Error(`Full-stack E2E requires ${name}`);
  return value;
}

export function fullStackCredentials() {
  return {
    username: required('E2E_KEYCLOAK_USERNAME'),
    password: required('E2E_KEYCLOAK_PASSWORD'),
  };
}

export async function assertFullStackReady(request: APIRequestContext) {
  fullStackCredentials();
  const checks = [
    ['frontend', 'http://localhost:3000/'],
    ['keycloak', 'http://localhost:18080/realms/emme/.well-known/openid-configuration'],
    ['backend', 'http://localhost:8081/actuator/health'],
  ] as const;

  for (const [name, url] of checks) {
    const response = await request.get(url, { failOnStatusCode: false });
    if (!response.ok()) {
      throw new Error(`${name} preflight failed: ${response.status()} ${url}`);
    }
  }
}
