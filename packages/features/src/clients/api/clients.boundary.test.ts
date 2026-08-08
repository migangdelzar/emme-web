import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('clients query boundary', () => {
  it('does not construct API or repository adapters at module scope', () => {
    const source = readFileSync('src/clients/api/clients.queries.ts', 'utf8');

    expect(source).toContain('useApi');
    expect(source).not.toContain('const customersContract =');
    expect(source).not.toContain('const clientRepository =');
  });
});
