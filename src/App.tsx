import { useEffect, useState, type ComponentProps } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { I18nProvider } from './i18n/I18nContext';
import type { MenuItem } from './data/types';
import type { FamilyId } from './data/families';

import { SplashMark, SplashVeil } from './components/SplashScreen';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { PawPrint } from './components/Icons';
import { useMenuRoute } from './hooks/useMenuRoute';
import { irisEase } from './motion';
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
  const { familyId, tableNumber, openFamily, goHome, replaceFamily } = useMenuRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
        <AnimatePresence mode="sync" initial={false}>
          {familyId ? (
            <motion.div
              key={familyId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: irisEase }}
            >
              <DeferredFamily
                familyId={familyId}
                searchQuery={searchQuery}
                onBack={goHome}
                onSwipeFamily={replaceFamily}
                onOpenItem={setSelectedItem}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: irisEase }}
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
      </LayoutGroup>

      <DeferredSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
      <BackToTop hidden={selectedItem !== null} />
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
