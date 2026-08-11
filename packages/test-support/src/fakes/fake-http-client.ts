export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
}

export interface HttpClient {
  get<TResponse>(path: string): Promise<TResponse>;
  post<TResponse>(path: string, body: unknown): Promise<TResponse>;
}

export class FakeHttpClient implements HttpClient {
  public readonly requests: HttpRequest[] = [];
  public error: Error | null = null;

  private readonly responses: unknown[] = [];

  public enqueue<TResponse>(response: TResponse): void {
    this.responses.push(response);
  }

  public get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>({ method: 'GET', path });
  }

  public post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.request<TResponse>({ method: 'POST', path, body });
  }

  private async request<TResponse>(request: HttpRequest): Promise<TResponse> {
    this.requests.push(request);

    if (this.error !== null) {
      throw this.error;
    }

    const response = this.responses.shift();
    if (response === undefined) {
      throw new Error(`No queued response for ${request.method} ${request.path}`);
    }

    return response as TResponse;
  }
}
