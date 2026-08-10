import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
describe('client app boundary', () => { it('does not import other app internals', () => { const source = readFileSync('src/app/router.tsx', 'utf8'); expect(source).not.toContain('salon-app'); expect(source).not.toContain('platform-admin'); }); });
