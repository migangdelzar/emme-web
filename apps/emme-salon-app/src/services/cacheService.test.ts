import { beforeEach, describe, expect, it } from 'vitest';

import { cacheService } from './cacheService';

describe('cacheService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not persist business source-of-truth records in browser storage', () => {
    cacheService.set('appointments', [{ id: 'apt-1' }]);
    cacheService.set('clients', [{ id: 'client-1' }]);
    cacheService.set('services', [{ id: 'service-1' }]);
    cacheService.set('profile', { businessName: 'Studio' });

    expect(cacheService.get('appointments')).toBeNull();
    expect(cacheService.get('clients')).toBeNull();
    expect(cacheService.get('services')).toBeNull();
    expect(cacheService.get('profile')).toBeNull();
    expect(Object.keys(localStorage)).toEqual([]);
  });

  it('can persist non-business UI preferences', () => {
    cacheService.set('isFirstTime', false);

    expect(cacheService.get('isFirstTime')).toBe(false);
  });
});
