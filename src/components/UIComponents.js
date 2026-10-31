import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useI18n } from '../i18n/I18nContext';
import { getTagLabel, getBadgeLabel } from '../i18n/translations';
export function Badge({ badge }) {
    const { locale } = useI18n();
    const label = getBadgeLabel(badge, locale);
    const dotColors = {
        new: 'bg-sage',
        signature: 'bg-peach',
        popular: 'bg-rose-dark',
    };
    return (_jsxs("span", { className: `badge badge-${badge}`, children: [_jsx("span", { className: `inline-block w-1.5 h-1.5 rounded-full ${dotColors[badge]}` }), label] }));
}
export function Chip({ tag }) {
    const { locale } = useI18n();
    const label = getTagLabel(tag, locale);
    // Only show meaningful dietary/allergen tags, skip display-only ones
    const hiddenTags = ['hot', 'cold'];
    if (hiddenTags.includes(tag))
        return null;
    return (_jsx("span", { className: `chip chip-${tag}`, children: label }));
}
export function Button({ children, variant = 'primary', size = 'md', onClick, className = '', active = false, }) {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 font-[var(--font-body)]';
    const variants = {
        primary: 'bg-sage text-white hover:bg-sage-dark',
        secondary: `border-[1.5px] border-sage-muted bg-white text-chocolate-light hover:border-sage hover:bg-sage-muted ${active ? 'bg-sage text-white border-sage' : ''}`,
        ghost: 'bg-transparent text-chocolate-muted hover:bg-cream-dark',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
    };
    return (_jsx("button", { onClick: onClick, className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`, children: children }));
}
