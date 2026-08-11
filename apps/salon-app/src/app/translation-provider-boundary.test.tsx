import { cleanup, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nTestProvider } from '@emme/i18n';
import { useAppTranslation } from '@emme/i18n';

afterEach(cleanup);

function Probe(): ReactNode {
  const { t } = useAppTranslation();
  return createElement('output', null, t('common.dashboard'));
}

describe('application translation boundary', () => {
  it('consumes the shared i18n provider', () => {
    render(
      <I18nTestProvider locale="en-US">
        <Probe />
      </I18nTestProvider>
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
  });
});
