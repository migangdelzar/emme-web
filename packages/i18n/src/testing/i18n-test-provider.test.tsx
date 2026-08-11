import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useTranslation } from '../use-translation.js';
import { I18nTestProvider } from './i18n-test-provider.js';

function TranslationProbe(): ReactNode {
  const { locale, t } = useTranslation();
  return createElement('span', null, `${locale}:${t('common.save')}`);
}

describe('I18nTestProvider', () => {
  it('provides an isolated locale context for package and app tests', () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nTestProvider,
        { locale: 'en-US' },
        createElement(TranslationProbe),
      ),
    );

    expect(html).toContain('en-US:Save');
  });
});
