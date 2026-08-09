import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { Button as WebButton } from '../web/index.js';
import { tokens } from '../native/index.js';

describe('UI platform boundaries', () => {
  it('exposes DOM components from the web boundary', () => {
    expect(typeof WebButton).toBe('function');
  });

  it('keeps native contracts free of DOM globals', () => {
    const nativeSource = readFileSync(join(process.cwd(), 'src/native/index.ts'), 'utf8');

    expect(nativeSource).not.toMatch(/document|window|HTMLElement|JSX\.IntrinsicElements/);
    expect(tokens.spacing.md).toBe('1rem');
  });
});
