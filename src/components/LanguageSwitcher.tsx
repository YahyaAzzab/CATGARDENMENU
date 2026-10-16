import { useI18n } from '../i18n/I18nContext';
import type { Locale } from '../i18n/translations';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const locales: { code: Locale; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <div className="lang-switch" dir="ltr" role="radiogroup" aria-label={t.languageLabel}>
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={locale === code ? 'active' : ''}
          role="radio"
          aria-checked={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
