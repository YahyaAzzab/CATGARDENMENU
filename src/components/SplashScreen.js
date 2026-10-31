import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { BrandLogo } from './BrandLogo';
export function SplashVeil({ onDone }) {
    const { t } = useI18n();
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(reduce === true);
    const title = "Cat's Garden";
    useEffect(() => {
        const finish = () => {
            sessionStorage.setItem('catsgarden_splash', '1');
            onDone();
        };
        if (reduce) {
            const timer = window.setTimeout(finish, 400);
            return () => clearTimeout(timer);
        }
        const show = window.setTimeout(() => setShown(true), 120);
        const end = window.setTimeout(finish, 1300);
        return () => {
            clearTimeout(show);
            clearTimeout(end);
        };
    }, [onDone, reduce]);
    return (_jsxs(motion.div, { className: "fixed inset-0 z-[80] flex cursor-pointer select-none flex-col items-center justify-start bg-cream", style: { touchAction: 'manipulation' }, onClick: () => {
            sessionStorage.setItem('catsgarden_splash', '1');
            onDone();
        }, exit: { opacity: 0 }, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] }, children: [_jsx("div", { style: { height: 'calc(28vh + 148px)' } }), _jsx("h1", { className: "mb-3 text-[2.5rem] italic leading-none tracking-tight", style: { fontFamily: 'var(--font-display)' }, "aria-label": title, children: title.split('').map((char, i) => (_jsx(motion.span, { className: i < 5 ? 'text-chocolate' : 'text-sage-dark', initial: reduce ? false : { opacity: 0, y: 16 }, animate: shown || reduce ? { opacity: 1, y: 0 } : {}, transition: { type: 'spring', stiffness: 260, damping: 18, delay: reduce ? 0 : i * 0.04 }, style: { display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }, children: char }, `${char}-${i}`))) }), _jsx(motion.p, { className: "text-[0.95rem] tracking-wide text-sage-dark", style: { fontFamily: 'var(--font-body)' }, initial: reduce ? false : { opacity: 0, y: 8 }, animate: shown || reduce ? { opacity: 1, y: 0 } : {}, transition: { delay: reduce ? 0 : 0.7, duration: 0.45 }, children: t.splashTagline }), _jsx(motion.p, { className: "absolute text-xs text-chocolate-muted", style: { fontFamily: 'var(--font-body)', bottom: 'max(env(safe-area-inset-bottom), 24px)' }, initial: { opacity: 0 }, animate: { opacity: 0.4 }, transition: { delay: 1.2 }, children: t.tapToSkip })] }));
}
export function SplashMark({ fly, onFlyEnd }) {
    const ref = useRef(null);
    const endRef = useRef(onFlyEnd);
    endRef.current = onFlyEnd;
    useEffect(() => {
        if (!fly || !ref.current)
            return;
        const slot = document.querySelector('[data-brand-slot]');
        if (!slot) {
            endRef.current();
            return;
        }
        const from = ref.current.getBoundingClientRect();
        const to = slot.getBoundingClientRect();
        if (from.width === 0 || to.width === 0) {
            endRef.current();
            return;
        }
        const dx = to.left - from.left;
        const dy = to.top - from.top;
        const scale = to.width / from.width;
        const started = performance.now();
        let frame = 0;
        let dropped = false;
        const tick = (now) => {
            if (dropped || !ref.current)
                return;
            const t = Math.min(1, (now - started) / 780);
            const eased = 1 - Math.pow(1 - t, 3);
            ref.current.style.transform = `translate(${dx * eased}px, ${dy * eased}px) scale(${1 + (scale - 1) * eased})`;
            if (t < 1)
                frame = window.setTimeout(() => tick(performance.now()), 16);
            else
                endRef.current();
        };
        frame = window.setTimeout(() => tick(performance.now()), 16);
        return () => {
            dropped = true;
            window.clearTimeout(frame);
        };
    }, [fly]);
    return (_jsx("div", { className: "pointer-events-none fixed inset-x-0 z-[120] flex justify-center", style: { top: '28vh' }, children: _jsx("div", { ref: ref, className: "h-[132px] w-[132px]", style: { transformOrigin: 'top left' }, children: _jsx(BrandLogo, { play: true, className: "h-full w-full" }) }) }));
}
