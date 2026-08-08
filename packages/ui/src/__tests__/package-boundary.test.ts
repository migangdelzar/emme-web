import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { Button } from '../index.js';

const forbiddenImportPattern =
  /(?:from\s+|import\s*\()['"](?:@emme\/(?:domain|application|api|infrastructure)|apps\/|[^'"]*\/apps\/)/;

describe('@emme/ui package boundary', () => {
  it('exports the first shared component from the public barrel', () => {
    expect(typeof Button).toBe('function');
  });

  it('does not import business or infrastructure packages', () => {
    const sourceDirectory = new URL('..', import.meta.url);
    const sourceFiles = collectSourceFiles(sourceDirectory);

    for (const sourceFile of sourceFiles) {
      const source = readFileSync(sourceFile, 'utf8');

      expect(source, sourceFile).not.toMatch(forbiddenImportPattern);
    }
  });

  it('recognizes root-level and nested app import specifiers as forbidden', () => {
    expect("import Root from 'apps/root'").toMatch(forbiddenImportPattern);
    expect("import Nested from 'features/apps/nested'").toMatch(forbiddenImportPattern);
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
