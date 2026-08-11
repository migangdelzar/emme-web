const DASHBOARD_STREAM_PATH = '/api/dashboard/stream';

export interface DashboardStreamEvent {
  type: string;
  data: string;
}

export function createDashboardStreamUrl(webOrigin: string): string {
  return new URL(DASHBOARD_STREAM_PATH, webOrigin).toString();
}

export function createDashboardStreamRequest(
  accessToken: string | null,
  tenantSlug: string | null
): RequestInit {
  return {
    headers: {
      Accept: 'text/event-stream',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(tenantSlug ? { 'X-Emme-Tenant-Slug': tenantSlug } : {}),
    },
  };
}

export function parseDashboardStream(input: string): {
  events: DashboardStreamEvent[];
  remainder: string;
} {
  const normalized = input.replaceAll('\r\n', '\n');
  const frames = normalized.split('\n\n');
  const remainder = frames.pop() ?? '';
  const events = frames.flatMap((frame) => {
    let type = 'message';
    const data: string[] = [];

    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) type = line.slice('event:'.length).trim();
      if (line.startsWith('data:')) data.push(line.slice('data:'.length).trimStart());
    }

    return data.length > 0 ? [{ type, data: data.join('\n') }] : [];
  });

  return { events, remainder };
}
