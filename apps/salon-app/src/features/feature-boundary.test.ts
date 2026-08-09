import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(import.meta.dirname, '..');
const forbiddenFeatureImport = /@emme\/features(?:['"]|\/)/;
const expectedRoutes = ['/dashboard', '/agenda', '/clients', '/services', '/finances', '/settings'];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (path.includes('.test.')) {
      return [];
    }
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : path.endsWith('.ts') || path.endsWith('.tsx')
        ? [path]
        : [];
  });
}

describe('salon application ownership boundary', () => {
  it('does not import the shared React compatibility package', () => {
    const violations = sourceFiles(sourceRoot).filter((path) =>
      forbiddenFeatureImport.test(readFileSync(path, 'utf8'))
    );

    expect(violations).toEqual([]);
  });

  it('preserves the salon route contract', () => {
    const router = readFileSync(join(sourceRoot, 'app/router.tsx'), 'utf8');

    for (const route of expectedRoutes) {
      expect(router).toContain(`path="${route}"`);
    }
  });
});
