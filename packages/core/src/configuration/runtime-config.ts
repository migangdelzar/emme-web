export interface RuntimeConfig {
  apiBaseUrl: string;
  webBaseDomain: string;
}

export function assertRuntimeConfig(config: RuntimeConfig): RuntimeConfig {
  if (!config.apiBaseUrl.trim()) {
    throw new Error("API base URL is required");
  }

  if (!config.webBaseDomain.trim()) {
    throw new Error("Web base domain is required");
  }

  return config;
}
