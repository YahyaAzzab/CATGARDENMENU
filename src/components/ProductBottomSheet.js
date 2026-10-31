import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { pickLabeled } from '../i18n/translations';
import { Badge, Chip } from './UIComponents';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { useItemImage } from '../lib/itemImages';
export function ProductBottomSheet({ item, onClose }) {
    const { locale, t, localized } = useI18n();
    // Lock body scroll when open
    useEffect(() => {
        if (item) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [item]);
    // ESC to close
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);
    return (_jsx(AnimatePresence, { children: item && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 }, onClick: onClose }, "backdrop"), _jsxs(motion.div, { className: "fixed inset-x-0 bottom-0 z-[70] max-h-[88vh] flex flex-col bg-cream rounded-t-3xl shadow-2xl overflow-hidden", style: { paddingBottom: 'env(safe-area-inset-bottom, 0px)' }, initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'spring', damping: 30, stiffness: 350 }, drag: "y", dragConstraints: { top: 0, bottom: 0 }, dragElastic: { top: 0, bottom: 0.5 }, onDragEnd: (_, info) => {
                        if (info.offset.y > 100 || info.velocity.y > 500)
                            onClose();
                    }, children: [_jsx("div", { className: "flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing", children: _jsx("div", { className: "w-10 h-1 rounded-full bg-chocolate-muted/20" }) }), _jsx("div", { className: "overflow-y-auto overscroll-contain px-5 pb-6 flex-1", children: _jsx(SheetContent, { item: item, locale: locale, t: t, localized: localized }) })] }, "sheet")] })) }));
}
function SheetContent({ item, locale, t, localized }) {
    const name = localized(item, 'name');
    const description = localized(item, 'description');
    const priceNote = localized(item, 'priceNote');
    const servingNote = localized(item, 'servingNote');
    const category = getCategoryById(item.categoryId);
    const loadedImage = useItemImage(item.id, !item.image);
    const image = item.image ?? loadedImage;
    const visibleTags = item.tags.filter((tag) => !['hot', 'cold'].includes(tag));
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative mb-4 h-52 w-full overflow-hidden rounded-2xl bg-[#FDF6EC]", children: [image ? (_jsx("img", { src: image, alt: "", decoding: "async", fetchPriority: "high", className: "h-full w-full object-contain" })) : (_jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-[0.12]", children: category && _jsx(CategoryIcon, { icon: category.icon, size: 64, className: "text-sage" }) })), !item.available && (_jsx("div", { className: "absolute inset-0 bg-cream/70 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-chocolate-muted bg-white/80 px-4 py-2 rounded-full", children: t.exhausted }) }))] }), _jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [_jsx("h2", { className: "text-xl font-bold text-chocolate leading-tight flex-1", style: { fontFamily: 'var(--font-display)' }, children: name }), _jsx("div", { className: "flex-shrink-0 text-end", children: item.price !== null ? (_jsx("span", { className: "text-xl font-bold", style: { color: 'var(--color-sage-dark)', fontFamily: 'var(--font-display)' }, children: t.priceFormat(item.price) })) : (_jsx("span", { className: "text-sm italic text-chocolate-muted", children: priceNote })) })] }), item.badges.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mb-3", children: item.badges.map((badge) => (_jsx(Badge, { badge: badge }, badge))) })), description && (_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-1.5", children: t.composition }), _jsx("p", { className: "text-[0.88rem] text-chocolate-muted leading-relaxed", children: description })] })), visibleTags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mb-4", children: visibleTags.map((tag) => (_jsx(Chip, { tag: tag }, tag))) })), item.options && item.options.length > 0 && (_jsxs("div", { className: "mb-4 p-3.5 rounded-xl bg-white/60 border border-sage-muted/20", children: [_jsx("h3", { className: "text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-2", children: t.optionsLabel }), _jsx("div", { className: "flex flex-wrap gap-2", children: item.options.map((opt) => (_jsxs("span", { className: "text-[0.8rem] bg-sage-muted/20 text-chocolate px-3 py-1.5 rounded-full font-medium", children: [pickLabeled(locale, opt, 'name'), opt.extraPrice > 0 && (_jsxs("span", { className: "text-sage-dark ms-1", children: ["+", opt.extraPrice, " ", t.currency] }))] }, opt.nameFr))) })] })), item.includedChoices && item.includedChoices.length > 0 && (_jsxs("div", { className: "mb-4 p-3.5 rounded-xl bg-sage-muted/10 border border-sage-muted/20", children: [_jsx("h3", { className: "text-[0.7rem] uppercase tracking-wider font-bold text-sage-dark mb-2", children: t.includedLabel }), item.includedChoices.map((choice) => (_jsxs("div", { className: "mb-2.5 last:mb-0", children: [_jsx("span", { className: "text-[0.78rem] font-semibold text-chocolate", children: pickLabeled(locale, choice, 'label') }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-1", children: choice.options.map((opt) => (_jsx("span", { className: "text-[0.72rem] bg-white/70 text-chocolate-muted px-2 py-1 rounded-full", children: pickLabeled(locale, opt, 'name') }, opt.nameFr))) })] }, choice.labelFr)))] })), item.supplements && item.supplements.length > 0 && (_jsxs("div", { className: "mb-4 p-3.5 rounded-xl bg-peach-muted/10 border border-peach-muted/30", children: [_jsx("h3", { className: "text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-2", children: t.supplementsLabel }), item.supplements.map((sup) => (_jsxs("div", { className: "flex justify-between items-center py-1", children: [_jsx("span", { className: "text-[0.82rem] text-chocolate", children: pickLabeled(locale, sup, 'name') }), _jsxs("span", { className: "text-[0.82rem] font-semibold text-peach-dark", children: ["+", sup.price, " ", t.currency] })] }, sup.nameFr)))] })), servingNote && (_jsx("p", { className: "text-[0.8rem] italic text-peach-dark font-medium mb-2", children: servingNote }))] }));
}
