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
  expect(workflow).toContain("RECORD_DEMO: ${{ inputs.suite == 'recordings' && 'true' || 'false' }}");
  expect(workflow).toContain('EMME_SERVICE_IMAGE=emme-service:e2e-sha-');
  expect(workflow).toContain('bootBuildImage');
  expect(workflow).toContain(':tools:e2e-provisioner:run');
  expect(workflow).toContain('compose.runtime-${{ inputs.runtime }}.yaml');
  expect(workflow).toContain('compose.environment-e2e.yaml');
  expect(workflow).toContain('up -d emme-platform');
  expect(workflow).toContain('test:real:recordings');
  expect(workflow).toContain('http://127.0.0.1:18080/realms/master');
  expect(workflow).not.toContain('http://127.0.0.1:18080/health/ready');
  expect(workflow).toContain('always()');
  expect(workflow).toContain('workflow_call:');
  expect(workflow).toContain('deployment_target:');
  expect(workflow).toContain('actions/upload-artifact');

  const diagnosticsPosition = workflow.indexOf('name: Collect Compose diagnostics');
  const uploadPosition = workflow.indexOf('name: Upload real E2E reports and evidence');
  expect(diagnosticsPosition).toBeGreaterThanOrEqual(0);
  expect(uploadPosition).toBeGreaterThan(diagnosticsPosition);
  expect(workflow.slice(uploadPosition)).toContain('${{ runner.temp }}/emme-compose.log');

  expect(workflow).not.toContain('java -jar');
  expect(workflow).not.toContain('emme-platform.pid');
  expect(workflow).not.toContain('provision-e2e-realm.sh');
  expect(workflow).not.toContain('seed-e2e-tenant.sh');
});

test('regression workflow exposes safe deployment and runtime choices', async () => {
  const workflow = await readFile(
    resolve(import.meta.dirname, '../../../../.github/workflows/regression.yml'),
    'utf8',
  );

  expect(workflow).toContain('deployment_target:');
  expect(workflow).toContain('type: choice');
  expect(workflow).toContain('- compose');
  expect(workflow).toContain('- k3d');
  expect(workflow).toContain('- k3s');
  expect(workflow).toContain('default: compose');
  expect(workflow).toContain('runtime:');
  expect(workflow).toContain('- jvm');
  expect(workflow).toContain('- native');
  expect(workflow).toContain('run_real_e2e:');
  expect(workflow).toContain('suite: regression');
  expect(workflow).toContain('uses: ./.github/workflows/real-e2e-recordings.yml');
});

test('real mode and recording mode cannot silently be selected by mock commands', async () => {
  const packageJson = await readFile(
    resolve(import.meta.dirname, '../../package.json'),
    'utf8',
  );
  const playwrightConfig = await readFile(
    resolve(import.meta.dirname, '../../playwright.config.ts'),
    'utf8',
  );
  const mockWorkflow = await readFile(
    resolve(import.meta.dirname, '../../../../.github/workflows/demo-recordings.yml'),
    'utf8',
  );
  const regressionWorkflow = await readFile(
    resolve(import.meta.dirname, '../../../../.github/workflows/regression.yml'),
    'utf8',
  );

  expect(packageJson).toContain('"test:real": "E2E_MODE=real');
  expect(playwrightConfig).toContain("process.env.E2E_MODE === 'real'");
  expect(mockWorkflow).not.toContain('e2e/src/test-results\n');
  expect(regressionWorkflow).not.toContain('e2e/src/test-results\n');
});
