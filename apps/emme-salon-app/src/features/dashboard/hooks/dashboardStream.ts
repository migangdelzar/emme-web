const DASHBOARD_STREAM_PATH = '/api/dashboard/stream';

export function createDashboardStreamUrl(webOrigin: string): string {
  return new URL(DASHBOARD_STREAM_PATH, webOrigin).toString();
}
