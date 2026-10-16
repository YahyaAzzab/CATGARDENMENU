import { motion, useReducedMotion } from 'framer-motion';
import type { MenuItem } from '../data/types';
import type { FamilyId } from '../data/families';
import {
  getFamilyItemCount,
  getOrderedFamilies,
  isBrunchHours,
} from '../data/families';
import { menuItems } from '../data/menu';
import { matchesSearch } from '../lib/filters';
import { useI18n } from '../i18n/I18nContext';
import { SearchBar } from './SearchBar';
import { FamilyCard } from './FamilyCard';
import { FavoritesCarousel } from './FavoritesCarousel';
import { MenuItemCard } from './MenuItemCard';
import { cardSpring, cascadeStagger } from '../motion';

interface HomeViewProps {
  tableNumber: string | null;
  ready: boolean;
  fromSplash: boolean;
  searchQuery: string;
  onSearch: (q: string) => void;
  onOpenFamily: (id: FamilyId) => void;
  onOpenItem: (item: MenuItem) => void;
}

export function HomeView({
  tableNumber,
  ready,
  fromSplash,
  searchQuery,
  onSearch,
  onOpenFamily,
  onOpenItem,
}: HomeViewProps) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const brunchTime = isBrunchHours();
  const ordered = getOrderedFamilies(brunchTime);
  const headerDelay = fromSplash ? ordered.length * cascadeStagger + 0.08 : 0.12;

  const favorites = menuItems.filter(
    (item) => item.badges.includes('signature') || item.badges.includes('popular')
  );

  const searchResults = searchQuery
    ? menuItems.filter((item) => matchesSearch(item, searchQuery))
    : [];

  const sizeFor = (id: FamilyId, featured: boolean): 'lg' | 'md' | 'sm' => {
    if (featured) return 'lg';
    if (id === 'hot-drinks' || id === 'sweet') return 'lg';
    if (id === 'cold-drinks') return 'sm';
    return 'md';
  };

  return (
    <div className="px-4 pb-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={reduce ? { duration: 0 } : { ...cardSpring, delay: headerDelay }}
      >
        <div className="mb-2 flex items-end justify-between gap-2">
          <h2
            className="text-[1.15rem] text-chocolate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.menuTitle}
          </h2>
          {tableNumber && (
            <span className="mb-0.5 inline-flex min-h-[44px] items-center rounded-full bg-sage/10 px-3 text-[0.94rem] font-bold text-sage-dark">
              {t.tableGreeting(tableNumber)}
            </span>
          )}
        </div>
        <SearchBar value={searchQuery} onChange={onSearch} />
      </motion.div>

      {searchQuery ? (
        <div className="mt-1">
          <p className="mb-2 text-[0.94rem] text-chocolate-muted">
            {t.itemCount(searchResults.length)}
          </p>
          {searchResults.length === 0 ? (
            <p className="py-10 text-center text-[0.94rem] text-chocolate-muted">{t.noResults}</p>
          ) : (
            <div className="space-y-2.5">
              {searchResults.map((item) => (
                <MenuItemCard key={item.id} item={item} onTap={onOpenItem} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="relative mt-2">
            <div className="grid grid-cols-2 items-start gap-2.5">
              {ordered.map((family, index) => {
                const featured = brunchTime && family.id === 'breakfast';
                return (
                  <FamilyCard
                    key={family.id}
                    family={family}
                    count={getFamilyItemCount(family)}
                    featured={featured}
                    size={sizeFor(family.id, featured)}
                    index={index}
                    ready={ready}
                    fromSplash={fromSplash}
                    onSelect={onOpenFamily}
                  />
                );
              })}
            </div>
          </div>

          <FavoritesCarousel
            items={favorites}
            onTap={onOpenItem}
            delay={fromSplash ? headerDelay + 0.08 : 0.2}
          />
        </>
      )}
    </div>
  );
}
