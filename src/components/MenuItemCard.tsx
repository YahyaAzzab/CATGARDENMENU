import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { MenuItem } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { Badge } from './UIComponents';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';

interface MenuItemCardProps {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onTap }: MenuItemCardProps) {
  const { locale, t, localized } = useI18n();
  const [showPaw, setShowPaw] = useState(false);
  const [pawPos, setPawPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-30px' });

  const name = localized(item, 'name');
  const description = localized(item, 'description');
  const priceNote = locale === 'fr' ? item.priceNoteFr : item.priceNoteEn;
  const category = getCategoryById(item.categoryId);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Paw effect
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
      className={`card-menu relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform
        ${!item.available ? 'opacity-50 grayscale' : ''}`}
      id={`item-${item.id}`}
      onClick={handleTap}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      aria-label={`${name} ${item.price !== null ? t.priceFormat(item.price) : ''}`}
    >
      {/* Paw tap effect */}
      {showPaw && (
        <motion.div
          className="absolute z-10 pointer-events-none"
          style={{ left: pawPos.x - 15, top: pawPos.y - 15 }}
          initial={{ opacity: 0.5, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
        >
          <svg width="30" height="30" viewBox="0 0 64 64" fill="var(--color-sage-muted)" opacity="0.4">
            <ellipse cx="32" cy="42" rx="14" ry="12"/>
            <ellipse cx="18" cy="24" rx="7" ry="8" transform="rotate(-15 18 24)"/>
            <ellipse cx="32" cy="20" rx="7" ry="8"/>
            <ellipse cx="46" cy="24" rx="7" ry="8" transform="rotate(15 46 24)"/>
          </svg>
        </motion.div>
      )}

      <div className="flex gap-3 p-3.5">
        {/* Placeholder image */}
        <div className="flex-shrink-0 w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-sage-muted/15 via-cream-dark/20 to-peach-muted/10 flex items-center justify-center overflow-hidden">
          {category && (
            <CategoryIcon icon={category.icon} size={28} className="text-sage-muted/30" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + price row */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3
              className="text-[0.9rem] font-bold leading-snug text-chocolate truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {name}
            </h3>
            <div className="flex-shrink-0">
              {item.price !== null ? (
                <span className="price-tag text-[0.85rem]">{t.priceFormat(item.price)}</span>
              ) : (
                <span className="text-[0.7rem] italic text-chocolate-muted">{priceNote}</span>
              )}
            </div>
          </div>

          {/* Badges */}
          {item.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {item.badges.map((badge) => (
                <Badge key={badge} badge={badge} />
              ))}
            </div>
          )}

          {/* Description (truncated) */}
          {description && (
            <p className="text-[0.75rem] text-chocolate-muted leading-snug line-clamp-2">
              {description}
            </p>
          )}

          {/* Unavailable */}
          {!item.available && (
            <span className="inline-block mt-1 text-[0.65rem] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              {t.exhausted}
            </span>
          )}
        </div>
      </div>

      {/* Included badge hint for brunch */}
      {item.includedChoices && item.includedChoices.length > 0 && (
        <div className="px-3.5 pb-2.5 -mt-1">
          <span className="text-[0.6rem] font-semibold text-sage-dark bg-sage-muted/15 px-2 py-0.5 rounded-full">
            ✦ {t.included} : {item.includedChoices.map(c => locale === 'fr' ? c.labelFr : c.labelEn).join(' + ')}
          </span>
        </div>
      )}

      {/* Supplement hint */}
      {item.supplements && item.supplements.length > 0 && !item.includedChoices?.length && (
        <div className="px-3.5 pb-2.5 -mt-1">
          <span className="text-[0.6rem] text-chocolate-muted/60">
            {item.supplements.map(s => `+${s.price} ${t.currency} ${locale === 'fr' ? s.nameFr : s.nameEn}`).join(' · ')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
