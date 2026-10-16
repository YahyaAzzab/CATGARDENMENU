import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { MenuItem } from '../data/types';
import {
  FAMILY_IDS,
  getFamilyById,
  getFamilySections,
  getOrderedFamilies,
  isCompactDrinkItem,
  type FamilyId,
} from '../data/families';
import { matchesFilters, matchesSearch } from '../lib/filters';
import { useI18n } from '../i18n/I18nContext';
import { FamilyIllustration } from './FamilyIllustration';
import { CategoryNav } from './CategoryNav';
import { FilterChips, type FilterKey } from './FilterChips';
import { MenuItemCard } from './MenuItemCard';
import { irisEase } from '../motion';

interface FamilyViewProps {
  familyId: FamilyId;
  searchQuery: string;
  onBack: () => void;
  onSwipeFamily: (id: FamilyId) => void;
  onOpenItem: (item: MenuItem) => void;
}

export function FamilyView({
  familyId,
  searchQuery,
  onBack,
  onSwipeFamily,
  onOpenItem,
}: FamilyViewProps) {
  const { t, localized } = useI18n();
  const reduce = useReducedMotion();
  const family = getFamilyById(familyId);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [scrollspyCategory, setScrollspyCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const sections = useMemo(() => (family ? getFamilySections(family) : []), [family]);
  const orderedFamilies = getOrderedFamilies();

  useEffect(() => {
    setActiveCategory(null);
    setScrollspyCategory(sections[0]?.category.id ?? null);
    setActiveFilters(new Set());
  }, [familyId, sections]);

  useEffect(() => {
    if (activeCategory !== null || searchQuery) {
      setScrollspyCategory(null);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-category-id');
            if (id) setScrollspyCategory(id);
          }
        }
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 }
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery, sections]);

  if (!family) return null;

  const handleFilterToggle = (filter: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => matchesSearch(item, searchQuery) && matchesFilters(item, activeFilters)
      ),
    }))
    .filter((s) => s.items.length > 0);

  const displayed = activeCategory
    ? filteredSections.filter((s) => s.category.id === activeCategory)
    : filteredSections;

  const goNeighbor = (dir: 1 | -1) => {
    const ids = orderedFamilies.map((f) => f.id);
    const idx = ids.indexOf(familyId);
    const next = ids[(idx + dir + ids.length) % ids.length];
    if (next && next !== familyId) onSwipeFamily(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('[data-chips]')) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      goNeighbor(dx < 0 ? 1 : -1);
    }
  };

  const name = localized(family, 'name');
  const chipCategories = sections.map((s) => s.category);

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="relative">
        <motion.div
          layoutId={`fam-visual-${familyId}`}
          className="relative h-[148px] overflow-hidden"
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: irisEase }}
        >
          <FamilyIllustration familyId={familyId} variant="header" />
          <div className="absolute inset-0 bg-gradient-to-t from-chocolate/35 via-transparent to-chocolate/10" />
        </motion.div>

        <div className="absolute inset-x-0 top-0 flex h-[148px] flex-col justify-between p-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 self-start rounded-full bg-cream/90 px-3 text-[0.94rem] font-bold text-chocolate shadow-sm"
            aria-label={t.backHome}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t.backHome}
          </button>
          <div>
            <h2
              className="text-[1.35rem] font-bold leading-tight text-white drop-shadow-sm"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {name}
            </h2>
            {family.nameFr !== family.nameEn && (
              <p className="text-[0.94rem] text-white/90">{family.nameEn}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-3">
        <div data-chips>
          <CategoryNav
            categories={chipCategories}
            activeCategory={activeCategory}
            scrollspyHighlight={scrollspyCategory}
            onSelect={(id) => {
              setActiveCategory(null);
              if (id) setScrollspyCategory(id);
            }}
            showAll={false}
            fadeRight
            stickyTopClass="top-[52px]"
          />
        </div>

        <div className="mt-2">
          <FilterChips activeFilters={activeFilters} onToggle={handleFilterToggle} />
        </div>

        {displayed.length === 0 && (
          <p className="py-12 text-center text-[0.94rem] text-chocolate-muted">{t.noResults}</p>
        )}

        <div className="mt-2 space-y-6">
          {displayed.map((section) => {
            const compact = section.items.every(isCompactDrinkItem);
            const categoryNote = localized(section.category, 'note');
            return (
              <section
                key={section.category.id}
                id={`cat-${section.category.id}`}
                data-category-id={section.category.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(section.category.id, el);
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <h3
                    className="text-[1.05rem] font-bold text-chocolate"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {localized(section.category, 'name')}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-sage-muted/40 to-transparent" />
                </div>

                <div className={compact ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                  {section.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onTap={onOpenItem}
                      compact={compact}
                    />
                  ))}
                </div>

                {categoryNote && <div className="category-note mt-3">{categoryNote}</div>}
              </section>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[0.94rem] text-chocolate-muted/70">
          {FAMILY_IDS.length > 1 ? t.swipeHint : null}
        </p>
      </div>
    </div>
  );
}
