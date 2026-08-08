import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const authProviderSource = readFileSync(
  join(process.cwd(), 'src/app/auth/AuthProvider.tsx'),
  'utf8'
);
const appProvidersSource = readFileSync(join(process.cwd(), 'src/app/AppProviders.tsx'), 'utf8');

describe('authentication transport boundary', () => {
  it('keeps authentication operations behind the injected API composition', () => {
    expect(authProviderSource).not.toContain('fetch(');
    expect(authProviderSource).not.toContain('API_VERSION');
    expect(authProviderSource).not.toContain('localStorage');
    expect(appProvidersSource).not.toContain('@/api/restClient');
  });
});
