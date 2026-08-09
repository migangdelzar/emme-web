import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(import.meta.dirname, '..');
const forbiddenImport = /(?:from|import)\s*\(?\s*['\"](?:react|react-dom|@tanstack|@emme\/(?:api|infrastructure))|\b(?:window|document|fetch)\b/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (path.includes('/__tests__/')) {
      return [];
    }
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : path.endsWith('.ts') || path.endsWith('.tsx')
        ? [path]
        : [];
  });
}

describe('@emme/business package boundary', () => {
  it('does not depend on UI, transport, infrastructure, or browser code', () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return forbiddenImport.test(source) ? [path] : [];
    });

    expect(violations).toEqual([]);
  });

  it('publishes capability entry points', async () => {
    await expect(import('@emme/business/appointments')).resolves.toBeDefined();
    await expect(import('@emme/business/clients')).resolves.toBeDefined();
    await expect(import('@emme/business/services')).resolves.toBeDefined();
  });
});
