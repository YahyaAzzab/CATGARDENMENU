import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { MenuItem } from './data/types';
import type { FamilyId } from './data/families';

import { SplashMark, SplashVeil } from './components/SplashScreen';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { PawPrint } from './components/Icons';
import { useMenuRoute, type PageDirection } from './hooks/useMenuRoute';
import { pageEase, pageVariants, stillPageVariants } from './motion';
import { preloadUiSounds } from './lib/uiSound';
import {
  getFamilyView,
  getProductSheet,
  loadFamilyView,
  loadProductSheet,
  prefetchMenuScreens,
} from './lib/loadScreens';
import './index.css';

type FamilyViewComponent = ComponentProps<
  NonNullable<ReturnType<typeof getFamilyView>>
>;

function MenuApp({
  ready,
  fromSplash,
  showMark,
}: {
  ready: boolean;
  fromSplash: boolean;
  showMark: boolean;
}) {
  const { familyId, direction, tableNumber, openFamily, goHome, replaceFamily } = useMenuRoute();
  const { locale } = useI18n();
  const reduce = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [pawStep, setPawStep] = useState(0);
  const skipPaws = useRef(true);
  const pageKey = familyId ?? 'home';
  const travel = { direction, rtl: locale === 'ar' };

  useEffect(() => {
    void preloadUiSounds();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const run = () => prefetchMenuScreens();
    const idle = window.requestIdleCallback;
    if (idle) {
      const id = idle(run, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 400);
    return () => window.clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    setSelectedItem(null);
    if (skipPaws.current) {
      skipPaws.current = false;
      return;
    }
    if (reduce) return;
    setPawStep((n) => n + 1);
  }, [pageKey, reduce]);

  const handleOpenFamily = (id: FamilyId) => {
    setSearchQuery('');
    openFamily(id);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream">
      <div className="paw-watermark">
        <PawPrint size={120} className="text-chocolate" />
      </div>

      <Header onLogoClick={goHome} showMark={showMark} />

      <LayoutGroup>
        <div className="page-stage relative">
          <AnimatePresence mode="popLayout" initial={false} custom={travel}>
            {familyId ? (
              <motion.div
                key={familyId}
                custom={travel}
                variants={reduce ? stillPageVariants : pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <DeferredFamily
                  familyId={familyId}
                  searchQuery={searchQuery}
                  onBack={goHome}
                  onSwipeFamily={replaceFamily}
                  onOpenItem={setSelectedItem}
                  entrance={direction === 'forward' ? 'rise' : 'none'}
                />
              </motion.div>
            ) : (
              <motion.div
                key="home"
                custom={travel}
                variants={reduce ? stillPageVariants : pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <main>
                  <HomeView
                    tableNumber={tableNumber}
                    ready={ready}
                    fromSplash={fromSplash}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    onOpenFamily={handleOpenFamily}
                    onOpenItem={setSelectedItem}
                    spotlightPaused={selectedItem !== null}
                  />
                </main>
                <Footer />
              </motion.div>
            )}
          </AnimatePresence>
          {pawStep > 0 && !reduce && (
            <PawSteps key={pawStep} direction={direction} rtl={locale === 'ar'} />
          )}
        </div>
      </LayoutGroup>

      <DeferredSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
      <BackToTop hidden={selectedItem !== null} />
    </div>
  );
}

function PawSteps({ direction, rtl }: { direction: PageDirection; rtl: boolean }) {
  const forward = direction === 'forward' || direction === 'next';
  const toRight = rtl ? !forward : forward;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-30 h-16 overflow-hidden" aria-hidden>
      {[0, 1, 2].map((i) => {
        const from = toRight ? -36 : 36;
        const dist = (toRight ? 1 : -1) * (42 + i * 78);
        return (
          <motion.span
            key={i}
            className="absolute text-sage"
            style={{ top: i % 2 === 0 ? 4 : 26, left: '46%' }}
            initial={{ x: from, opacity: 0, scale: 0.35, rotate: toRight ? -24 : 24 }}
            animate={{
              x: from + dist,
              opacity: [0, 0.75, 0],
              scale: [0.4, 1, 0.82],
              rotate: i % 2 === 0 ? -10 : 14,
            }}
            transition={{ duration: 0.62, delay: 0.02 + i * 0.08, ease: pageEase }}
          >
            <PawPrint size={18} />
          </motion.span>
        );
      })}
    </div>
  );
}

function DeferredFamily(props: FamilyViewComponent) {
  const [View, setView] = useState(() => getFamilyView());

  useEffect(() => {
    if (View) return;
    let active = true;
    loadFamilyView().then((Comp) => {
      if (active) setView(() => Comp);
    });
    return () => {
      active = false;
    };
  }, [View]);

  if (!View) return <div className="min-h-[70vh]" />;
  return <View {...props} />;
}

function DeferredSheet({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const [Sheet, setSheet] = useState(() => getProductSheet());

  useEffect(() => {
    if (Sheet) return;
    let active = true;
    loadProductSheet().then((Comp) => {
      if (active) setSheet(() => Comp);
    });
    return () => {
      active = false;
    };
  }, [Sheet]);

  if (!Sheet) return null;
  return <Sheet item={item} onClose={onClose} />;
}

export default function App() {
  const skipSplash =
    typeof window !== 'undefined' && sessionStorage.getItem('catsgarden_splash') === '1';
  const [phase, setPhase] = useState<'splash' | 'fly' | 'done'>(skipSplash ? 'done' : 'splash');

  return (
    <I18nProvider>
      {phase !== 'done' && (
        <SplashMark fly={phase === 'fly'} onFlyEnd={() => setPhase('done')} />
      )}
      {phase === 'splash' && <SplashVeil onDone={() => setPhase('fly')} />}
      <div
        className="app-content"
        style={phase === 'splash' ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
      >
        <MenuApp ready={phase !== 'splash'} fromSplash={phase !== 'splash' && !skipSplash} showMark={phase === 'done'} />
      </div>
    </I18nProvider>
  );
}
