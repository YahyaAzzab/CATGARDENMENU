import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
/** Cat-in-a-garden mark. `play` draws it once for the intro; the header uses the settled mark. */
export function BrandLogo({ play = false, className = '' }) {
    const reduce = useReducedMotion();
    const live = play && !reduce;
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        if (!live)
            return;
        const timers = [
            window.setTimeout(() => setBlink(true), 1050),
            window.setTimeout(() => setBlink(false), 1200),
            window.setTimeout(() => setBlink(true), 1480),
            window.setTimeout(() => setBlink(false), 1620),
        ];
        return () => timers.forEach(clearTimeout);
    }, [live]);
    const pop = (delay) => live
        ? {
            initial: { opacity: 0, scale: 0.4 },
            animate: { opacity: 1, scale: 1 },
            transition: { type: 'spring', stiffness: 280, damping: 16, delay },
        }
        : { initial: false, animate: { opacity: 1, scale: 1 } };
    return (_jsxs("svg", { viewBox: "0 0 64 64", className: className, "aria-hidden": "true", children: [_jsx(motion.circle, { cx: "32", cy: "33", r: "28", fill: "#E7F0E2", stroke: "#6B8E6B", strokeWidth: "1.8", ...(live
                    ? {
                        initial: { scale: 0.7, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        transition: { type: 'spring', stiffness: 220, damping: 18 },
                    }
                    : { initial: false }), style: { transformOrigin: '32px 33px' } }), _jsxs(motion.g, { ...pop(0.28), style: { transformOrigin: '22px 22px' }, children: [_jsx("path", { d: "M16 34 L21 12 L33 30 Z", fill: "#3E2723" }), _jsx("path", { d: "M19 31 L22 17 L30 29 Z", fill: "#E8A87C" })] }), _jsxs(motion.g, { ...pop(0.36), style: { transformOrigin: '42px 22px' }, children: [_jsx("path", { d: "M48 34 L43 12 L31 30 Z", fill: "#3E2723" }), _jsx("path", { d: "M45 31 L42 17 L34 29 Z", fill: "#E8A87C" })] }), _jsx(motion.g, { ...pop(0.16), style: { transformOrigin: '32px 38px' }, children: _jsx("circle", { cx: "32", cy: "38", r: "15", fill: "#FDF6EC", stroke: "#3E2723", strokeWidth: "1.5" }) }), _jsxs(motion.g, { ...pop(0.55), style: { transformOrigin: '32px 37px' }, children: [_jsx("ellipse", { cx: "26.2", cy: "36.5", rx: "3.1", ry: "3.5", fill: "#6B8E6B" }), _jsx("ellipse", { cx: "26.2", cy: "37", rx: "1.35", ry: "2.15", fill: "#3E2723" }), _jsx("circle", { cx: "25.2", cy: "35.2", r: "0.85", fill: "white" }), _jsx("ellipse", { cx: "37.8", cy: "36.5", rx: "3.1", ry: "3.5", fill: "#6B8E6B" }), _jsx("ellipse", { cx: "37.8", cy: "37", rx: "1.35", ry: "2.15", fill: "#3E2723" }), _jsx("circle", { cx: "36.8", cy: "35.2", r: "0.85", fill: "white" }), _jsx("path", { d: "M30.3 41.2 L32 43.4 L33.7 41.2 Z", fill: "#E8A87C" }), _jsx("path", { d: "M32 43.4 Q32 45.2 29.6 44.6", fill: "none", stroke: "#3E2723", strokeWidth: "0.8", strokeLinecap: "round" }), _jsx("path", { d: "M32 43.4 Q32 45.2 34.4 44.6", fill: "none", stroke: "#3E2723", strokeWidth: "0.8", strokeLinecap: "round" }), _jsx(motion.ellipse, { cx: "26.2", cy: "36.5", rx: "3.5", ry: "4", fill: "#FDF6EC", animate: { scaleY: blink ? 1 : 0 }, transition: { duration: 0.1 }, style: { transformBox: 'fill-box', transformOrigin: 'center' } }), _jsx(motion.ellipse, { cx: "37.8", cy: "36.5", rx: "3.5", ry: "4", fill: "#FDF6EC", animate: { scaleY: blink ? 1 : 0 }, transition: { duration: 0.1 }, style: { transformBox: 'fill-box', transformOrigin: 'center' } })] }), _jsx(motion.g, { stroke: "#3E2723", strokeWidth: "1.15", strokeLinecap: "round", initial: live ? { opacity: 0 } : false, animate: { opacity: 1 }, transition: { delay: live ? 0.82 : 0, duration: 0.2 }, children: [
                    [20, 39, 8, 35],
                    [20, 41.5, 7, 41.5],
                    [20, 44, 8, 48],
                    [44, 39, 56, 35],
                    [44, 41.5, 57, 41.5],
                    [44, 44, 56, 48],
                ].map(([x1, y1, x2, y2], i) => (_jsx(motion.line, { x1: x1, y1: y1, x2: x2, y2: y2, initial: live ? { pathLength: 0 } : false, animate: { pathLength: 1 }, transition: { duration: live ? 0.4 : 0, delay: live ? 0.82 + i * 0.04 : 0 } }, i))) }), _jsxs(motion.g, { ...pop(1.05), style: { transformOrigin: '50px 16px' }, children: [_jsx("path", { d: "M46 18 C54 12 60 18 56 26 C51 21 47 20 46 18 Z", fill: "#6B8E6B" }), _jsx("path", { d: "M48 18 C52 18 54 21 55 24", fill: "none", stroke: "#FDF6EC", strokeWidth: "0.8", strokeLinecap: "round" })] })] }));
}
