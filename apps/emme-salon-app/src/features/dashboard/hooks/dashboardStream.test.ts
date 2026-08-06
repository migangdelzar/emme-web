import { describe, expect, it } from 'vitest';

import { createDashboardStreamUrl } from './dashboardStream';

describe('createDashboardStreamUrl', () => {
  it('builds the dashboard stream URL on the frontend origin', () => {
    expect(createDashboardStreamUrl('https://app.example.com')).toBe(
      'https://app.example.com/api/dashboard/stream'
    );
  });
});
