import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('salon feature schema boundary', () => {
  it('has no feature schemas to migrate to the shared validation package', () => {
    expect(findFeatureSchemaReferences(readFeatureSourceFiles())).toEqual([]);
  });
});

type SourceFile = readonly [path: string, source: string];

function findFeatureSchemaReferences(sourceFiles: readonly SourceFile[]): string[] {
  return sourceFiles
    .filter(([path, source]) => isSchemaPath(path) || usesZodSchemaPrimitive(source))
    .map(([path]) => path);
}

function readFeatureSourceFiles(): SourceFile[] {
  const featuresDirectory = join(process.cwd(), 'src');
  return collectTypeScriptFiles(featuresDirectory).map((path) => [
    path,
    readFileSync(path, 'utf8'),
  ]);
}

function collectTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(path);
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) return [];
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

function isSchemaPath(path: string): boolean {
  return /\/schemas\//.test(path) || /\.schema\.[cm]?[jt]sx?$/.test(path);
}

function usesZodSchemaPrimitive(source: string): boolean {
  return /\bz\.(?:object|string|email)\b/.test(source);
}
