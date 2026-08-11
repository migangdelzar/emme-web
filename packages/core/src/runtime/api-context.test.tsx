import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApiProvider } from './api-provider.js';
import { useApi } from './use-api.js';
import type { Api } from '@emme/api';

function ApiProbe(): ReactNode {
  const api = useApi();
  return createElement('output', null, api === null ? 'missing' : 'provided');
}

describe('ApiProvider', () => {
  it('exposes the injected API composition to application adapters', () => {
    const api = {} as Api;
    const markup = renderToStaticMarkup(
      createElement(ApiProvider, { api }, createElement(ApiProbe)),
    );

    expect(markup).toBe('<output>provided</output>');
  });
});
