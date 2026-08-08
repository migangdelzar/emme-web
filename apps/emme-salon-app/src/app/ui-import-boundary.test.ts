import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const forbiddenGenericUiImport =
  /(?:from\s+|import\s*\()\s*['"]@\/shared\/ui(?:\/(?!(?:PhoneInput|sonner)(?:['"]|\)))[^'"]*)?['"]/g;
const importSpecifierPattern = /\b(?:from|import)\s*(?:\(\s*)?['"]([^'"]+)['"]/g;
const approvedRetainedUiImports: Record<string, readonly string[]> = {
  'PhoneInput.tsx': ['react', '@emme/ui', '@/shared/lib/utils'],
  'sonner.tsx': ['sonner'],
};

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
      return findUnapprovedRetainedUiImports(fileName, source).map(
        (specifier) => `${sourceFile}: ${specifier}`
      );
    });

    expect(violations).toEqual([]);
  });

  it('rejects aliases, explicit extensions, re-exports, and dynamic imports from retained UI', () => {
    const source = [
      "import '@emme/ui/components/Input.js';",
      "import type { Appointment } from '@/features/appointments/domain/appointment.types';",
      "export { Input } from './input.tsx';",
      "void import('@emme/ui/components/Input.js');",
    ].join('\n');

    expect(findUnapprovedRetainedUiImports('PhoneInput.tsx', source)).toEqual([
      '@emme/ui/components/Input.js',
      '@/features/appointments/domain/appointment.types',
      './input.tsx',
      '@emme/ui/components/Input.js',
    ]);
  });
});

function findUnapprovedRetainedUiImports(fileName: string, source: string): string[] {
  const approvedImports = approvedRetainedUiImports[fileName];

  if (!approvedImports) throw new Error(`Missing approved imports for ${fileName}`);

  return Array.from(source.matchAll(importSpecifierPattern), ([, specifier]) => specifier).filter(
    (specifier) => !approvedImports.includes(specifier)
  );
}

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
