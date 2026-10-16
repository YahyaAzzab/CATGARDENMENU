import { motion, useReducedMotion } from 'framer-motion';
import type { MenuItem } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { getItemImage } from '../lib/itemImages';
import { cardSpring } from '../motion';

interface FavoritesCarouselProps {
  items: MenuItem[];
  onTap: (item: MenuItem) => void;
  delay?: number;
}

export function FavoritesCarousel({ items, onTap, delay = 0.45 }: FavoritesCarouselProps) {
  const { t, localized } = useI18n();
  const reduce = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <motion.section
      className="mt-3"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { ...cardSpring, delay }}
    >
      <h2
        className="mb-2 px-0.5 text-[1rem] font-bold text-chocolate"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {t.favoritesTitle}
      </h2>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
        role="list"
        aria-label={t.favoritesTitle}
      >
        {items.map((item) => {
          const name = localized(item, 'name');
          const category = getCategoryById(item.categoryId);
          const image = item.image ?? getItemImage(item.id);
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              onClick={() => onTap(item)}
              className="flex w-[168px] flex-shrink-0 flex-col rounded-2xl bg-white text-left shadow-[var(--shadow-card)] border border-sage-muted/15 min-h-[44px] overflow-hidden"
            >
              <div className="flex h-[96px] items-center justify-center bg-[#FDF6EC]">
                {image ? (
                  <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  category && (
                    <CategoryIcon icon={category.icon} size={32} className="text-sage-dark/45" />
                  )
                )}
              </div>
              <div className="p-2.5">
                <p
                  className="text-[0.94rem] font-bold leading-snug text-chocolate line-clamp-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {name}
                </p>
                <p className="mt-1 text-[0.94rem] font-bold text-sage-dark">
                  {item.price !== null ? t.priceFormat(item.price) : '—'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
