import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';

export type FilterKey = 'vegetarian' | 'chocolate' | 'signature' | 'popular';

interface FilterChipsProps {
  activeFilters: Set<FilterKey>;
  onToggle: (filter: FilterKey) => void;
}

const filterConfig: { key: FilterKey; labelKey: keyof ReturnType<typeof getLabels>; icon: string }[] = [
  { key: 'vegetarian', labelKey: 'vegetarian', icon: '🌱' },
  { key: 'chocolate', labelKey: 'chocolate', icon: '🍫' },
  { key: 'signature', labelKey: 'signature', icon: '⭐' },
  { key: 'popular', labelKey: 'popular', icon: '🔥' },
];

function getLabels(t: ReturnType<typeof useI18n>['t']) {
  return {
    vegetarian: t.filterVegetarian,
    chocolate: t.filterChocolate,
    signature: t.filterSignature,
    popular: t.filterPopular,
  };
}

export function FilterChips({ activeFilters, onToggle }: FilterChipsProps) {
  const { t } = useI18n();
  const labels = getLabels(t);

  return (
    <div
      className="mb-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="group"
      aria-label="Filters"
    >
      {filterConfig.map(({ key, labelKey, icon }) => {
        const active = activeFilters.has(key);
        return (
          <motion.button
            key={key}
            onClick={() => onToggle(key)}
            whileTap={{ scale: 0.93 }}
            className={`
              flex min-h-[44px] flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5
              text-[0.94rem] font-semibold transition-all duration-200
              ${active
                ? 'border-sage bg-sage text-white shadow-sm'
                : 'border-sage-muted/30 bg-white/60 text-chocolate-muted'}
            `}
            style={{ fontFamily: 'var(--font-body)' }}
            aria-pressed={active}
          >
            <span className="text-[0.95rem]">{icon}</span>
            {labels[labelKey]}
          </motion.button>
        );
      })}
    </div>
  );
}
