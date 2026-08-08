import enUS from './data/translations/en-US.json' with { type: 'json' };
import esMX from './data/translations/es-MX.json' with { type: 'json' };

export type Locale = 'en-US' | 'es-MX';
export type TranslationCatalog = typeof enUS;
export type TranslationCatalogs = Record<Locale, TranslationCatalog>;

export const translations: TranslationCatalogs = {
  'en-US': enUS,
  'es-MX': esMX,
};

export type TranslationResources = Record<Locale, { translation: TranslationCatalog }>;

export const resources: TranslationResources = {
  'en-US': { translation: enUS },
  'es-MX': { translation: esMX },
};

type LeafPaths<T, Prefix extends string = ''> = {
  [Key in keyof T & string]: T[Key] extends string
    ? `${Prefix}${Key}`
    : T[Key] extends Record<string, unknown>
      ? LeafPaths<T[Key], `${Prefix}${Key}.`>
      : never;
}[keyof T & string];

export type TranslationKey = LeafPaths<TranslationCatalog>;

export function readPath(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined;
    return (value as Record<string, unknown>)[key];
  }, root);
}
