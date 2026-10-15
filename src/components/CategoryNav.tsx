import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Category } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { CategoryIcon } from './Icons';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
  /** Scrollspy highlight only — does NOT trigger scroll or filter */
  scrollspyHighlight?: string | null;
}

export function CategoryNav({ categories, activeCategory, onSelect, scrollspyHighlight }: CategoryNavProps) {
  const { t, localized } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll a pill into horizontal view WITHOUT affecting vertical page scroll
  const scrollPillIntoView = useCallback((id: string | null) => {
    const container = scrollRef.current;
    if (!container) return;
    const selector = id ? `[data-cat="${id}"]` : '[data-cat="all"]';
    const pill = container.querySelector(selector) as HTMLElement | null;
    if (!pill) return;

    // Calculate horizontal scroll to center the pill
    const pillLeft = pill.offsetLeft;
    const pillWidth = pill.offsetWidth;
    const containerWidth = container.offsetWidth;
    const scrollTarget = pillLeft - containerWidth / 2 + pillWidth / 2;

    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, []);

  // When the user manually selects a category, scroll the pill
  useEffect(() => {
    scrollPillIntoView(activeCategory);
  }, [activeCategory, scrollPillIntoView]);

  // When scrollspy highlights a category, scroll the pill (but gently)
  useEffect(() => {
    if (scrollspyHighlight && activeCategory === null) {
      scrollPillIntoView(scrollspyHighlight);
    }
  }, [scrollspyHighlight, activeCategory, scrollPillIntoView]);

  // The visual highlight: manual selection wins, then scrollspy, then "all"
  const visualActive = activeCategory ?? scrollspyHighlight ?? null;

  const handleSelect = (id: string | null) => {
    onSelect(id);
    // Smooth scroll to category section only on explicit user tap
    if (id) {
      const el = document.getElementById(`cat-${id}`);
      if (el) {
        const headerOffset = 120; // sticky header + nav + filters height
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      // "Tout" tapped → just clear filter, don't scroll
      // User stays where they are
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-[52px] z-30 bg-cream/90 backdrop-blur-md pt-2 -mx-4 px-4"
      role="tablist"
      aria-label="Categories"
    >
      {/* "All" pill */}
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
          <CategoryIcon icon={cat.icon} size={14} className="opacity-70" />
          {localized(cat, 'name')}
        </motion.button>
      ))}
    </div>
  );
}
