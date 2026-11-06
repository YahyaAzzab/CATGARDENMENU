import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { PawPrint } from './Icons';
import { PeekingCat } from './PeekingCat';
import { cardSpring, cascadeStagger, pageEase } from '../motion';

export const RULES_SEEN_KEY = 'catsgarden_rules';

function RuleGlyph({ index }: { index: number }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (index === 0) {
    return (
      <svg {...common}>
        <ellipse cx="6.2" cy="13" rx="1.7" ry="3.1" />
        <ellipse cx="17.8" cy="13" rx="1.7" ry="3.1" />
        <ellipse cx="12" cy="13.4" rx="4.8" ry="4.1" />
        <ellipse cx="12" cy="15.6" rx="2.1" ry="1.45" />
        <circle cx="12" cy="15.2" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="10.1" cy="12.5" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="13.9" cy="12.5" r="0.55" fill="currentColor" stroke="none" />
        <path d="M4.6 19.4 L19.4 4.6" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg {...common}>
        <rect x="2.8" y="11.2" width="13.2" height="3.4" rx="0.8" />
        <path d="M12.6 11.2v3.4" />
        <path d="M17.2 12.2c1.1-1.5.1-2.6 1.3-4.1" />
        <path d="M19.2 13.2c.8-1.2 0-2.2 1-3.4" />
        <path d="M4.2 19.6 L19.8 4.4" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg {...common}>
        <path d="M8.2 20v-4.6" />
        <path d="M15.6 20v-4" />
        <path d="M8.2 15.4c0 2.8 7.4 2.8 7.4 0" />
        <path d="M8.2 15.2V9.4" />
        <path d="M10.7 14.6V7.6" />
        <path d="M13.2 14.6V8.4" />
        <path d="M15.6 15.4V11" />
        <path d="M6.4 6.2c0 1.15.9 1.7.9 1.7s.9-.55.9-1.7S7.3 3.6 7.3 3.6 6.4 5.05 6.4 6.2z" fill="currentColor" stroke="none" />
        <path d="M16.1 5.4c0 .9.75 1.35.75 1.35s.75-.45.75-1.35S17 3.4 17 3.4s-.9 1.1-.9 2z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (index === 3) {
    return (
      <svg {...common}>
        <path d="M4.2 10.2h15.6" />
        <path d="M6 10.2c.5 4.4 2.4 7 6 7s5.5-2.6 6-7" />
        <circle cx="9" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
        <path d="M5 19.2 L19 5.2" />
      </svg>
    );
  }
  if (index === 4) {
    return (
      <svg {...common}>
        <path d="M16.2 16.8c2.2.2 3.4-1.3 2.7-2.6" />
        <ellipse cx="11.2" cy="16.6" rx="6.6" ry="3" />
        <circle cx="7.2" cy="14.6" r="2.7" />
        <path d="M5.2 12.8 L6 9.4 L8 12.2" />
        <path d="M7.4 12.2 L8.8 9.2 L10 12.6" />
        <path d="M6 14.6c.55.45 1.25.45 1.8 0" />
        <path d="M15.2 4.4h4.4L15.2 8h4.4" />
      </svg>
    );
  }
  if (index === 5) {
    return (
      <svg {...common}>
        <path d="M7.4 16.8c0 2.8 2 4.4 4.6 4.4 3 0 5-1.8 5.6-4 .5-1.3 1.7-1.7 2.5-.5" />
        <path d="M7.6 16.6V9.6" />
        <path d="M10.6 16.2V7.4" />
        <path d="M13.6 16.2V8.4" />
        <path d="M16.4 16.8V11" />
        <path d="M4.4 19.6 L19.6 4.4" />
      </svg>
    );
  }
  if (index === 6) {
    return (
      <svg {...common}>
        <path d="M4.2 9.2h3.1l3.6-2.8v11.2l-3.6-2.8H4.2z" fill="currentColor" stroke="none" />
        <path d="M13.4 9.6c1.3.9 1.3 3.9 0 4.8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="6.4" r="2.1" />
      <path d="M4.2 18.8c.5-3.3 2-5 3.8-5s3.3 1.7 3.8 5" />
      <circle cx="16.6" cy="9.6" r="1.55" />
      <path d="M13.6 18.8c.35-2.4 1.45-3.7 3-3.7s2.65 1.3 3 3.7" />
      <path d="M11.2 13.6c1.5.3 3 .9 4.1 1.8" />
    </svg>
  );
}

export function HouseRules({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const rtl = locale === 'ar';

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.28, ease: pageEase }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-chocolate/35 backdrop-blur-[3px]"
            aria-label={t.closeLabel}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="house-rules-title"
            className="relative z-10 w-full max-w-[440px] px-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:px-0 sm:pb-0"
            initial={reduce ? false : { y: 72, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 48, opacity: 0, scale: 0.98 }}
            transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 340, damping: 30 }}
          >
            <div className="pointer-events-none absolute inset-x-0 -top-9 flex justify-center">
              <div className="relative h-12 w-16">
                <PeekingCat delay={reduce ? 0 : 0.12} />
              </div>
            </div>
            <div className="flex max-h-[min(84dvh,740px)] flex-col overflow-hidden rounded-[28px] border border-sage-muted/40 bg-cream shadow-[0_18px_50px_rgba(62,39,35,0.18)]">
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
              <div className="sticky top-0 z-10 -mx-4 mb-1 flex items-start justify-between gap-3 bg-cream/95 px-4 pb-2 pt-5 backdrop-blur-sm">
                <div className="min-w-0">
                  <div className="mb-1 flex h-6 items-end gap-2" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className={i === 1 ? 'text-sage' : 'text-peach'}
                        initial={reduce ? false : { opacity: 0, y: 8, scale: 0.4 }}
                        animate={{ opacity: 0.9, y: 0, scale: 1 }}
                        transition={reduce ? { duration: 0 } : { ...cardSpring, delay: 0.12 + i * 0.08 }}
                      >
                        <PawPrint size={i === 1 ? 16 : 13} />
                      </motion.span>
                    ))}
                  </div>
                  <h2 id="house-rules-title" className="text-[1.7rem] italic leading-tight">
                    <span className="text-chocolate">{t.rulesTitle}</span>
                    <span className="mt-0.5 block text-[1.15rem] text-sage-dark">{t.rulesTitleAccent}</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.closeLabel}
                  autoFocus
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-chocolate shadow-card"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <motion.ul
                className="mt-4 flex flex-col gap-2.5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: reduce ? 0 : cascadeStagger,
                      delayChildren: reduce ? 0 : 0.2,
                    },
                  },
                }}
              >
                {t.rules.map((rule, index) => {
                  const from = (index % 2 === 0 ? -26 : 26) * (rtl ? -1 : 1);
                  const peach = index % 2 === 0;
                  return (
                    <motion.li
                      key={rule}
                      className={`flex items-center gap-3 rounded-[1.4rem] px-2.5 py-2 ${
                        peach ? 'bg-peach-muted' : 'bg-sage-muted/80'
                      }`}
                      variants={{
                        hidden: { opacity: 0, x: from },
                        show: {
                          opacity: 1,
                          x: 0,
                          transition: reduce
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 380, damping: 26 },
                        },
                      }}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream ${
                          peach ? 'text-peach-dark' : 'text-sage-dark'
                        }`}
                      >
                        <RuleGlyph index={index} />
                      </span>
                      <span className="text-[0.95rem] leading-snug text-chocolate">{rule}</span>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.p
                className="mt-4 text-center text-[0.95rem] italic leading-snug text-sage-dark"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.85, duration: 0.4, ease: pageEase }}
              >
                {t.rulesFarewell}
              </motion.p>
            </div>
              <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-sage text-[1rem] font-bold text-white"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0 } : { delay: 0.95, duration: 0.35, ease: pageEase }}
                >
                  {t.rulesSeeMenu}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
