import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getFamilyItemCount, getOrderedFamilies, isBrunchHours, } from '../data/families';
import { menuItems } from '../data/menu';
import { getSpotlightItems } from '../lib/daypart';
import { matchesSearch } from '../lib/filters';
import { useI18n } from '../i18n/I18nContext';
import { BoutiqueInvite } from './BoutiqueInvite';
import { SearchBar } from './SearchBar';
import { FamilyCard } from './FamilyCard';
import { FavoritesCarousel } from './FavoritesCarousel';
import { MenuItemCard } from './MenuItemCard';
import { cardSpring, cascadeStagger } from '../motion';
let homeSeen = false;
export function HomeView({ tableNumber, ready, fromSplash, searchQuery, onSearch, onOpenFamily, onOpenItem, spotlightPaused = false, }) {
    const { t } = useI18n();
    const reduce = useReducedMotion();
    const brunchTime = isBrunchHours();
    const ordered = getOrderedFamilies(brunchTime);
    const firstReveal = fromSplash && !homeSeen;
    const headerDelay = firstReveal ? ordered.length * cascadeStagger + 0.08 : 0.05;
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        homeSeen = true;
    }, []);
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(id);
    }, []);
    const favorites = getSpotlightItems(now);
    const searchResults = searchQuery
        ? menuItems.filter((item) => matchesSearch(item, searchQuery))
        : [];
    const sizeFor = (id, featured) => {
        if (featured)
            return 'lg';
        if (id === 'hot-drinks' || id === 'sweet')
            return 'lg';
        if (id === 'cold-drinks')
            return 'sm';
        return 'md';
    };
    return (_jsxs("div", { className: "px-4 pb-4", children: [_jsxs(motion.div, { initial: reduce ? false : { opacity: 0, y: 10 }, animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }, transition: reduce ? { duration: 0 } : { ...cardSpring, delay: headerDelay }, children: [_jsxs("div", { className: "mb-2 flex items-end justify-between gap-2", children: [_jsx("h2", { className: "text-[1.15rem] text-chocolate", style: { fontFamily: 'var(--font-display)' }, children: t.menuTitle }), tableNumber && (_jsx("span", { className: "mb-0.5 inline-flex min-h-[44px] items-center rounded-full bg-sage/10 px-3 text-[0.94rem] font-bold text-sage-dark", children: t.tableGreeting(tableNumber) }))] }), _jsx(SearchBar, { value: searchQuery, onChange: onSearch }), _jsx(BoutiqueInvite, {})] }), searchQuery ? (_jsxs("div", { className: "mt-1", children: [_jsx("p", { className: "mb-2 text-[0.94rem] text-chocolate-muted", children: t.itemCount(searchResults.length) }), searchResults.length === 0 ? (_jsx("p", { className: "py-10 text-center text-[0.94rem] text-chocolate-muted", children: t.noResults })) : (_jsx("div", { className: "space-y-2.5", children: searchResults.map((item) => (_jsx(MenuItemCard, { item: item, onTap: onOpenItem }, item.id))) }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "relative mt-2", children: _jsx("div", { className: "grid grid-cols-2 items-stretch gap-2.5", children: ordered.map((family, index) => {
                                const featured = family.id === 'breakfast';
                                return (_jsx(FamilyCard, { family: family, count: getFamilyItemCount(family), featured: featured, size: sizeFor(family.id, featured), index: index, ready: ready, fromSplash: firstReveal, onSelect: onOpenFamily }, family.id));
                            }) }) }), _jsx(FavoritesCarousel, { items: favorites, onTap: onOpenItem, suspended: spotlightPaused, delay: firstReveal ? headerDelay + 0.08 : 0.12 })] }))] }));
}
