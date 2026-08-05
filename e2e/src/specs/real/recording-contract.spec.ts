import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';

const packageFile = resolve(import.meta.dirname, '../../package.json');
const recordingSpec = resolve(import.meta.dirname, '../demo/demo-recordings.spec.ts');

test.describe('real recording contract', () => {
  test('exposes a unified recording command for both mock and real', async () => {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const specSource = await readFile(recordingSpec, 'utf8');

    expect(packageJson.scripts?.['test:demo:real']).toContain('--project=real');
    expect(packageJson.scripts?.['test:demo:real']).toContain('RECORD_DEMO=true');
    expect(packageJson.scripts?.['test:demo:real']).toContain('specs/demo/demo-recordings.spec.ts');
    expect(packageJson.scripts?.['test:demo:real']).toContain('--workers=1');
    expect(specSource).toContain('Tag.DEMO');
    expect(specSource).toContain('Tag.CRITICAL');
  });
});
