import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FAMILY_IDS, getFamilyById, getFamilySections, getOrderedFamilies, isCompactDrinkItem, } from '../data/families';
import { matchesSearch } from '../lib/filters';
import { useI18n } from '../i18n/I18nContext';
import { FamilyIllustration } from './FamilyIllustration';
import { CategoryNav } from './CategoryNav';
import { MenuItemCard } from './MenuItemCard';
import { pageEase } from '../motion';
export function FamilyView({ familyId, searchQuery, onBack, onSwipeFamily, onOpenItem, entrance = 'rise', }) {
    const { t, localized, locale } = useI18n();
    const reduce = useReducedMotion();
    const family = getFamilyById(familyId);
    const [scrollspyCategory, setScrollspyCategory] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const sectionRefs = useRef(new Map());
    const touchStart = useRef(null);
    const sections = useMemo(() => (family ? getFamilySections(family) : []), [family]);
    const orderedFamilies = getOrderedFamilies();
    useEffect(() => {
        setActiveCategory(null);
        setScrollspyCategory(sections[0]?.category.id ?? null);
    }, [familyId, sections]);
    useEffect(() => {
        if (activeCategory !== null || searchQuery) {
            setScrollspyCategory(null);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-category-id');
                    if (id)
                        setScrollspyCategory(id);
                }
            }
        }, { rootMargin: '-140px 0px -55% 0px', threshold: 0 });
        sectionRefs.current.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [activeCategory, searchQuery, sections]);
    if (!family)
        return null;
    const filteredSections = sections
        .map((section) => ({
        ...section,
        items: section.items.filter((item) => matchesSearch(item, searchQuery)),
    }))
        .filter((s) => s.items.length > 0);
    const displayed = activeCategory
        ? filteredSections.filter((s) => s.category.id === activeCategory)
        : filteredSections;
    const goNeighbor = (dir) => {
        const ids = orderedFamilies.map((f) => f.id);
        const idx = ids.indexOf(familyId);
        const next = ids[(idx + dir + ids.length) % ids.length];
        if (next && next !== familyId)
            onSwipeFamily(next, dir === 1 ? 'next' : 'prev');
    };
    const onTouchStart = (e) => {
        const el = e.target;
        if (el.closest('[data-chips]'))
            return;
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e) => {
        if (!touchStart.current)
            return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            const forward = locale === 'ar' ? dx > 0 : dx < 0;
            goNeighbor(forward ? 1 : -1);
        }
    };
    const name = localized(family, 'name');
    const chipCategories = sections.map((s) => s.category);
    return (_jsxs("div", { onTouchStart: onTouchStart, onTouchEnd: onTouchEnd, children: [_jsxs("div", { className: "relative", children: [_jsxs(motion.div, { layoutId: `fam-visual-${familyId}`, className: "relative h-[148px] overflow-hidden", transition: reduce ? { duration: 0 } : { duration: 0.5, ease: pageEase }, children: [_jsx(FamilyIllustration, { familyId: familyId, variant: "header" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-chocolate/35 via-transparent to-chocolate/10" })] }), _jsxs("div", { className: "absolute inset-x-0 top-0 flex h-[148px] flex-col justify-between p-4", children: [_jsxs("button", { type: "button", onClick: onBack, className: "inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 self-start rounded-full bg-cream/90 px-3 text-[0.94rem] font-bold text-chocolate shadow-sm", "aria-label": t.backHome, children: [_jsx("svg", { className: "rtl-mirror", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", children: _jsx("path", { d: "M15 18l-6-6 6-6" }) }), t.backHome] }), _jsx("div", { children: _jsx("h2", { className: "text-[1.35rem] font-bold leading-tight text-white drop-shadow-sm", style: { fontFamily: 'var(--font-display)' }, children: name }) })] })] }), _jsxs(motion.div, { className: "px-4 pb-8 pt-3", initial: reduce || entrance === 'none' ? false : { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: reduce ? { duration: 0 } : { duration: 0.46, delay: 0.06, ease: pageEase }, children: [_jsx("div", { "data-chips": true, children: _jsx(CategoryNav, { categories: chipCategories, activeCategory: activeCategory, scrollspyHighlight: scrollspyCategory, onSelect: (id) => {
                                setActiveCategory(null);
                                if (id)
                                    setScrollspyCategory(id);
                            }, showAll: false, fadeRight: true, stickyTopClass: "top-[52px]" }) }), displayed.length === 0 && (_jsx("p", { className: "py-12 text-center text-[0.94rem] text-chocolate-muted", children: t.noResults })), _jsx("div", { className: "mt-2 space-y-6", children: displayed.map((section) => {
                            const compact = section.items.every(isCompactDrinkItem);
                            const categoryNote = localized(section.category, 'note');
                            return (_jsxs("section", { id: `cat-${section.category.id}`, "data-category-id": section.category.id, ref: (el) => {
                                    if (el)
                                        sectionRefs.current.set(section.category.id, el);
                                }, children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx("h3", { className: "text-[1.05rem] font-bold text-chocolate", style: { fontFamily: 'var(--font-display)' }, children: localized(section.category, 'name') }), _jsx("div", { className: `h-px flex-1 from-sage-muted/40 to-transparent ${locale === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'}` })] }), _jsx("div", { className: compact ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5', children: section.items.map((item) => (_jsx(MenuItemCard, { item: item, onTap: onOpenItem, compact: compact }, item.id))) }), categoryNote && _jsx("div", { className: "category-note mt-3", children: categoryNote })] }, section.category.id));
                        }) }), _jsx("p", { className: "mt-6 text-center text-[0.94rem] text-chocolate-muted/70", children: FAMILY_IDS.length > 1 ? t.swipeHint : null })] })] }));
}
