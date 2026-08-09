export type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export interface ApiRequest {
  readonly method: ApiMethod;
  readonly path: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
}
