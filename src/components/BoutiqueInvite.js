import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '../i18n/I18nContext';
import { playUiSoundThenGo } from '../lib/uiSound';
export function BoutiqueInvite() {
    const { t } = useI18n();
    return (_jsxs("a", { href: "/", className: "boutique-invite", onClick: (event) => playUiSoundThenGo(event, 'boutique'), children: [_jsx("img", { className: "invite-mark", src: "/maison/wordmark-night.png", alt: "" }), _jsxs("span", { children: [_jsx("strong", { children: t.boutiqueTitle }), _jsx("em", { children: t.boutiqueNote })] }), _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M5 12h14M13 6l6 6-6 6", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) })] }));
}
