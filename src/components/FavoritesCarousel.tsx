import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { MenuItem } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { useItemImage } from '../lib/itemImages';
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
  const { t, localized, locale } = useI18n();
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const heldRef = useRef(false);
  const draggedRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; x: number; offset: number; moved: boolean } | null>(null);
  const suspendedRef = useRef(suspended);
  suspendedRef.current = suspended;

  const place = (offset: number) => {
    const track = trackRef.current;
    if (!track) return;
    const groups = track.children;
    const period =
      groups.length >= 2
        ? (groups[1] as HTMLElement).offsetLeft - (groups[0] as HTMLElement).offsetLeft
        : 0;
    let next = offset;
    if (period > 0) {
      next = next % period;
      if (next < 0) next += period;
    }
    offsetRef.current = next;
    track.style.transform = `translate3d(${-next}px,0,0)`;
  };

  useEffect(() => {
    if (reduce || items.length === 0) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;
      if (!heldRef.current && !suspendedRef.current && document.visibilityState === 'visible') {
        place(offsetRef.current + (dt / 1000) * PIXELS_PER_SECOND);
      }
      frame = requestAnimationFrame(tick);
    };

    const release = () => {
      dragRef.current = null;
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

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    heldRef.current = true;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      offset: offsetRef.current,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 6) drag.moved = true;
    place(drag.offset - dx);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId && drag.moved) {
      draggedRef.current = true;
      window.setTimeout(() => {
        draggedRef.current = false;
      }, 80);
    }
    dragRef.current = null;
    heldRef.current = false;
  };

  if (items.length === 0) return null;

  const renderCard = (item: MenuItem, copy: number) => {
    const name = localized(item, 'name');
    return (
      <button
        key={`${item.id}-${copy}`}
        type="button"
        role="listitem"
        aria-hidden={copy === 1 ? true : undefined}
        tabIndex={copy === 1 ? -1 : 0}
        onClick={() => {
          if (draggedRef.current) return;
          onTap(item);
        }}
        dir={locale === 'ar' ? 'rtl' : undefined}
        className="flex w-[168px] flex-shrink-0 flex-col rounded-2xl bg-white text-start shadow-[var(--shadow-card)] border border-sage-muted/15 min-h-[44px] overflow-hidden"
      >
        <FavoriteImage item={item} />
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
  };

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
        className="-mx-4 select-none overflow-hidden"
        dir="ltr"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-2.5 px-4"
          role="list"
          aria-label={t.favoritesTitle}
        >
          <div className="flex gap-2.5">{items.map((item) => renderCard(item, 0))}</div>
          <div className="flex gap-2.5" aria-hidden="true">
            {items.map((item) => renderCard(item, 1))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FavoriteImage({ item }: { item: MenuItem }) {
  const loaded = useItemImage(item.id, !item.image);
  const image = item.image ?? loaded;
  const category = getCategoryById(item.categoryId);

  return (
    <div className="flex h-[96px] items-center justify-center bg-[#FDF6EC]">
      {image ? (
        <img
          src={image}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        category && <CategoryIcon icon={category.icon} size={32} className="text-sage-dark/45" />
      )}
    </div>
  );
}
