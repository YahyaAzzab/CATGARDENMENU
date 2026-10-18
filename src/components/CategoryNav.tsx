import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Category } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { CategoryIcon } from './Icons';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
  scrollspyHighlight?: string | null;
  showAll?: boolean;
  fadeRight?: boolean;
  stickyTopClass?: string;
}

export function CategoryNav({
  categories,
  activeCategory,
  onSelect,
  scrollspyHighlight,
  showAll = true,
  fadeRight = false,
  stickyTopClass = 'top-[52px]',
}: CategoryNavProps) {
  const { t, localized } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollPillIntoView = useCallback((id: string | null) => {
    const container = scrollRef.current;
    if (!container) return;
    const selector = id ? `[data-cat="${id}"]` : '[data-cat="all"]';
    const pill = container.querySelector(selector) as HTMLElement | null;
    if (!pill) return;
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

  const handleSelect = (id: string | null) => {
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

  return (
    <div className={`relative sticky ${stickyTopClass} z-30 -mx-4 bg-cream/90 pt-2 backdrop-blur-md`}>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide"
        role="tablist"
        aria-label="Categories"
      >
        {showAll && (
          <motion.button
            data-cat="all"
            onClick={() => handleSelect(null)}
            whileTap={{ scale: 0.95 }}
            className={`category-pill flex-shrink-0 ${visualActive === null ? 'category-pill-active' : ''}`}
            role="tab"
            aria-selected={visualActive === null}
          >
            {t.allCategories}
          </motion.button>
        )}

        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            data-cat={cat.id}
            onClick={() => handleSelect(cat.id)}
            whileTap={{ scale: 0.95 }}
            className={`category-pill flex-shrink-0 ${visualActive === cat.id ? 'category-pill-active' : ''}`}
            role="tab"
            aria-selected={visualActive === cat.id}
          >
            <CategoryIcon icon={cat.icon} size={16} className="opacity-70" />
            {localized(cat, 'name')}
          </motion.button>
        ))}
      </div>
      {fadeRight && <div className="chips-fade-right" aria-hidden="true" />}
    </div>
  );
}
