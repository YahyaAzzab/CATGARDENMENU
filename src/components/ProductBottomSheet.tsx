import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem } from '../data/types';
import { useI18n } from '../i18n/I18nContext';
import { pickLabeled, type Locale } from '../i18n/translations';
import { Badge, Chip } from './UIComponents';
import { getCategoryById } from '../data/menu';
import { CategoryIcon } from './Icons';
import { getItemImage } from '../lib/itemImages';

interface BottomSheetProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ProductBottomSheet({ item, onClose }: BottomSheetProps) {
  const { locale, t, localized } = useI18n();

  // Lock body scroll when open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [item]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[88vh] flex flex-col bg-cream rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-chocolate-muted/20" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain px-5 pb-6 flex-1">
              <SheetContent item={item} locale={locale} t={t} localized={localized} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SheetContent({ item, locale, t, localized }: {
  item: MenuItem;
  locale: Locale;
  t: ReturnType<typeof useI18n>['t'];
  localized: ReturnType<typeof useI18n>['localized'];
}) {
  const name = localized(item, 'name');
  const description = localized(item, 'description');
  const priceNote = localized(item, 'priceNote');
  const servingNote = localized(item, 'servingNote');
  const category = getCategoryById(item.categoryId);
  const image = item.image ?? getItemImage(item.id);

  const visibleTags = item.tags.filter((tag) => !['hot', 'cold'].includes(tag));

  return (
    <>
      {/* Placeholder image */}
      <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl bg-[#FDF6EC]">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.12]">
            {category && <CategoryIcon icon={category.icon} size={64} className="text-sage" />}
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-cream/70 flex items-center justify-center">
            <span className="text-sm font-bold text-chocolate-muted bg-white/80 px-4 py-2 rounded-full">
              {t.exhausted}
            </span>
          </div>
        )}
      </div>

      {/* Name + Price */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2
          className="text-xl font-bold text-chocolate leading-tight flex-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {name}
        </h2>
        <div className="flex-shrink-0 text-right">
          {item.price !== null ? (
            <span className="text-xl font-bold" style={{ color: 'var(--color-sage-dark)', fontFamily: 'var(--font-display)' }}>
              {t.priceFormat(item.price)}
            </span>
          ) : (
            <span className="text-sm italic text-chocolate-muted">{priceNote}</span>
          )}
        </div>
      </div>

      {/* Badges */}
      {item.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.badges.map((badge) => (
            <Badge key={badge} badge={badge} />
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="mb-4">
          <h3 className="text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-1.5">
            {t.composition}
          </h3>
          <p className="text-[0.88rem] text-chocolate-muted leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visibleTags.map((tag) => (
            <Chip key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Options */}
      {item.options && item.options.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-white/60 border border-sage-muted/20">
          <h3 className="text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-2">
            {t.optionsLabel}
          </h3>
          <div className="flex flex-wrap gap-2">
            {item.options.map((opt) => (
              <span
                key={opt.nameFr}
                className="text-[0.8rem] bg-sage-muted/20 text-chocolate px-3 py-1.5 rounded-full font-medium"
              >
                {pickLabeled(locale, opt, 'name')}
                {opt.extraPrice > 0 && (
                  <span className="text-sage-dark ms-1">+{opt.extraPrice} {t.currency}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Included choices (brunch) */}
      {item.includedChoices && item.includedChoices.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-sage-muted/10 border border-sage-muted/20">
          <h3 className="text-[0.7rem] uppercase tracking-wider font-bold text-sage-dark mb-2">
            {t.includedLabel}
          </h3>
          {item.includedChoices.map((choice) => (
            <div key={choice.labelFr} className="mb-2.5 last:mb-0">
              <span className="text-[0.78rem] font-semibold text-chocolate">
                {pickLabeled(locale, choice, 'label')}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {choice.options.map((opt) => (
                  <span
                    key={opt.nameFr}
                    className="text-[0.72rem] bg-white/70 text-chocolate-muted px-2 py-1 rounded-full"
                  >
                    {pickLabeled(locale, opt, 'name')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplements */}
      {item.supplements && item.supplements.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-peach-muted/10 border border-peach-muted/30">
          <h3 className="text-[0.7rem] uppercase tracking-wider font-bold text-chocolate-muted mb-2">
            {t.supplementsLabel}
          </h3>
          {item.supplements.map((sup) => (
            <div key={sup.nameFr} className="flex justify-between items-center py-1">
              <span className="text-[0.82rem] text-chocolate">
                {pickLabeled(locale, sup, 'name')}
              </span>
              <span className="text-[0.82rem] font-semibold text-peach-dark">
                +{sup.price} {t.currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Serving note */}
      {servingNote && (
        <p className="text-[0.8rem] italic text-peach-dark font-medium mb-2">
          {servingNote}
        </p>
      )}
    </>
  );
}
