import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { CategoryIcon } from './Icons';
import { playUiSound } from '../lib/uiSound';
export function CategoryNav({ categories, activeCategory, onSelect, scrollspyHighlight, showAll = true, fadeRight = false, stickyTopClass = 'top-[52px]', }) {
    const { t, localized } = useI18n();
    const scrollRef = useRef(null);
    const scrollPillIntoView = useCallback((id) => {
        const container = scrollRef.current;
        if (!container)
            return;
        const selector = id ? `[data-cat="${id}"]` : '[data-cat="all"]';
        const pill = container.querySelector(selector);
        if (!pill)
            return;
        const cRect = container.getBoundingClientRect();
        const pRect = pill.getBoundingClientRect();
        const delta = pRect.left + pRect.width / 2 - (cRect.left + cRect.width / 2);
        container.scrollBy({ left: delta, behavior: 'smooth' });
    }, []);
    useEffect(() => {
        scrollPillIntoView(activeCategory);
    }, [activeCategory, scrollPillIntoView]);
    useEffect(() => {
        if (scrollspyHighlight && activeCategory === null) {
            scrollPillIntoView(scrollspyHighlight);
        }
    }, [scrollspyHighlight, activeCategory, scrollPillIntoView]);
    const visualActive = activeCategory ?? scrollspyHighlight ?? (showAll ? null : categories[0]?.id ?? null);
    const handleSelect = (id) => {
        onSelect(id);
        if (id) {
            const el = document.getElementById(`cat-${id}`);
            if (el) {
                const headerOffset = 130;
                const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    };
    return (_jsxs("div", { className: `relative sticky ${stickyTopClass} z-30 -mx-4 bg-cream/90 pt-2 backdrop-blur-md`, children: [_jsxs("div", { ref: scrollRef, className: "flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide", role: "tablist", "aria-label": "Categories", children: [showAll && (_jsx(motion.button, { "data-cat": "all", onPointerDown: () => playUiSound('meow'), onClick: () => handleSelect(null), whileTap: { scale: 0.95 }, className: `category-pill flex-shrink-0 ${visualActive === null ? 'category-pill-active' : ''}`, role: "tab", "aria-selected": visualActive === null, children: t.allCategories })), categories.map((cat) => (_jsxs(motion.button, { "data-cat": cat.id, onPointerDown: () => playUiSound('meow'), onClick: () => handleSelect(cat.id), whileTap: { scale: 0.95 }, className: `category-pill flex-shrink-0 ${visualActive === cat.id ? 'category-pill-active' : ''}`, role: "tab", "aria-selected": visualActive === cat.id, children: [_jsx(CategoryIcon, { icon: cat.icon, size: 16, className: "opacity-70" }), localized(cat, 'name')] }, cat.id)))] }), fadeRight && _jsx("div", { className: "chips-fade-right", "aria-hidden": "true" })] }));
}
