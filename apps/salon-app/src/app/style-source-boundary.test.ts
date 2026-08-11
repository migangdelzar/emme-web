import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalStyles = readFileSync(join(process.cwd(), 'src/theme/globals.css'), 'utf8');

describe('application style source boundary', () => {
  it('scans reusable package components for Tailwind utilities', () => {
    expect(globalStyles).toContain("@source '../../../../apps/salon-app/src';");
    expect(globalStyles).toContain("@source '../../../../packages/auth/src';");
    expect(globalStyles).toContain("@source '../../../../packages/ui/src';");
  });

  it('defines the complete Rosé semantic token set', () => {
    expect(globalStyles).toContain('.rose {');
    for (const token of [
      '--background:',
      '--foreground:',
      '--card:',
      '--primary:',
      '--primary-foreground:',
      '--secondary:',
      '--muted:',
      '--accent:',
      '--border:',
      '--input:',
      '--ring:',
      '--color-bg:',
      '--color-surface:',
      '--color-text:',
      '--color-primary:',
      '--color-border:',
    ]) {
      expect(globalStyles).toContain(token);
    }
    expect(globalStyles).toContain('.rose .material-thick');
    expect(globalStyles).toContain('.rose .material-regular');
    expect(globalStyles).toContain('.rose .material-thin');
  });
});
