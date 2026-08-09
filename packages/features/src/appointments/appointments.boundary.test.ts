import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}

describe('appointments architecture boundary', () => {
  it('keeps domain source free from React and presentation imports', () => {
    for (const file of sourceFiles('src/appointments/domain')) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/from ['"]react/);
      expect(source).not.toMatch(/from ['"].*presentation/);
    }
  });
});
