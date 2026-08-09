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

export type FeatureTranslationNamespace = Readonly<Record<string, string>>;
export type FeatureTranslationCatalogs<
  Namespace extends string,
  Messages extends FeatureTranslationNamespace,
> = {
  readonly [CurrentLocale in Locale]: TranslationCatalog & Record<Namespace, Messages>;
};

type FeatureNamespaceInput<Messages extends FeatureTranslationNamespace> =
  | Messages
  | Readonly<Record<Locale, Messages>>;

export const resources: TranslationResources = {
  'en-US': { translation: enUS },
  'es-MX': { translation: esMX },
};

export function registerFeatureNamespace<
  const Namespace extends string,
  const Messages extends FeatureTranslationNamespace,
>(
  catalogs: TranslationCatalogs,
  namespace: Namespace,
  messages: FeatureNamespaceInput<Messages>,
): FeatureTranslationCatalogs<Namespace, Messages> {
  const localizedMessages = (locale: Locale): Messages => {
    if ('en-US' in messages || 'es-MX' in messages) {
      const byLocale = messages as Readonly<Record<Locale, Messages>>;
      return byLocale[locale] ?? (byLocale['en-US'] as Messages);
    }

    return messages as Messages;
  };

  return {
    'en-US': { ...catalogs['en-US'], [namespace]: localizedMessages('en-US') },
    'es-MX': { ...catalogs['es-MX'], [namespace]: localizedMessages('es-MX') },
  } as FeatureTranslationCatalogs<Namespace, Messages>;
}

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
