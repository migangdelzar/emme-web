import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectSourceFiles(path) : path;
  });
}

describe('client feature ownership', () => {
  it('does not import the retired shared product feature package', () => {
    const sourceDirectory = join(process.cwd(), 'src');
    const leakedImports = collectSourceFiles(sourceDirectory)
      .filter((path) => /\.(?:ts|tsx)$/.test(path) && !path.endsWith('.test.ts'))
      .flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return source.includes('@emme/features') ? [path] : [];
      });

    expect(leakedImports).toEqual([]);
  });
});
