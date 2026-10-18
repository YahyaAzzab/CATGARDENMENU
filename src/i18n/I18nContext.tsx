import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { translations, type Locale, type Translations } from './translations';
import { arCopy } from './arMenu';

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  /** Get the FR, EN, or AR field from data objects */
  localized: <T extends object>(obj: T, fieldBase: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const CAIRO_HREF =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';

function ensureCairo() {
  if (document.querySelector('link[data-font="cairo"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CAIRO_HREF;
  link.dataset.font = 'cairo';
  document.head.appendChild(link);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.title = t.pageTitle;
    if (locale === 'ar') ensureCairo();
  }, [locale, t.pageTitle]);

  const localized = useCallback(
    <T extends object>(obj: T, fieldBase: string): string => {
      const suffix = locale === 'en' ? 'En' : locale === 'ar' ? 'Ar' : 'Fr';
      const record = obj as Record<string, string | undefined>;
      const direct = record[`${fieldBase}${suffix}`];
      if (direct) return direct;
      if (locale === 'ar' && typeof record.id === 'string') {
        const extra = arCopy[record.id];
        const fromExtra = extra?.[fieldBase as keyof typeof extra];
        if (typeof fromExtra === 'string' && fromExtra) return fromExtra;
      }
      return record[`${fieldBase}Fr`] ?? record[`${fieldBase}En`] ?? '';
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
