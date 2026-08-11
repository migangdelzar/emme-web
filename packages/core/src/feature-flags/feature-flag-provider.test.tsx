// @vitest-environment happy-dom

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FeatureFlagProvider } from './feature-flag-provider.js';
import { FeatureFlagGuard } from './feature-flag-guard.js';

describe('FeatureFlagProvider', () => {
  it('hides disabled feature content and shows an optional fallback', () => {
    const markup = renderToStaticMarkup(
      createElement(
        FeatureFlagProvider,
        { flags: [] },
        createElement(
          FeatureFlagGuard,
          { flag: 'new-calendar', fallback: createElement('p', null, 'Unavailable') },
          createElement('p', null, 'New calendar'),
        ),
      ),
    );

    expect(markup).not.toContain('New calendar');
    expect(markup).toContain('Unavailable');
  });
});
