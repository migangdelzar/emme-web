import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';

const workflowFile = resolve(import.meta.dirname, '../../../../.github/workflows/real-e2e-recordings.yml');

test('real recording workflow protects the full-stack evidence contract', async () => {
  const workflow = await readFile(workflowFile, 'utf8');

  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('service_ref:');
  expect(workflow).toContain('web_ref:');
  expect(workflow).toContain('E2E_MODE: real');
  expect(workflow).toContain("RECORD_DEMO: 'true'");
  expect(workflow).toContain('test:real:recordings');
  expect(workflow).toContain('if: always()');
  expect(workflow).toContain('actions/upload-artifact');
});
