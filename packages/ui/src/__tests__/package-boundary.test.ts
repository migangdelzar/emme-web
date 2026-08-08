import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { Button } from '../index.js';

describe('@emme/ui package boundary', () => {
  it('exports the first shared component from the public barrel', () => {
    expect(typeof Button).toBe('function');
  });

  it('does not import business or infrastructure packages', () => {
    const source = readFileSync(new URL('../index.ts', import.meta.url), 'utf8');

    expect(source).not.toMatch(
      /from ['"](?:@emme\/(?:domain|application|api|infrastructure)|apps\/)/,
    );
  });
});
