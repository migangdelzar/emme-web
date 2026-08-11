export interface HealthDto {
  status: 'UP' | 'DOWN';
  checks?: Array<{
    name: string;
    status: 'UP' | 'DOWN';
    data?: Record<string, unknown>;
  }>;
}
