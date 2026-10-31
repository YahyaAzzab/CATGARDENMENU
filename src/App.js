import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { SplashMark, SplashVeil } from './components/SplashScreen';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { PawPrint } from './components/Icons';
import { useMenuRoute } from './hooks/useMenuRoute';
import { pageEase, pageVariants, stillPageVariants } from './motion';
import { preloadUiSounds } from './lib/uiSound';
import { getFamilyView, getProductSheet, loadFamilyView, loadProductSheet, prefetchMenuScreens, } from './lib/loadScreens';
import './index.css';
function MenuApp({ ready, fromSplash, showMark, }) {
    const { familyId, direction, tableNumber, openFamily, goHome, replaceFamily } = useMenuRoute();
    const { locale } = useI18n();
    const reduce = useReducedMotion();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [pawStep, setPawStep] = useState(0);
    const skipPaws = useRef(true);
    const pageKey = familyId ?? 'home';
    const travel = { direction, rtl: locale === 'ar' };
    useEffect(() => {
        void preloadUiSounds();
    }, []);
    useEffect(() => {
        if (!ready)
            return;
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
        if (reduce)
            return;
        setPawStep((n) => n + 1);
    }, [pageKey, reduce]);
    const handleOpenFamily = (id) => {
        setSearchQuery('');
        openFamily(id);
    };
    return (_jsxs("div", { className: "relative min-h-screen overflow-x-hidden bg-cream", children: [_jsx("div", { className: "paw-watermark", children: _jsx(PawPrint, { size: 120, className: "text-chocolate" }) }), _jsx(Header, { onLogoClick: goHome, showMark: showMark }), _jsx(LayoutGroup, { children: _jsxs("div", { className: "page-stage relative", children: [_jsx(AnimatePresence, { mode: "popLayout", initial: false, custom: travel, children: familyId ? (_jsx(motion.div, { custom: travel, variants: reduce ? stillPageVariants : pageVariants, initial: "enter", animate: "center", exit: "exit", className: "w-full", children: _jsx(DeferredFamily, { familyId: familyId, searchQuery: searchQuery, onBack: goHome, onSwipeFamily: replaceFamily, onOpenItem: setSelectedItem, entrance: direction === 'forward' ? 'rise' : 'none' }) }, familyId)) : (_jsxs(motion.div, { custom: travel, variants: reduce ? stillPageVariants : pageVariants, initial: "enter", animate: "center", exit: "exit", className: "w-full", children: [_jsx("main", { children: _jsx(HomeView, { tableNumber: tableNumber, ready: ready, fromSplash: fromSplash, searchQuery: searchQuery, onSearch: setSearchQuery, onOpenFamily: handleOpenFamily, onOpenItem: setSelectedItem, spotlightPaused: selectedItem !== null }) }), _jsx(Footer, {})] }, "home")) }), pawStep > 0 && !reduce && (_jsx(PawSteps, { direction: direction, rtl: locale === 'ar' }, pawStep))] }) }), _jsx(DeferredSheet, { item: selectedItem, onClose: () => setSelectedItem(null) }), _jsx(BackToTop, { hidden: selectedItem !== null })] }));
}
function PawSteps({ direction, rtl }) {
    const forward = direction === 'forward' || direction === 'next';
    const toRight = rtl ? !forward : forward;
    return (_jsx("div", { className: "pointer-events-none absolute inset-x-0 top-3 z-30 h-16 overflow-hidden", "aria-hidden": true, children: [0, 1, 2].map((i) => {
            const from = toRight ? -36 : 36;
            const dist = (toRight ? 1 : -1) * (42 + i * 78);
            return (_jsx(motion.span, { className: "absolute text-sage", style: { top: i % 2 === 0 ? 4 : 26, left: '46%' }, initial: { x: from, opacity: 0, scale: 0.35, rotate: toRight ? -24 : 24 }, animate: {
                    x: from + dist,
                    opacity: [0, 0.75, 0],
                    scale: [0.4, 1, 0.82],
                    rotate: i % 2 === 0 ? -10 : 14,
                }, transition: { duration: 0.62, delay: 0.02 + i * 0.08, ease: pageEase }, children: _jsx(PawPrint, { size: 18 }) }, i));
        }) }));
}
function DeferredFamily(props) {
    const [View, setView] = useState(() => getFamilyView());
    useEffect(() => {
        if (View)
            return;
        let active = true;
        loadFamilyView().then((Comp) => {
            if (active)
                setView(() => Comp);
        });
        return () => {
            active = false;
        };
    }, [View]);
    if (!View)
        return _jsx("div", { className: "min-h-[70vh]" });
    return _jsx(View, { ...props });
}
function DeferredSheet({ item, onClose, }) {
    const [Sheet, setSheet] = useState(() => getProductSheet());
    useEffect(() => {
        if (Sheet)
            return;
        let active = true;
        loadProductSheet().then((Comp) => {
            if (active)
                setSheet(() => Comp);
        });
        return () => {
            active = false;
        };
    }, [Sheet]);
    if (!Sheet)
        return null;
    return _jsx(Sheet, { item: item, onClose: onClose });
}
export default function App() {
    const skipSplash = typeof window !== 'undefined' && sessionStorage.getItem('catsgarden_splash') === '1';
    const [phase, setPhase] = useState(skipSplash ? 'done' : 'splash');
    return (_jsxs(I18nProvider, { children: [phase !== 'done' && (_jsx(SplashMark, { fly: phase === 'fly', onFlyEnd: () => setPhase('done') })), phase === 'splash' && _jsx(SplashVeil, { onDone: () => setPhase('fly') }), _jsx("div", { className: "app-content", style: phase === 'splash' ? { visibility: 'hidden', pointerEvents: 'none' } : undefined, children: _jsx(MenuApp, { ready: phase !== 'splash', fromSplash: phase !== 'splash' && !skipSplash, showMark: phase === 'done' }) })] }));
}
