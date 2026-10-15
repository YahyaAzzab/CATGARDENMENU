import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type Locale, type Translations } from './translations';

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  /** Get the FR or EN field from data objects */
  localized: <T extends Record<string, unknown>>(obj: T, fieldBase: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const t = translations[locale];

  const localized = useCallback(
    <T extends Record<string, unknown>>(obj: T, fieldBase: string): string => {
      const suffix = locale === 'fr' ? 'Fr' : 'En';
      const key = `${fieldBase}${suffix}`;
      return (obj[key] as string) ?? (obj[`${fieldBase}Fr`] as string) ?? '';
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, localized }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
