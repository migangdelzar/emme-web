type CacheKey =
  | 'services'
  | 'clients'
  | 'appointments'
  | 'profile'
  | 'isFirstTime'
  | 'googleSpreadsheetId'
  | 'isGoogleAutoSync'
  | 'isGoogleSheetsAutoExport';

const BUSINESS_SOURCE_KEYS = new Set<CacheKey>(['services', 'clients', 'appointments', 'profile']);

interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0.1';
const DEFAULT_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

export const cacheService = {
  set: <T>(key: CacheKey, data: T): void => {
    if (BUSINESS_SOURCE_KEYS.has(key)) return;

    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(`emmenails_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Error saving to cache: ${key}`, error);
    }
  },

  get: <T>(key: CacheKey, ttl: number = DEFAULT_TTL): T | null => {
    if (BUSINESS_SOURCE_KEYS.has(key)) return null;

    try {
      const saved = localStorage.getItem(`emmenails_cache_${key}`);
      if (!saved) return null;

      const cacheData: CacheData<T> = JSON.parse(saved);

      // Check version
      if (cacheData.version !== CACHE_VERSION) {
        localStorage.removeItem(`emmenails_cache_${key}`);
        return null;
      }

      // Check expiration
      const age = Date.now() - cacheData.timestamp;
      if (age > ttl) {
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error(`Error reading from cache: ${key}`, error);
      return null;
    }
  },

  clear: (key?: CacheKey): void => {
    if (key) {
      localStorage.removeItem(`emmenails_cache_${key}`);
    } else {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('emmenails_cache_')) {
          localStorage.removeItem(k);
        }
      });
    }
  },
};
