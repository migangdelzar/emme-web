type RuntimeConfigInput = Record<string, unknown>;

export type AppEnvironment = 'local' | 'dev' | 'regression' | 'staging' | 'prod';

export interface RuntimeConfig {
  appEnv: AppEnvironment;
  apiBaseUrl: string;
  webBaseDomain: string;
  sentryDsn: string | null;
}

const REQUIRED_PUBLIC_KEYS = ['VITE_API_BASE_URL', 'VITE_WEB_BASE_DOMAIN'] as const;

const SECRET_KEY_PATTERNS = [
  /SECRET/i,
  /PASSWORD/i,
  /TOKEN/i,
  /DATABASE_URL/i,
  /PRIVATE/i,
  /META_APP_SECRET/i,
  /GOOGLE_CLIENT_SECRET/i,
  /GEMINI_API_KEY/i,
  /KEYCLOAK_ADMIN/i,
  /GATEWAY_AUTOMATION_TOKEN/i,
];

const ENVIRONMENTS = new Set<AppEnvironment>([
  'local',
  'dev',
  'regression',
  'staging',
  'prod',
]);

export function parseRuntimeConfig(input: RuntimeConfigInput): RuntimeConfig {
  rejectSecretLikeKeys(input);

  for (const key of REQUIRED_PUBLIC_KEYS) {
    if (!readString(input, key)) {
      throw new Error(`Missing public runtime config: ${key}`);
    }
  }

  return {
    appEnv: parseAppEnvironment(readString(input, 'VITE_APP_ENV') ?? 'local'),
    apiBaseUrl: readString(input, 'VITE_API_BASE_URL')!,
    webBaseDomain: readString(input, 'VITE_WEB_BASE_DOMAIN')!,
    sentryDsn: readString(input, 'VITE_SENTRY_DSN') ?? null,
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  return parseRuntimeConfig({
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_WEB_BASE_DOMAIN: import.meta.env.VITE_WEB_BASE_DOMAIN,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  });
}

function readString(input: RuntimeConfigInput, key: string): string | null {
  const value = input[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseAppEnvironment(value: string): AppEnvironment {
  if (ENVIRONMENTS.has(value as AppEnvironment)) {
    return value as AppEnvironment;
  }
  throw new Error(`Invalid runtime config: VITE_APP_ENV=${value}`);
}

function rejectSecretLikeKeys(input: RuntimeConfigInput): void {
  const secretKey = Object.keys(input).find((key) =>
    SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key))
  );
  if (secretKey) {
    throw new Error(`Secret-like config key is not allowed in the client bundle: ${secretKey}`);
  }
}
