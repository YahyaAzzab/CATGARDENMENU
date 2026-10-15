import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { Whiskers, PawPrint } from './Icons';

interface HeroSectionProps {
  tableNumber: string | null;
}

export function HeroSection({ tableNumber }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <motion.section
      className="relative mx-4 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-sage-muted/30 via-cream to-peach-muted/20 p-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      {/* Decorative paw */}
      <div className="absolute top-3 right-3 opacity-[0.07]">
        <PawPrint size={50} className="text-sage" />
      </div>

      <div className="flex items-start gap-3">
        {/* Cat illustration */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
          <Whiskers size={30} className="text-sage-dark" />
        </div>

        <div className="flex-1 min-w-0">
          {tableNumber && (
            <motion.div
              className="inline-flex items-center gap-1.5 bg-sage/10 text-sage-dark text-[0.7rem] font-bold px-2.5 py-1 rounded-full mb-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="12" rx="2" opacity="0.3" />
                <rect x="3" y="16" width="18" height="4" rx="1" />
              </svg>
              {t.tableGreeting(tableNumber)}
            </motion.div>
          )}
          <p
            className="text-[0.95rem] font-bold text-chocolate leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.heroTitle}
          </p>
          <p className="text-[0.78rem] text-chocolate-muted leading-relaxed mt-0.5">
            {t.heroSubtitle}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
