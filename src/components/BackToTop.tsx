import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { PawPrint } from './Icons';
import { cardSpring } from '../motion';

const SHOW_AFTER = 480;

export function BackToTop({ hidden = false }: { hidden?: boolean }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const show = visible && !hidden;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label={t.backToTop}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
          className="fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white shadow-[var(--shadow-floating)]"
          style={{
            bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            insetInlineEnd: '1rem',
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.85 }}
          transition={reduce ? { duration: 0.15 } : cardSpring}
          whileTap={reduce ? undefined : { scale: 0.92 }}
        >
          <motion.span
            className="absolute text-peach-light"
            aria-hidden="true"
            initial={reduce ? { opacity: 0 } : { opacity: 1, scale: 0.2, rotate: -24 }}
            animate={
              reduce
                ? { opacity: 0 }
                : { opacity: [1, 1, 0], scale: [0.2, 1.2, 0.7], rotate: [-24, 10, 0] }
            }
            transition={reduce ? { duration: 0 } : { duration: 0.72, times: [0, 0.42, 1], ease: 'easeOut' }}
          >
            <PawPrint size={26} />
          </motion.span>
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0.15 } : { delay: 0.5, duration: 0.28, ease: 'easeOut' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V6" />
              <path d="M6 11l6-6 6 6" />
            </svg>
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
