import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from 'framer-motion';
import { cardSpring } from '../motion';
/** Small splash-language cat watching the family cards. */
export function PeekingCat({ delay = 0.4, show = true }) {
    const reduce = useReducedMotion();
    return (_jsx(motion.div, { className: "pointer-events-none absolute right-2 top-1.5 z-10", initial: reduce ? false : { opacity: 0, y: 10 }, animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }, transition: reduce ? { duration: 0 } : { ...cardSpring, delay }, "aria-hidden": "true", children: _jsxs("svg", { width: "58", height: "46", viewBox: "16 0 88 72", fill: "none", children: [_jsx("ellipse", { cx: "60", cy: "46", rx: "30", ry: "22", fill: "#FDF6EC" }), _jsx("path", { d: "M28,42 L38,8 L52,38", fill: "#3E2723" }), _jsx("path", { d: "M32,40 L38,14 L48,36", fill: "#E8A87C" }), _jsx("path", { d: "M68,42 L82,8 L92,38", fill: "#3E2723" }), _jsx("path", { d: "M72,40 L82,14 L88,36", fill: "#E8A87C" }), _jsx("ellipse", { cx: "48", cy: "46", rx: "9", ry: "10", fill: "#8BA888" }), _jsx("ellipse", { cx: "48", cy: "46", rx: "2.6", ry: "7.5", fill: "#3E2723" }), _jsx("circle", { cx: "45.5", cy: "42", r: "2", fill: "white", opacity: "0.9" }), _jsx("ellipse", { cx: "72", cy: "46", rx: "9", ry: "10", fill: "#8BA888" }), _jsx("ellipse", { cx: "72", cy: "46", rx: "2.6", ry: "7.5", fill: "#3E2723" }), _jsx("circle", { cx: "69.5", cy: "42", r: "2", fill: "white", opacity: "0.9" }), _jsx("path", { d: "M57,52 L60,56.5 L63,52 Z", fill: "#E8A87C" })] }) }));
}
export function PeekingTail({ delay = 0.55, show = true }) {
    const reduce = useReducedMotion();
    return (_jsx(motion.div, { className: "pointer-events-none absolute right-1.5 top-1 z-10", initial: reduce ? false : { opacity: 0, x: -8 }, animate: show ? { opacity: 0.9, x: 0 } : { opacity: 0, x: -8 }, transition: reduce ? { duration: 0 } : { ...cardSpring, delay }, "aria-hidden": "true", children: _jsx("svg", { width: "54", height: "28", viewBox: "40 0 80 28", children: _jsx("path", { d: "M40,18 C58,18 66,4 84,8 C100,12 108,24 120,16", fill: "none", stroke: "#6B8E6B", strokeWidth: "5", strokeLinecap: "round" }) }) }));
}
