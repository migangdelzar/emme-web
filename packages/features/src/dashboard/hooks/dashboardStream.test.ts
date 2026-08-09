import { describe, expect, it } from 'vitest';

import { createDashboardStreamRequest, createDashboardStreamUrl, parseDashboardStream } from './dashboardStream';

describe('createDashboardStreamUrl', () => {
  it('builds the dashboard stream URL on the frontend origin', () => {
    expect(createDashboardStreamUrl('https://app.example.com')).toBe(
      'https://app.example.com/api/dashboard/stream'
    );
  });
});

describe('createDashboardStreamRequest', () => {
  it('adds the bearer token and tenant context required by the real backend', () => {
    expect(createDashboardStreamRequest('access-token', 'e2e-studio')).toEqual({
      headers: {
        Accept: 'text/event-stream',
        Authorization: 'Bearer access-token',
        'X-Emme-Tenant-Slug': 'e2e-studio',
      },
    });
  });
});

describe('parseDashboardStream', () => {
  it('parses complete SSE events and preserves an incomplete trailing event', () => {
    expect(parseDashboardStream('event: notification\ndata: {"message":"Hi"}\n\npartial')).toEqual({
      events: [{ type: 'notification', data: '{"message":"Hi"}' }],
      remainder: 'partial',
    });
  });
});
