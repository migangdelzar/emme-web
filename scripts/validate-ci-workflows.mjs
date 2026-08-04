import { readFile } from 'node:fs/promises';

const action = await readFile('.github/actions/setup-bun/action.yml', 'utf8');
const workflow = await readFile('.github/workflows/ci-frontend.yml', 'utf8');

for (const fragment of [
  "bun-version: '1.3.14'",
  'actions/cache@v4',
  '~/.bun/install/cache',
  'bun install --frozen-lockfile',
]) {
  if (!action.includes(fragment)) {
    throw new Error(`Bun setup is missing required fragment: ${fragment}`);
  }
}

for (const fragment of [
  'run_mock_e2e:',
  'run_security:',
  './.github/actions/setup-bun',
  "github.event_name != 'workflow_dispatch' || inputs.run_mock_e2e == true",
  "github.event_name != 'workflow_dispatch' || inputs.run_security == true",
]) {
  if (!workflow.includes(fragment)) {
    throw new Error(`Frontend workflow is missing required fragment: ${fragment}`);
  }
}

for (const file of [
  '.github/workflows/ci-frontend.yml',
  '.github/workflows/demo-recordings.yml',
  '.github/workflows/real-e2e-recordings.yml',
]) {
  const content = await readFile(file, 'utf8');
  if (content.includes('ubuntu-latest')) {
    throw new Error(`${file} must pin Ubuntu runners to ubuntu-24.04.`);
  }

  if (content.includes('oven-sh/setup-bun@v2')) {
    throw new Error(`${file} must use the repository setup-bun action.`);
  }
}

if (!(
  (await readFile('.github/workflows/demo-recordings.yml', 'utf8')).includes(
    './.github/actions/setup-bun',
  )
)) {
  throw new Error('Demo recordings must use the repository setup-bun action.');
}

if (!(
  (await readFile('.github/workflows/real-e2e-recordings.yml', 'utf8')).includes(
    './emme-web/.github/actions/setup-bun',
  )
)) {
  throw new Error('Real E2E recordings must use the checked-out setup-bun action.');
}

console.log('Frontend CI workflow contract passed.');
