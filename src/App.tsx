import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { I18nProvider } from './i18n/I18nContext';
import type { MenuItem } from './data/types';
import type { FamilyId } from './data/families';

import { SplashMark, SplashVeil } from './components/SplashScreen';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { FamilyView } from './components/FamilyView';
import { ProductBottomSheet } from './components/ProductBottomSheet';
import { Footer } from './components/Footer';
import { PawPrint } from './components/Icons';
import { useMenuRoute } from './hooks/useMenuRoute';
import { irisEase } from './motion';

import './index.css';

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
              <FamilyView
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

      <ProductBottomSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
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
