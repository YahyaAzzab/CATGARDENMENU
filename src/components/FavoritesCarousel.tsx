import { useEffect, useRef } from 'react';
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
  /** Pause while a product sheet is open. */
  suspended?: boolean;
  delay?: number;
}

const PIXELS_PER_SECOND = 36;

export function FavoritesCarousel({
  items,
  onTap,
  suspended = false,
  delay = 0.45,
}: FavoritesCarouselProps) {
  const { t, localized } = useI18n();
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef(false);
  const suspendedRef = useRef(suspended);
  suspendedRef.current = suspended;

  useEffect(() => {
    if (reduce || items.length === 0) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const el = scrollerRef.current;
      const dt = Math.min(now - last, 48);
      last = now;
      if (el && !heldRef.current && !suspendedRef.current && document.visibilityState === 'visible') {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          el.scrollLeft += (dt / 1000) * PIXELS_PER_SECOND;
          if (el.scrollLeft >= half) el.scrollLeft -= half;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const release = () => {
      heldRef.current = false;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [reduce, items.length]);

  const hold = (down: boolean) => {
    heldRef.current = down;
  };

  if (items.length === 0) return null;

  const track = [0, 1].flatMap((copy) => items.map((item) => ({ item, copy })));

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
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 overscroll-x-contain"
        dir="ltr"
        role="list"
        aria-label={t.favoritesTitle}
        onPointerDown={() => hold(true)}
        onPointerUp={() => hold(false)}
        onPointerCancel={() => hold(false)}
        onLostPointerCapture={() => hold(false)}
      >
        {track.map(({ item, copy }) => {
          const name = localized(item, 'name');
          const category = getCategoryById(item.categoryId);
          const image = item.image ?? getItemImage(item.id);
          return (
            <button
              key={`${item.id}-${copy}`}
              type="button"
              role="listitem"
              aria-hidden={copy === 1 ? true : undefined}
              tabIndex={copy === 1 ? -1 : 0}
              onClick={() => onTap(item)}
              className="flex w-[168px] flex-shrink-0 flex-col rounded-2xl bg-white text-start shadow-[var(--shadow-card)] border border-sage-muted/15 min-h-[44px] overflow-hidden"
            >
              <div className="flex h-[96px] items-center justify-center bg-[#FDF6EC]">
                {image ? (
                  <img src={image} alt="" draggable={false} loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
