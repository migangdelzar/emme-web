export interface ApiErrorDto {
  message: string;
  code?: string;
  fields?: Record<string, string>;
}
