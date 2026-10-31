import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { FamilyIllustration } from './FamilyIllustration';
import { cardSpring, cascadeStagger, pageEase } from '../motion';
import { prefetchMenuScreens } from '../lib/loadScreens';
import { playUiSound } from '../lib/uiSound';
export function FamilyCard({ family, count, featured = false, size = 'md', index, ready, fromSplash, onSelect, }) {
    const { localized, t } = useI18n();
    const reduce = useReducedMotion();
    const title = localized(family, 'name');
    const minH = featured
        ? 'min-h-[108px]'
        : size === 'lg'
            ? 'min-h-[156px]'
            : size === 'sm'
                ? 'min-h-[108px]'
                : 'min-h-[124px]';
    return (_jsxs(motion.button, { type: "button", onPointerDown: () => {
            prefetchMenuScreens();
            playUiSound('meow');
        }, onClick: () => onSelect(family.id), className: `relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-start ${minH} ${featured ? 'col-span-2' : ''} shadow-[var(--shadow-card)] border border-white/50`, style: { fontFamily: 'var(--font-body)' }, initial: reduce ? false : { opacity: 0, y: 18 }, animate: ready || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }, transition: reduce
            ? { duration: 0 }
            : {
                ...cardSpring,
                delay: fromSplash ? index * cascadeStagger : index * 0.04,
            }, whileTap: reduce ? undefined : { scale: 0.98 }, "aria-label": `${localized(family, 'name')}, ${t.itemCount(count)}`, children: [_jsx(motion.div, { layoutId: `fam-visual-${family.id}`, className: "absolute inset-0", transition: reduce ? { duration: 0 } : { duration: 0.5, ease: pageEase }, children: _jsx(FamilyIllustration, { familyId: family.id, priority: index < 2 }) }), _jsxs("div", { className: `relative z-10 mt-auto p-3 ${featured ? 'max-w-[62%]' : 'max-w-[68%]'}`, children: [_jsx("h3", { className: `font-bold leading-tight text-chocolate ${featured ? 'text-[1.15rem]' : 'text-[0.98rem]'}`, style: { fontFamily: 'var(--font-display)' }, children: title }), _jsx("p", { className: "mt-0.5 text-[0.94rem] font-semibold text-sage-dark", children: t.itemCount(count) })] })] }));
}
