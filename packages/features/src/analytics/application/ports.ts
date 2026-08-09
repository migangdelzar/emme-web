import type { DashboardSnapshot, MetricRange } from '../domain/index.js';
export interface AnalyticsRepository { dashboard(range: MetricRange): Promise<DashboardSnapshot>; }
