import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';

const workflowFile = resolve(
  import.meta.dirname,
  '../../../../.github/workflows/real-e2e-recordings.yml'
);

test('real recording workflow protects the full-stack evidence contract', async () => {
  const workflow = await readFile(workflowFile, 'utf8');

  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('service_ref:');
  expect(workflow).toContain('web_ref:');
  expect(workflow).toContain('E2E_MODE: real');
  expect(workflow).toContain("RECORD_DEMO: 'true'");
  expect(workflow).toContain('EMME_SERVICE_IMAGE=emme-service:e2e-sha-');
  expect(workflow).toContain('bootBuildImage');
  expect(workflow).toContain(':tools:e2e-provisioner:run');
  expect(workflow).toContain('compose.runtime-jvm.yaml');
  expect(workflow).toContain('compose.environment-e2e.yaml');
  expect(workflow).toContain('up -d emme-platform');
  expect(workflow).toContain('test:real:recordings');
  expect(workflow).toContain('always()');
  expect(workflow).toContain('actions/upload-artifact');
  expect(workflow).not.toContain('java -jar');
  expect(workflow).not.toContain('emme-platform.pid');
  expect(workflow).not.toContain('provision-e2e-realm.sh');
  expect(workflow).not.toContain('seed-e2e-tenant.sh');
});
