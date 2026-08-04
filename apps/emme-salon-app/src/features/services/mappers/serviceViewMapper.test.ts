import { describe, expect, it } from 'vitest';

import { mapNailServiceView } from './serviceViewMapper';

describe('mapNailServiceView', () => {
  it('maps the feature service response to the application service model', () => {
    expect(mapNailServiceView({
      id: 'service-1',
      name: 'Gel',
      category: 'Nail Art',
      durationMinutes: 60,
      priceRange: '500',
      description: 'Art',
      isActive: true,
    })).toEqual({
      id: 'service-1',
      name: 'Gel',
      category: 'Nail Art',
      duration: 60,
      price: 500,
      description: 'Art',
      isActive: true,
    });
  });
});
