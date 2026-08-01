export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  instance?: string;
}

export class ApiHttpError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "ApiHttpError";
    Object.defineProperty(this, "code", {
      value: readProblemCode(body),
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  public declare readonly code: string | undefined;
}

function readProblemCode(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const code = (body as ApiProblem).code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
}
