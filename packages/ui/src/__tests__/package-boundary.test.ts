import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { Button } from '../index.js';

describe('@emme/ui package boundary', () => {
  it('exports the first shared component from the public barrel', () => {
    expect(typeof Button).toBe('function');
  });

  it('does not import business or infrastructure packages', () => {
    const sourceDirectory = new URL('..', import.meta.url);
    const sourceFiles = collectSourceFiles(sourceDirectory);

    for (const sourceFile of sourceFiles) {
      const source = readFileSync(sourceFile, 'utf8');

      expect(source, sourceFile).not.toMatch(
        /(?:from\s+|import\s*\()['"][^'"]*(?:@emme\/(?:domain|application|api|infrastructure)|(?:^|\/)apps\/)/,
      );
    }
  });
});

function collectSourceFiles(directory: URL): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory.pathname, entry.name);

    if (entry.isDirectory()) return collectSourceFiles(new URL(`file://${path}/`));
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
