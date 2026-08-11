import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/features/auth/ClientLoginPage.tsx', 'utf8');

describe('client login page', () => {
  it('keeps the salon authentication visual language', () => {
    expect(source).toContain('font-display');
    expect(source).toContain('glass');
    expect(source).toContain('Sparkles');
  });

  it('offers Google authentication without local credentials or registration', () => {
    expect(source).toContain('Continue with Google');
    expect(source).not.toContain('type="password"');
    expect(source).not.toContain('type="email"');
    expect(source).not.toContain('Register');
    expect(source).not.toContain('Create account');
  });
});
