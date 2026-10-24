import type { Variants } from 'framer-motion';
import type { PageTravel } from './hooks/useMenuRoute';

/** Shared motion language with the intro iris (SplashScreen). */
export const irisEase = [0.4, 0, 0.2, 1] as const;

/** Soft landing used when a page arrives. */
export const pageEase = [0.22, 1, 0.36, 1] as const;

export const cardSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

export const cascadeStagger = 0.07; // 70ms between family cards

const SLIDE = 72;

function enterOffset({ direction, rtl }: PageTravel) {
  const sign = rtl ? -1 : 1;
  if (direction === 'next') return { x: SLIDE * sign, y: 0 };
  if (direction === 'prev') return { x: -SLIDE * sign, y: 0 };
  if (direction === 'back') return { x: 0, y: -28 };
  return { x: 0, y: 36 };
}

export const pageVariants: Variants = {
  enter: (travel: PageTravel) => ({
    ...enterOffset(travel),
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { duration: 0.48, ease: pageEase },
  },
  exit: (travel: PageTravel) => {
    const enter = enterOffset(travel);
    return {
      x: -enter.x * 0.65,
      y: travel.direction === 'forward' ? -22 : travel.direction === 'back' ? 48 : -enter.y,
      opacity: 0,
      transition: { duration: 0.36, ease: irisEase },
    };
  },
};

export const stillPageVariants: Variants = {
  enter: { opacity: 1, x: 0, y: 0 },
  center: { opacity: 1, x: 0, y: 0, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};
