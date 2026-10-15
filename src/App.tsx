import { useState, useMemo, useEffect, useRef } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { categories, menuItems, getItemsByCategory } from './data/menu';
import type { MenuItem } from './data/types';

import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryNav } from './components/CategoryNav';
import { SearchBar } from './components/SearchBar';
import { FilterChips } from './components/FilterChips';
import type { FilterKey } from './components/FilterChips';
import { MenuItemCard } from './components/MenuItemCard';
import { ProductBottomSheet } from './components/ProductBottomSheet';
import { Footer } from './components/Footer';
import { CategoryIcon, PawPrint } from './components/Icons';

import './index.css';

// ─── URL table param ────────────────────────────────────────────
function getTableNumber(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('table');
}

// ─── Filter logic ───────────────────────────────────────────────
function matchesFilters(item: MenuItem, filters: Set<FilterKey>): boolean {
  if (filters.size === 0) return true;
  for (const f of filters) {
    switch (f) {
      case 'vegetarian': if (!item.tags.includes('vegetarian')) return false; break;
      case 'chocolate': if (!item.tags.includes('chocolate')) return false; break;
      case 'traditional': if (!item.tags.includes('traditional')) return false; break;
      case 'signature': if (!item.badges.includes('signature')) return false; break;
      case 'popular': if (!item.badges.includes('popular')) return false; break;
    }
  }
  return true;
}

function matchesSearch(item: MenuItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.nameFr.toLowerCase().includes(q) ||
    item.nameEn.toLowerCase().includes(q) ||
    (item.descriptionFr?.toLowerCase().includes(q) ?? false) ||
    (item.descriptionEn?.toLowerCase().includes(q) ?? false)
  );
}

// ─── Menu Page ──────────────────────────────────────────────────
function MenuPage() {
  const { t, localized } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const tableNumber = useMemo(getTableNumber, []);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    []
  );

  // ─── Scrollspy with IntersectionObserver ────────────────────

  // Setup scrollspy
  const [scrollspyCategory, setScrollspyCategory] = useState<string | null>(null);

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
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );

    // Observe all section headers
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery, sortedCategories]);

  // ─── Filtered items ─────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return menuItems.filter(
      (item) => matchesSearch(item, searchQuery) && matchesFilters(item, activeFilters)
    );
  }, [searchQuery, activeFilters]);

  const displayedCategories = useMemo(() => {
    if (activeCategory) {
      return sortedCategories.filter((c) => c.id === activeCategory);
    }
    // In "all" mode, only show categories that have items after filtering
    return sortedCategories.filter((c) =>
      filteredItems.some((item) => item.categoryId === c.id)
    );
  }, [activeCategory, sortedCategories, filteredItems]);

  const filteredCount = filteredItems.length;

  // scrollspyCategory is passed as a SEPARATE prop for visual highlight only

  // Toggle filter
  const handleFilterToggle = (filter: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-x-hidden">
      {/* Watermark paw */}
      <div className="paw-watermark">
        <PawPrint size={120} className="text-chocolate" />
      </div>

      {/* Header */}
      <Header />

      {/* Hero */}
      <HeroSection tableNumber={tableNumber} />

      {/* Main content */}
      <main className="px-4 pb-2">
        {/* Title + count */}
        <div className="flex items-center justify-between mb-1">
          <h2
            className="text-lg text-chocolate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.menuTitle}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-chocolate-muted font-medium">
              {t.itemCount(filteredCount)}
            </span>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {/* Category Navigation */}
        <CategoryNav
          categories={sortedCategories}
          activeCategory={activeCategory}
          scrollspyHighlight={scrollspyCategory}
          onSelect={(id) => {
            setActiveCategory(id);
            setScrollspyCategory(null);
          }}
        />

        {/* Filters */}
        <div className="mt-2">
          <FilterChips activeFilters={activeFilters} onToggle={handleFilterToggle} />
        </div>

        {/* No results */}
        {displayedCategories.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="var(--color-sage-muted)" opacity="0.3" className="mb-3">
              <ellipse cx="32" cy="42" rx="14" ry="12"/>
              <ellipse cx="18" cy="24" rx="7" ry="8" transform="rotate(-15 18 24)"/>
              <ellipse cx="32" cy="20" rx="7" ry="8"/>
              <ellipse cx="46" cy="24" rx="7" ry="8" transform="rotate(15 46 24)"/>
            </svg>
            <p className="text-sm text-chocolate-muted">{t.noResults}</p>
          </div>
        )}

        {/* Menu Sections */}
        <div className="mt-3 space-y-6">
          {displayedCategories.map((category) => {
            const items = activeCategory
              ? getItemsByCategory(category.id).filter(
                  (item) => matchesSearch(item, searchQuery) && matchesFilters(item, activeFilters)
                )
              : filteredItems.filter((item) => item.categoryId === category.id);

            if (items.length === 0) return null;

            const categoryNote = localized(category, 'note');

            return (
              <section
                key={category.id}
                id={`cat-${category.id}`}
                data-category-id={category.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(category.id, el);
                }}
              >
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-sage-muted/50 flex items-center justify-center">
                    <CategoryIcon icon={category.icon} size={18} className="text-sage-dark" />
                  </div>
                  <h3
                    className="text-[1.05rem] font-bold text-chocolate"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {localized(category, 'name')}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-sage-muted/40 to-transparent" />
                </div>

                {/* Items */}
                <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onTap={setSelectedItem}
                    />
                  ))}
                </div>

                {/* Category note */}
                {categoryNote && (
                  <div className="category-note mt-3">
                    {categoryNote}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom Sheet */}
      <ProductBottomSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

// ─── App Root ───────────────────────────────────────────────────
export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Check immediately if splash was seen
  const skipSplash = typeof window !== 'undefined' && sessionStorage.getItem('catsgarden_splash') === '1';

  return (
    <I18nProvider>
      {!skipSplash && !splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}
      <div
        className="app-content"
        style={(!skipSplash && !splashDone) ? { visibility: 'hidden' } : undefined}
      >
        <MenuPage />
      </div>
    </I18nProvider>
  );
}
