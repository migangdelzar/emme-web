import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('@emme/features package boundary', () => {
  it('does not import application internals or concrete infrastructure', () => {
    const sourceFiles = collectSourceFiles(new URL('..', import.meta.url));
    const forbidden = /(?:from\s+|import\s*\()['"](?:@emme\/infrastructure|apps\/|[^'"]*\/apps\/)/;

    for (const sourceFile of sourceFiles) {
      expect(readFileSync(sourceFile, 'utf8'), sourceFile).not.toMatch(forbidden);
    }
  });
});

function collectSourceFiles(directory: URL): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory.pathname, entry.name);
    if (entry.name === '__tests__' || entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      return [];
    }
    if (entry.isDirectory()) return collectSourceFiles(new URL(`file://${path}/`));
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
