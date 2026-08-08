import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('google workspace API boundary', () => {
  it('uses the injected typed API instead of app-local HTTP clients', () => {
    const hookSources = [
      'hooks/useCalendarSync.ts',
      'hooks/useGoogleOAuth.ts',
      'hooks/useSheetsExport.ts',
    ].map((path) => readFileSync(`src/google-workspace/${path}`, 'utf8'));

    for (const source of hookSources) {
      expect(source).toContain('@emme/core');
      expect(source).not.toContain('@/api/restClient');
      expect(source).not.toContain('createCalendarSyncApi(api)');
      expect(source).not.toContain('createGoogleOAuthApi(api)');
      expect(source).not.toContain('createGoogleSheetsApi(api)');
    }
  });
});
