export interface MetricRange { readonly tenantId: string; readonly from: string; readonly to: string; readonly timezone: string; }
export interface RevenueSummary { readonly amountMinor: number; readonly currency: string; }
export interface AppointmentSummary { readonly total: number; readonly completed: number; readonly cancelled: number; }
export interface DashboardSnapshot { readonly range: MetricRange; readonly revenue: RevenueSummary; readonly appointments: AppointmentSummary; }
export class InvalidMetricRangeError extends Error { readonly code = 'INVALID_METRIC_RANGE'; }
export function createMetricRange(value: MetricRange): MetricRange { if (!value.tenantId || value.from > value.to) throw new InvalidMetricRangeError('Metric range is invalid'); return { ...value }; }
