import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';

export type FilterKey = 'vegetarian' | 'chocolate' | 'traditional' | 'signature' | 'popular';

interface FilterChipsProps {
  activeFilters: Set<FilterKey>;
  onToggle: (filter: FilterKey) => void;
}

const filterConfig: { key: FilterKey; labelKey: keyof ReturnType<typeof getLabels>; icon: string }[] = [
  { key: 'vegetarian', labelKey: 'vegetarian', icon: '🌱' },
  { key: 'chocolate', labelKey: 'chocolate', icon: '🍫' },
  { key: 'traditional', labelKey: 'traditional', icon: '🏺' },
  { key: 'signature', labelKey: 'signature', icon: '⭐' },
  { key: 'popular', labelKey: 'popular', icon: '🔥' },
];

function getLabels(t: ReturnType<typeof useI18n>['t']) {
  return {
    vegetarian: t.filterVegetarian,
    chocolate: t.filterChocolate,
    traditional: t.filterTraditional,
    signature: t.filterSignature,
    popular: t.filterPopular,
  };
}

export function FilterChips({ activeFilters, onToggle }: FilterChipsProps) {
  const { t } = useI18n();
  const labels = getLabels(t);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide"
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
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
              text-[0.78rem] font-semibold transition-all duration-200
              min-h-[36px] border
              ${active
                ? 'bg-sage text-white border-sage shadow-sm'
                : 'bg-white/60 text-chocolate-muted border-sage-muted/30 hover:border-sage-muted/60'}
            `}
            style={{ fontFamily: 'var(--font-body)' }}
            aria-pressed={active}
          >
            <span className="text-[0.85rem]">{icon}</span>
            {labels[labelKey]}
          </motion.button>
        );
      })}
    </div>
  );
}
