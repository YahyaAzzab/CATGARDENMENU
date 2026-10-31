import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations } from './translations';
import { arCopy } from './arMenu';
const I18nContext = createContext(null);
const CAIRO_HREF = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
function ensureCairo() {
    if (document.querySelector('link[data-font="cairo"]'))
        return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CAIRO_HREF;
    link.dataset.font = 'cairo';
    document.head.appendChild(link);
}
export function I18nProvider({ children }) {
    const [locale, setLocale] = useState('fr');
    const t = translations[locale];
    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.title = t.pageTitle;
        if (locale === 'ar')
            ensureCairo();
    }, [locale, t.pageTitle]);
    const localized = useCallback((obj, fieldBase) => {
        const suffix = locale === 'en' ? 'En' : locale === 'ar' ? 'Ar' : 'Fr';
        const record = obj;
        const direct = record[`${fieldBase}${suffix}`];
        if (direct)
            return direct;
        if (locale === 'ar' && typeof record.id === 'string') {
            const extra = arCopy[record.id];
            const fromExtra = extra?.[fieldBase];
            if (typeof fromExtra === 'string' && fromExtra)
                return fromExtra;
        }
        return record[`${fieldBase}Fr`] ?? record[`${fieldBase}En`] ?? '';
    }, [locale]);
    return (_jsx(I18nContext.Provider, { value: { locale, t, setLocale, localized }, children: children }));
}
export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx)
        throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
