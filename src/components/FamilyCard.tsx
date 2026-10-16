import { motion, useReducedMotion } from 'framer-motion';
import type { Family } from '../data/families';
import { useI18n } from '../i18n/I18nContext';
import { FamilyIllustration } from './FamilyIllustration';
import { cardSpring, cascadeStagger } from '../motion';

interface FamilyCardProps {
  family: Family;
  count: number;
  featured?: boolean;
  size?: 'lg' | 'md' | 'sm';
  index: number;
  ready: boolean;
  fromSplash: boolean;
  onSelect: (id: Family['id']) => void;
}

export function FamilyCard({
  family,
  count,
  featured = false,
  size = 'md',
  index,
  ready,
  fromSplash,
  onSelect,
}: FamilyCardProps) {
  const { localized, t, locale } = useI18n();
  const reduce = useReducedMotion();
  const title = locale === 'ar' ? localized(family, 'name') : family.nameFr;
  const isBilingual = locale !== 'ar' && family.nameFr !== family.nameEn;

  const minH = featured
    ? 'min-h-[108px]'
    : size === 'lg'
      ? 'min-h-[156px]'
      : size === 'sm'
        ? 'min-h-[108px]'
        : 'min-h-[124px]';

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(family.id)}
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-start ${minH} ${
        featured ? 'col-span-2' : ''
      } shadow-[var(--shadow-card)] border border-white/50`}
      style={{ fontFamily: 'var(--font-body)' }}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={ready || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              ...cardSpring,
              delay: fromSplash ? index * cascadeStagger : index * 0.04,
            }
      }
      whileTap={reduce ? undefined : { scale: 0.98 }}
      aria-label={`${localized(family, 'name')}, ${t.itemCount(count)}`}
    >
      <motion.div
        layoutId={`fam-visual-${family.id}`}
        className="absolute inset-0"
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <FamilyIllustration familyId={family.id} />
      </motion.div>

      <div className={`relative z-10 mt-auto p-3 ${featured ? 'max-w-[62%]' : 'max-w-[68%]'}`}>
        <h3
          className={`font-bold leading-tight text-chocolate ${
            featured ? 'text-[1.15rem]' : 'text-[0.98rem]'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>
        {isBilingual && (
          <p className="text-[0.94rem] leading-snug text-chocolate-muted">{family.nameEn}</p>
        )}
        <p className="mt-0.5 text-[0.94rem] font-semibold text-sage-dark">
          {t.itemCount(count)}
        </p>
      </div>
    </motion.button>
  );
}
