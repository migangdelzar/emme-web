export interface ApiResponse<TData> {
  readonly status: number;
  readonly data: TData;
  readonly headers: Readonly<Record<string, string>>;
}
