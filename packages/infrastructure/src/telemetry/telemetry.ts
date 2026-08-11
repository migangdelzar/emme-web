export type TelemetryProperties = Readonly<Record<string, unknown>>;

export interface Telemetry {
  track(event: string, properties?: TelemetryProperties): void;
  captureError(error: unknown, properties?: TelemetryProperties): void;
}

const sensitiveKeys = new Set(['accessToken', 'authorization', 'cookie', 'password', 'refreshToken', 'token']);

export function redactTelemetry(properties: TelemetryProperties): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => !sensitiveKeys.has(key)),
  );
}

export function createNoopTelemetry(): Telemetry {
  return {
    track: () => undefined,
    captureError: () => undefined,
  };
}
