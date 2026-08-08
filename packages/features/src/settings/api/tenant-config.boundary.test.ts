import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('tenant configuration API boundary', () => {
  it('uses the injected typed API instead of app-local HTTP clients', () => {
    const source = readFileSync('src/settings/api/tenant-config.queries.ts', 'utf8');

    expect(source).toContain('@emme/core');
    expect(source).not.toContain('@/api/restClient');
  });
});
