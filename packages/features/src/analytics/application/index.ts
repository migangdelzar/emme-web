export type { AnalyticsRepository } from './ports.js';
import type { AnalyticsRepository } from './ports.js';
export function getDashboardSnapshot(repository: AnalyticsRepository) { return (range: Parameters<AnalyticsRepository['dashboard']>[0]) => repository.dashboard(range); }
