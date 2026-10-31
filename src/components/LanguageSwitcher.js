import { jsx as _jsx } from "react/jsx-runtime";
import { useI18n } from '../i18n/I18nContext';
export function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n();
    const locales = [
        { code: 'fr', label: 'FR' },
        { code: 'en', label: 'EN' },
        { code: 'ar', label: 'AR' },
    ];
    return (_jsx("div", { className: "lang-switch", dir: "ltr", role: "radiogroup", "aria-label": t.languageLabel, children: locales.map(({ code, label }) => (_jsx("button", { onClick: () => setLocale(code), className: locale === code ? 'active' : '', role: "radio", "aria-checked": locale === code, children: label }, code))) }));
}
