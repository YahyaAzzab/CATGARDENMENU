import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PawPrint } from './Icons';
import { BrandLogo } from './BrandLogo';
export function Header({ onLogoClick, showMark }) {
    const { t } = useI18n();
    const space = t.appTitle.indexOf(' ');
    const cats = space === -1 ? t.appTitle : t.appTitle.slice(0, space + 1);
    const garden = space === -1 ? '' : t.appTitle.slice(space + 1);
    return (_jsx("header", { className: "sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-sage-muted/15", children: _jsxs("div", { className: "flex items-center justify-between px-4 py-2.5", style: { paddingTop: 'max(env(safe-area-inset-top), 10px)' }, children: [_jsxs("button", { type: "button", className: "flex min-h-[44px] items-center gap-2 text-start", onClick: onLogoClick, children: [_jsx("span", { "data-brand-slot": true, className: "flex h-10 w-10 shrink-0", children: showMark && _jsx(BrandLogo, { className: "h-full w-full" }) }), _jsxs("div", { children: [_jsxs("h1", { className: "text-[1.12rem] italic leading-none tracking-tight", style: { fontFamily: 'var(--font-display)' }, children: [_jsx("span", { className: "text-chocolate", children: cats }), _jsx("span", { className: "text-sage-dark", children: garden })] }), _jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [_jsx(PawPrint, { size: 5, className: "text-peach-muted" }), _jsx(PawPrint, { size: 4, className: "text-sage-muted" }), _jsx(PawPrint, { size: 5, className: "text-peach-muted" })] })] })] }), _jsx(LanguageSwitcher, {})] }) }));
}
