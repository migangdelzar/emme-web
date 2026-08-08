import { describe, expect, it } from 'vitest';
import { toggleServiceStatusInput } from './service.rules';

describe('toggleServiceStatusInput', () => {
  it('creates an update that flips an active service to inactive', () => {
    expect(
      toggleServiceStatusInput({
        id: 'service-1',
        name: 'Manicure',
        category: 'Care',
        duration: 60,
        price: 25,
        description: 'Classic manicure',
        isActive: true,
      })
    ).toEqual({
      id: 'service-1',
      name: 'Manicure',
      category: 'Care',
      durationMinutes: 60,
      description: 'Classic manicure',
      priceRange: '25',
      isActive: false,
    });
  });
});
