import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';

const packageFile = resolve(import.meta.dirname, '../../package.json');
const recordingSpec = resolve(import.meta.dirname, '../demo/real-demo-recordings.spec.ts');

test.describe('real recording contract', () => {
  test('exposes a real-only recording command and critical journey spec', async () => {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const specSource = await readFile(recordingSpec, 'utf8');

    expect(packageJson.scripts?.['test:real:recordings']).toContain('--project=real');
    expect(packageJson.scripts?.['test:real:recordings']).toContain('RECORD_DEMO=true');
    expect(packageJson.scripts?.['test:real:recordings']).toContain(
      'specs/demo/real-demo-recordings.spec.ts',
    );
    expect(packageJson.scripts?.['test:real:recordings']).toContain('--workers=1');
    expect(packageJson.scripts?.['test:real:recordings']).not.toContain('--grep @demo');
    expect(specSource).toContain('Tag.DEMO');
    expect(specSource).toContain('01-owner-dashboard');
  });
});
