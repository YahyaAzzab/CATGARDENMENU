/** Shared motion language with the intro iris (SplashScreen). */
export const irisEase = [0.4, 0, 0.2, 1] as const;

export const cardSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

export const cascadeStagger = 0.07; // 70ms between family cards
