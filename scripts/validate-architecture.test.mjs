import { expect, test } from 'vitest';
import { validateWorkspaceArchitecture } from './validate-architecture.mjs';

test('rejects imports from applications into packages', async () => {
  const result = await validateWorkspaceArchitecture({ root: '/workspace' });
  expect(result.violations.filter((v) => v.rule === 'package-cannot-import-app')).toEqual([]);
});
