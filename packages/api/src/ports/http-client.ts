/** Narrow unknown HTTP payloads before mapping them to application models. */
export type JsonRecord = Record<string, unknown>;

/** Minimal outbound HTTP port required by contract-specific API adapters. */
export interface HttpClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export function asRecord(value: unknown, resource: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid ${resource} response`);
  }
  return value as JsonRecord;
}

export function asRecordArray(value: unknown, resource: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${resource} collection response`);
  }
  return value.map((item) => asRecord(item, resource));
}

export function stringField(record: JsonRecord, field: string, resource: string): string {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${resource} response: ${field} must be a string`);
  }
  return value;
}

export function optionalStringField(record: JsonRecord, field: string): string | undefined {
  const value = record[field];
  return typeof value === 'string' ? value : undefined;
}

export function numberField(record: JsonRecord, field: string, fallback = 0): number {
  const value = record[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function booleanField(record: JsonRecord, field: string, fallback = false): boolean {
  const value = record[field];
  return typeof value === 'boolean' ? value : fallback;
}

export function firstStringField(record: JsonRecord, fields: readonly string[], fallback = ''): string {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string') return value;
  }
  return fallback;
}

export function firstNumberField(record: JsonRecord, fields: readonly string[], fallback = 0): number {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return fallback;
}

export function firstBooleanField(record: JsonRecord, fields: readonly string[], fallback = false): boolean {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'boolean') return value;
  }
  return fallback;
}
