import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';

interface SplashScreenProps {
  onComplete: () => void;
}

// ─── Cat SVG components (inline, no external assets) ────────────
function CatEars({ show }: { show: boolean }) {
  return (
    <motion.g
      initial={{ y: 20, opacity: 0 }}
      animate={show ? { y: 0, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
    >
      {/* Left ear */}
      <path d="M28,42 L38,8 L52,38" fill="#3E2723" />
      <path d="M32,40 L38,14 L48,36" fill="#E8A87C" />
      {/* Right ear */}
      <path d="M68,42 L82,8 L92,38" fill="#3E2723" />
      <path d="M72,40 L82,14 L88,36" fill="#E8A87C" />
    </motion.g>
  );
}

function CatEyes({ show, blink }: { show: boolean; blink: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={show ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Left eye */}
      <ellipse cx="48" cy="48" rx="10" ry="11" fill="white" />
      <ellipse cx="48" cy="48" rx="9" ry="10" fill="#8BA888" />
      <ellipse cx="48" cy="48" rx="3" ry="9" fill="#3E2723" />
      <circle cx="45" cy="43" r="2.5" fill="white" opacity="0.8" />
      {/* Left eyelid */}
      <motion.ellipse
        cx="48" cy="48" rx="11" ry="12"
        fill="#FDF6EC"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: blink ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        style={{ transformOrigin: '48px 42px' }}
      />
      {/* Right eye */}
      <ellipse cx="72" cy="48" rx="10" ry="11" fill="white" />
      <ellipse cx="72" cy="48" rx="9" ry="10" fill="#8BA888" />
      <ellipse cx="72" cy="48" rx="3" ry="9" fill="#3E2723" />
      <circle cx="69" cy="43" r="2.5" fill="white" opacity="0.8" />
      {/* Right eyelid */}
      <motion.ellipse
        cx="72" cy="48" rx="11" ry="12"
        fill="#FDF6EC"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: blink ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        style={{ transformOrigin: '72px 42px' }}
      />
      {/* Nose */}
      <motion.path
        d="M57,55 L60,59 L63,55 Z"
        fill="#E8A87C"
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
      />
    </motion.g>
  );
}

function CatTail({ show }: { show: boolean }) {
  return (
    <motion.path
      d="M0,15 C20,15 30,0 50,5 C70,10 80,25 100,20 C110,18 115,10 120,12"
      fill="none"
      stroke="#8BA888"
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={show ? { pathLength: 1, opacity: 1 } : {}}
      transition={{ duration: 1, ease: 'easeInOut' }}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState(0);
  // 0: idle, 1: letters, 2: cat ears, 3: eyes, 4: blink, 5: tail+tagline, 6: exit
  const [blink, setBlink] = useState(false);
  const [exiting, setExiting] = useState(false);

  const title = "Cat's Garden";

  const handleExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    sessionStorage.setItem('catsgarden_splash', '1');
    setTimeout(() => onComplete(), 900);
  }, [exiting, onComplete]);

  // Check if splash was already seen
  useEffect(() => {
    if (sessionStorage.getItem('catsgarden_splash')) {
      onComplete();
      return;
    }

    // Reduced motion: simple fade
    if (prefersReducedMotion) {
      setPhase(5);
      const t1 = setTimeout(handleExit, 1500);
      return () => clearTimeout(t1);
    }

    // Animation timeline
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 100));   // start letters
    timers.push(setTimeout(() => setPhase(2), 800));   // ears appear
    timers.push(setTimeout(() => setPhase(3), 1200));  // eyes appear
    timers.push(setTimeout(() => { setPhase(4); setBlink(true); }, 1700)); // blink
    timers.push(setTimeout(() => setBlink(false), 1900)); // open eyes
    timers.push(setTimeout(() => setBlink(true), 2100));  // blink again
    timers.push(setTimeout(() => setBlink(false), 2250)); // open
    timers.push(setTimeout(() => setPhase(5), 2000));  // tail + tagline
    timers.push(setTimeout(handleExit, 3200));          // exit

    return () => timers.forEach(clearTimeout);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream cursor-pointer select-none"
          style={{ touchAction: 'manipulation' }}
          onClick={handleExit}
          exit={{ clipPath: 'circle(0% at 50% 45%)' }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Cat face - positioned above the title */}
          <div className="relative mb-[-8px]">
            <svg viewBox="20 0 80 65" width="100" height="65" fill="none">
              <CatEars show={phase >= 2} />
              <CatEyes show={phase >= 3} blink={blink} />
            </svg>
          </div>

          {/* Title: letter by letter */}
          <h1
            className="text-[2.4rem] leading-none tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-chocolate)' }}
            aria-label={title}
          >
            {title.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                  delay: i * 0.045,
                }}
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* Cat tail */}
          <div className="w-[140px] h-[24px] mt-[-2px] mb-3">
            <svg viewBox="0 0 120 24" width="140" height="24">
              <CatTail show={phase >= 5} />
            </svg>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-sm tracking-wide"
            style={{ color: 'var(--color-sage-dark)', fontFamily: 'var(--font-body)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {t.splashTagline}
          </motion.p>

          {/* Tap to skip hint */}
          <motion.p
            className="absolute bottom-[env(safe-area-inset-bottom,20px)] text-xs opacity-40"
            style={{ color: 'var(--color-chocolate-muted)', fontFamily: 'var(--font-body)', bottom: 'max(env(safe-area-inset-bottom), 24px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ delay: 1.5 }}
          >
            {t.tapToSkip}
          </motion.p>

          {/* Decorative paw prints */}
          <motion.div
            className="absolute top-[15%] left-[10%] opacity-0"
            animate={phase >= 2 ? { opacity: 0.08, rotate: -25 } : {}}
            transition={{ delay: 0.3 }}
          >
            <svg width="40" height="40" viewBox="0 0 64 64" fill="var(--color-sage)">
              <ellipse cx="32" cy="42" rx="14" ry="12"/>
              <ellipse cx="18" cy="24" rx="7" ry="8" transform="rotate(-15 18 24)"/>
              <ellipse cx="32" cy="20" rx="7" ry="8"/>
              <ellipse cx="46" cy="24" rx="7" ry="8" transform="rotate(15 46 24)"/>
            </svg>
          </motion.div>
          <motion.div
            className="absolute bottom-[20%] right-[12%] opacity-0"
            animate={phase >= 3 ? { opacity: 0.06, rotate: 15 } : {}}
            transition={{ delay: 0.5 }}
          >
            <svg width="32" height="32" viewBox="0 0 64 64" fill="var(--color-peach)">
              <ellipse cx="32" cy="42" rx="14" ry="12"/>
              <ellipse cx="18" cy="24" rx="7" ry="8" transform="rotate(-15 18 24)"/>
              <ellipse cx="32" cy="20" rx="7" ry="8"/>
              <ellipse cx="46" cy="24" rx="7" ry="8" transform="rotate(15 46 24)"/>
            </svg>
          </motion.div>
        </motion.div>
      ) : (
        /* Iris exit: a cover that closes like a cat pupil */
        <motion.div
          key="iris"
          className="fixed inset-0 z-[100] bg-cream pointer-events-none"
          initial={{ clipPath: 'circle(150% at 50% 45%)' }}
          animate={{ clipPath: 'circle(0% at 50% 45%)' }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
