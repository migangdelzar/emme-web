import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const forbiddenGenericUiImport =
  /(?:from\s+|import\s*\()\s*['"]@\/shared\/ui(?:\/(?!(?:PhoneInput|sonner)(?:['"]|\)))[^'"]*)?['"]/g;
const forbiddenLocalPrimitiveDependency =
  /(?:from\s+|import\s*\()\s*['"]\.\/(?:alert-dialog|avatar|badge|button|calendar|card|checkbox|dialog|dropdown-menu|input|label|scroll-area|select|separator|skeleton|switch|table|tabs|textarea|tooltip)['"]/g;

describe('shared UI import boundary', () => {
  it('does not import generic UI primitives from the app-local shared UI directory', () => {
    const sourceDirectory = join(process.cwd(), 'src');
    const violations = collectSourceFiles(sourceDirectory).flatMap((sourceFile) => {
      const source = readFileSync(sourceFile, 'utf8');
      return Array.from(
        source.matchAll(forbiddenGenericUiImport),
        ([specifier]) => `${sourceFile}: ${specifier}`
      );
    });

    expect(violations).toEqual([]);
  });

  it('keeps app-owned UI independent of deleted generic primitives', () => {
    const appOwnedUiDirectory = join(process.cwd(), 'src/shared/ui');
    const violations = ['PhoneInput.tsx', 'sonner.tsx'].flatMap((fileName) => {
      const sourceFile = join(appOwnedUiDirectory, fileName);
      const source = readFileSync(sourceFile, 'utf8');
      return Array.from(
        source.matchAll(forbiddenLocalPrimitiveDependency),
        ([specifier]) => `${sourceFile}: ${specifier}`
      );
    });

    expect(violations).toEqual([]);
  });
});

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.name === 'shared' && directory.endsWith('/src')) {
      return collectSourceFiles(path).filter((sourceFile) => !sourceFile.includes('/shared/ui/'));
    }
    if (entry.isDirectory()) return collectSourceFiles(path);
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) return [];
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
