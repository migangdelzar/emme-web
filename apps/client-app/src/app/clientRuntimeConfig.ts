export interface ClientRuntimeEnvironment {
  readonly VITE_API_BASE_URL?: string;
}

export function resolveClientApiBaseUrl(
  environment: ClientRuntimeEnvironment,
  browserOrigin: string
): string {
  return environment.VITE_API_BASE_URL?.trim() || browserOrigin;
}
