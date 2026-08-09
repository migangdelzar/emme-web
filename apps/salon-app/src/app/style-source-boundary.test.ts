import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalStyles = readFileSync(join(process.cwd(), 'src/theme/globals.css'), 'utf8');

describe('application style source boundary', () => {
  it('scans reusable package components for Tailwind utilities', () => {
    expect(globalStyles).toContain("@source '../../../../packages/features/src';");
    expect(globalStyles).toContain("@source '../../../../packages/ui/src';");
  });
});
