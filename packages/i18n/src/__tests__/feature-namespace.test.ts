import { describe, expect, it } from 'vitest';

import { registerFeatureNamespace, translations } from '../translation-catalog.js';

describe('feature translation namespaces', () => {
  it('registers a namespace immutably without mutating shared catalogs', () => {
    const registered = registerFeatureNamespace(translations, 'test-feature', {
      title: 'Appointments',
    });

    expect(registered['en-US']['test-feature'].title).toBe('Appointments');
    expect(registered['es-MX']['test-feature'].title).toBe('Appointments');
    expect(translations['en-US']).not.toHaveProperty('test-feature');
  });
});
