import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { pickLabeled } from '../i18n/translations';
import { Badge } from './UIComponents';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { useItemImage } from '../lib/itemImages';
const placeholderTones = [
    'from-sage-muted/55 to-sage-light/30',
    'from-peach-muted/70 to-peach-light/35',
    'from-rose-light/80 to-cream-dark',
    'from-cream-dark to-sage-muted/40',
];
function toneFor(id) {
    let n = 0;
    for (let i = 0; i < id.length; i++)
        n += id.charCodeAt(i);
    return placeholderTones[n % placeholderTones.length];
}
export function MenuItemCard({ item, onTap, compact = false }) {
    const { locale, t, localized } = useI18n();
    const [showPaw, setShowPaw] = useState(false);
    const [pawPos, setPawPos] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const reduce = useReducedMotion();
    const isInView = useInView(cardRef, { once: true, margin: '-30px' });
    const nearView = useInView(cardRef, { once: true, margin: '360px 0px' });
    const name = localized(item, 'name');
    const description = localized(item, 'description');
    const priceNote = localized(item, 'priceNote');
    const servingNote = localized(item, 'servingNote');
    const category = getCategoryById(item.categoryId);
    const loadedImage = useItemImage(item.id, nearView && !item.image);
    const image = item.image ?? loadedImage;
    const handleTap = (e) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
            const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
            setPawPos({ x: clientX - rect.left, y: clientY - rect.top });
            setShowPaw(true);
            setTimeout(() => setShowPaw(false), 500);
        }
        onTap(item);
    };
    return (_jsxs(motion.div, { ref: cardRef, className: `card-menu relative overflow-hidden cursor-pointer active:scale-[0.98] ${!item.available ? 'opacity-50 grayscale' : ''}`, id: `item-${item.id}`, onClick: handleTap, initial: reduce ? false : { opacity: 0, y: 12 }, animate: isInView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] }, role: "button", tabIndex: 0, "aria-label": `${name} ${item.price !== null ? t.priceFormat(item.price) : ''}`, children: [showPaw && (_jsx(motion.div, { className: "pointer-events-none absolute z-10", style: { left: pawPos.x - 15, top: pawPos.y - 15 }, initial: { opacity: 0.5, scale: 0 }, animate: { opacity: 0, scale: 1.5 }, transition: { duration: 0.5 }, children: _jsxs("svg", { width: "30", height: "30", viewBox: "0 0 64 64", fill: "var(--color-sage-muted)", opacity: "0.4", children: [_jsx("ellipse", { cx: "32", cy: "42", rx: "14", ry: "12" }), _jsx("ellipse", { cx: "18", cy: "24", rx: "7", ry: "8", transform: "rotate(-15 18 24)" }), _jsx("ellipse", { cx: "32", cy: "20", rx: "7", ry: "8" }), _jsx("ellipse", { cx: "46", cy: "24", rx: "7", ry: "8", transform: "rotate(15 46 24)" })] }) })), compact ? (_jsxs("div", { className: "flex min-h-[72px] flex-col", children: [_jsxs("div", { className: "flex items-start gap-2 p-2.5", children: [_jsx("div", { className: `flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${toneFor(item.id)}`, children: image ? (_jsx("img", { src: image, alt: "", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" })) : (category && _jsx(CategoryIcon, { icon: category.icon, size: 26, className: "text-sage-dark/50" })) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col py-0.5", children: [_jsx("h3", { className: "text-[0.94rem] font-bold leading-snug text-chocolate line-clamp-3", style: { fontFamily: 'var(--font-display)' }, children: name }), _jsx("div", { className: "mt-1", children: item.price !== null ? (_jsx("span", { className: "price-tag text-[0.94rem]", children: t.priceFormat(item.price) })) : (_jsx("span", { className: "text-[0.94rem] italic text-chocolate-muted", children: priceNote })) })] })] }), (item.badges.length > 0 || servingNote) && (_jsxs("div", { className: "flex flex-wrap gap-1 px-2.5 pb-2.5", children: [item.badges.slice(0, 1).map((badge) => (_jsx(Badge, { badge: badge }, badge))), servingNote && (_jsx("span", { className: "badge badge-hours", children: servingNote }))] }))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-3 p-3", children: [_jsx("div", { className: `flex h-[92px] w-[92px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${toneFor(item.id)}`, children: image ? (_jsx("img", { src: image, alt: "", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" })) : (category && (_jsx(CategoryIcon, { icon: category.icon, size: 36, className: "text-sage-dark/50" }))) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: "text-[0.98rem] font-bold leading-snug text-chocolate line-clamp-2", style: { fontFamily: 'var(--font-display)' }, children: name }), _jsx("div", { className: "flex-shrink-0 pt-0.5", children: item.price !== null ? (_jsx("span", { className: "price-tag text-[0.98rem]", children: t.priceFormat(item.price) })) : (_jsx("span", { className: "max-w-[72px] text-end text-[0.94rem] leading-tight italic text-chocolate-muted", children: priceNote })) })] }), (item.badges.length > 0 || servingNote) && (_jsxs("div", { className: "mt-1 flex flex-wrap gap-1", children: [item.badges.map((badge) => (_jsx(Badge, { badge: badge }, badge))), servingNote && (_jsx("span", { className: "badge badge-hours", children: servingNote }))] })), description && (_jsx("p", { className: "mt-1 text-[0.94rem] leading-snug text-chocolate-muted line-clamp-2", children: description })), !item.available && (_jsx("span", { className: "mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[0.94rem] font-bold text-red-700", children: t.exhausted }))] })] }), item.includedChoices && item.includedChoices.length > 0 && (_jsx("div", { className: "px-3 pb-3 -mt-1", children: _jsxs("span", { className: "text-[0.94rem] font-semibold text-sage-dark", children: ["\u2726 ", t.included, " : ", item.includedChoices.map((c) => pickLabeled(locale, c, 'label')).join(' + ')] }) }))] }))] }));
}
