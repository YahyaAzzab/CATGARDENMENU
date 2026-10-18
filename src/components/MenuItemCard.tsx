import { useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { MenuItem } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { pickLabeled } from '../i18n/translations';
import { Badge } from './UIComponents';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { getItemImage } from '../lib/itemImages';

interface MenuItemCardProps {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
  compact?: boolean;
}

const placeholderTones = [
  'from-sage-muted/55 to-sage-light/30',
  'from-peach-muted/70 to-peach-light/35',
  'from-rose-light/80 to-cream-dark',
  'from-cream-dark to-sage-muted/40',
];

function toneFor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return placeholderTones[n % placeholderTones.length];
}

export function MenuItemCard({ item, onTap, compact = false }: MenuItemCardProps) {
  const { locale, t, localized } = useI18n();
  const [showPaw, setShowPaw] = useState(false);
  const [pawPos, setPawPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isInView = useInView(cardRef, { once: true, margin: '-30px' });

  const name = localized(item, 'name');
  const description = localized(item, 'description');
  const priceNote = localized(item, 'priceNote');
  const category = getCategoryById(item.categoryId);
  const image = item.image ?? getItemImage(item.id);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      setPawPos({ x: clientX - rect.left, y: clientY - rect.top });
      setShowPaw(true);
      setTimeout(() => setShowPaw(false), 500);
    }
    onTap(item);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`card-menu relative overflow-hidden cursor-pointer active:scale-[0.98] ${
        !item.available ? 'opacity-50 grayscale' : ''
      }`}
      id={`item-${item.id}`}
      onClick={handleTap}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`${name} ${item.price !== null ? t.priceFormat(item.price) : ''}`}
    >
      {showPaw && (
        <motion.div
          className="pointer-events-none absolute z-10"
          style={{ left: pawPos.x - 15, top: pawPos.y - 15 }}
          initial={{ opacity: 0.5, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
        >
          <svg width="30" height="30" viewBox="0 0 64 64" fill="var(--color-sage-muted)" opacity="0.4">
            <ellipse cx="32" cy="42" rx="14" ry="12" />
            <ellipse cx="18" cy="24" rx="7" ry="8" transform="rotate(-15 18 24)" />
            <ellipse cx="32" cy="20" rx="7" ry="8" />
            <ellipse cx="46" cy="24" rx="7" ry="8" transform="rotate(15 46 24)" />
          </svg>
        </motion.div>
      )}

      {compact ? (
        <div className="flex min-h-[72px] flex-col">
          <div className="flex items-start gap-2 p-2.5">
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${toneFor(item.id)}`}
            >
              {image ? (
                <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                category && <CategoryIcon icon={category.icon} size={26} className="text-sage-dark/50" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col py-0.5">
              <h3
                className="text-[0.94rem] font-bold leading-snug text-chocolate line-clamp-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {name}
              </h3>
              <div className="mt-1">
                {item.price !== null ? (
                  <span className="price-tag text-[0.94rem]">{t.priceFormat(item.price)}</span>
                ) : (
                  <span className="text-[0.94rem] italic text-chocolate-muted">{priceNote}</span>
                )}
              </div>
            </div>
          </div>
          {item.badges.length > 0 && (
            <div className="px-2.5 pb-2.5">
              {item.badges.slice(0, 1).map((badge) => (
                <Badge key={badge} badge={badge} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-3 p-3">
            <div
              className={`flex h-[92px] w-[92px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${toneFor(item.id)}`}
            >
              {image ? (
                <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                category && (
                  <CategoryIcon icon={category.icon} size={36} className="text-sage-dark/50" />
                )
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-[0.98rem] font-bold leading-snug text-chocolate line-clamp-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {name}
                </h3>
                <div className="flex-shrink-0 pt-0.5">
                  {item.price !== null ? (
                    <span className="price-tag text-[0.98rem]">{t.priceFormat(item.price)}</span>
                  ) : (
                    <span className="max-w-[72px] text-end text-[0.94rem] leading-tight italic text-chocolate-muted">
                      {priceNote}
                    </span>
                  )}
                </div>
              </div>

              {item.badges.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.badges.map((badge) => (
                    <Badge key={badge} badge={badge} />
                  ))}
                </div>
              )}

              {description && (
                <p className="mt-1 text-[0.94rem] leading-snug text-chocolate-muted line-clamp-2">
                  {description}
                </p>
              )}

              {!item.available && (
                <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[0.94rem] font-bold text-red-700">
                  {t.exhausted}
                </span>
              )}
            </div>
          </div>

          {item.includedChoices && item.includedChoices.length > 0 && (
            <div className="px-3 pb-3 -mt-1">
              <span className="text-[0.94rem] font-semibold text-sage-dark">
                ✦ {t.included} : {item.includedChoices.map((c) => pickLabeled(locale, c, 'label')).join(' + ')}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
