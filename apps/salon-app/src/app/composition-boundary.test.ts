import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('salon composition root', () => {
  it('constructs HTTP and auth adapters only in AppProviders', () => {
    const source = readFileSync('src/app/AppProviders.tsx', 'utf8');
    expect(source).toContain('createHttpClient');
    expect(source).toContain('createTokenStorage');
    expect(source).not.toContain("fetch('/api/");
  });
});
