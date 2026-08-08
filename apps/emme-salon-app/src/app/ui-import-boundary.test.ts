import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

const approvedRetainedUiImports: Record<string, readonly string[]> = {
  'PhoneInput.tsx': ['react', '@emme/ui', '@/shared/lib/utils'],
  'sonner.tsx': ['sonner'],
};
const approvedAppOwnedUiImports = new Set([
  '@/shared/ui/PhoneInput',
  '@/shared/ui/PhoneInput.tsx',
  '@/shared/ui/sonner',
  '@/shared/ui/sonner.tsx',
]);

describe('shared UI import boundary', () => {
  it('does not import generic UI primitives from the app-local shared UI directory', () => {
    const sourceDirectory = join(process.cwd(), 'src');
    const violations = collectSourceFiles(sourceDirectory).flatMap((sourceFile) => {
      const source = readFileSync(sourceFile, 'utf8');
      return findForbiddenGenericUiImports(source).map(
        (specifier) => `${sourceFile}: ${specifier}`
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

  it('rejects side-effect static imports of generic app-local UI', () => {
    expect(findForbiddenGenericUiImports("import '@/shared/ui/button';")).toEqual([
      '@/shared/ui/button',
    ]);
  });

  it('rejects comment-separated retained-source import forms', () => {
    const source = [
      "export * from /* comment */ './input.tsx';",
      "void import /* comment */ ('./input.tsx');",
    ].join('\n');

    expect(findUnapprovedRetainedUiImports('PhoneInput.tsx', source)).toEqual([
      './input.tsx',
      './input.tsx',
    ]);
  });
});

function findUnapprovedRetainedUiImports(fileName: string, source: string): string[] {
  const approvedImports = approvedRetainedUiImports[fileName];

  if (!approvedImports) throw new Error(`Missing approved imports for ${fileName}`);

  return collectImportSpecifiers(source).filter(
    (specifier) => !approvedImports.includes(specifier)
  );
}

function findForbiddenGenericUiImports(source: string): string[] {
  return collectImportSpecifiers(source).filter(
    (specifier) => specifier.startsWith('@/shared/ui') && !approvedAppOwnedUiImports.has(specifier)
  );
}

function collectImportSpecifiers(source: string): string[] {
  const sourceFile = ts.createSourceFile(
    'ui-import-boundary.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const specifiers: string[] = [];

  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
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
