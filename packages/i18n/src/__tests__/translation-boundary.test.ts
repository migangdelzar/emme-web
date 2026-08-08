import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  I18nProvider,
  createTranslationLookup,
  translations,
  useTranslation,
  type TranslationCatalogs,
} from '../index';

function TranslationProbe() {
  const { fallbackLocale, locale, t } = useTranslation();
  return createElement('output', null, `${locale}|${fallbackLocale}|${t('common.dashboard')}`);
}

describe('translation boundary', () => {
  it('looks up a typed key in the active locale', () => {
    const t = createTranslationLookup({ locale: 'en-US' });

    expect(t('common.dashboard')).toBe('Dashboard');
  });

  it('uses the configured fallback locale when the active catalog has no value', () => {
    const catalogs: TranslationCatalogs = {
      ...translations,
      'en-US': {
        ...translations['en-US'],
        common: { ...translations['en-US'].common, dashboard: undefined },
      } as unknown as TranslationCatalogs['en-US'],
    };
    const t = createTranslationLookup({ catalogs, fallbackLocale: 'es-MX', locale: 'en-US' });

    expect(t('common.dashboard')).toBe('Dashboard');
  });

  it('returns the key when neither active nor fallback catalog contains it', () => {
    const catalogs: TranslationCatalogs = {
      ...translations,
      'en-US': {
        ...translations['en-US'],
        common: { ...translations['en-US'].common, dashboard: undefined },
      } as unknown as TranslationCatalogs['en-US'],
      'es-MX': {
        ...translations['es-MX'],
        common: { ...translations['es-MX'].common, dashboard: undefined },
      } as unknown as TranslationCatalogs['es-MX'],
    };
    const t = createTranslationLookup({ catalogs, fallbackLocale: 'es-MX', locale: 'en-US' });

    expect(t('common.dashboard')).toBe('common.dashboard');
  });

  it('provides the configured locale and fallback lookup through the hook', () => {
    const markup = renderToStaticMarkup(
      createElement(
        I18nProvider,
        {
          children: createElement(TranslationProbe),
          fallbackLocale: 'es-MX',
          locale: 'en-US',
        },
      ),
    );

    expect(markup).toBe('<output>en-US|es-MX|Dashboard</output>');
  });
});
