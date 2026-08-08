import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('services query boundary', () => {
  it('uses the injected API context instead of a module-level REST client', () => {
    const source = readFileSync('src/features/services/api/services.queries.ts', 'utf8');

    expect(source).toContain('useApi');
    expect(source).not.toContain("from '@/api/restClient'");
    expect(source).not.toContain('const servicesContract =');
  });
});
