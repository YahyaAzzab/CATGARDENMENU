import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─── Cat Paw Print SVG ──────────────────────────────────────────
export function PawPrint({ className = '', size = 24 }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 64 64", fill: "currentColor", className: className, "aria-hidden": "true", children: [_jsx("ellipse", { cx: "32", cy: "42", rx: "14", ry: "12" }), _jsx("ellipse", { cx: "18", cy: "24", rx: "7", ry: "8", transform: "rotate(-15 18 24)" }), _jsx("ellipse", { cx: "32", cy: "20", rx: "7", ry: "8" }), _jsx("ellipse", { cx: "46", cy: "24", rx: "7", ry: "8", transform: "rotate(15 46 24)" })] }));
}
// ─── Cat Silhouette (sleeping) ──────────────────────────────────
export function SleepingCat({ className = '', size = 80 }) {
    return (_jsxs("svg", { width: size, height: size * 0.5, viewBox: "0 0 120 60", fill: "currentColor", className: className, "aria-hidden": "true", children: [_jsx("path", { d: "M10,55 Q5,55 5,50 Q5,42 12,38 Q8,28 15,20 L20,12 Q22,8 24,12 L28,20 Q35,16 50,16 Q65,16 72,20 L76,12 Q78,8 80,12 L85,20 Q92,28 88,38 Q95,42 95,50 Q95,55 90,55 Z" }), _jsx("path", { d: "M90,50 Q100,48 105,40 Q110,32 108,28 Q106,24 102,28 Q98,32 96,38", fill: "none", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round" })] }));
}
// ─── Whiskers decorative element ────────────────────────────────
export function Whiskers({ className = '', size = 40 }) {
    return (_jsxs("svg", { width: size, height: size * 0.6, viewBox: "0 0 60 36", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: className, "aria-hidden": "true", children: [_jsx("line", { x1: "28", y1: "16", x2: "4", y2: "8" }), _jsx("line", { x1: "28", y1: "18", x2: "2", y2: "18" }), _jsx("line", { x1: "28", y1: "20", x2: "4", y2: "28" }), _jsx("line", { x1: "32", y1: "16", x2: "56", y2: "8" }), _jsx("line", { x1: "32", y1: "18", x2: "58", y2: "18" }), _jsx("line", { x1: "32", y1: "20", x2: "56", y2: "28" }), _jsx("path", { d: "M28,14 Q30,12 32,14 Q30,16 28,14", fill: "currentColor" })] }));
}
// ─── Leaf / foliage accent ──────────────────────────────────────
export function LeafAccent({ className = '', size = 20 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", className: className, "aria-hidden": "true", children: _jsx("path", { d: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" }) }));
}
// ─── Decorative section divider with cat elements ───────────────
export function CatDivider({ className = '' }) {
    return (_jsxs("div", { className: `flex items-center gap-3 my-4 ${className}`, children: [_jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-transparent via-sage-muted to-transparent" }), _jsx(PawPrint, { size: 14, className: "text-sage-muted" }), _jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-transparent via-sage-muted to-transparent" })] }));
}
// ─── Generic icon wrapper for category icons ────────────────────
const categoryIconPaths = {
    sunrise: _jsx("path", { d: "M12,7A5,5 0 0,1 17,12H15A3,3 0 0,0 12,9A3,3 0 0,0 9,12H7A5,5 0 0,1 12,7M3.55,18.54L4.96,17.13C3.23,15.76 2.09,13.53 2.09,11A9,9 0 0,1 6.37,3.69L5,2.27C2.03,4.69 0.09,7.64 0.09,11C0.09,14.08 1.38,16.88 3.55,18.54M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M19.04,17.13L20.45,18.54C22.62,16.88 23.91,14.08 23.91,11C23.91,7.64 21.97,4.69 19,2.27L17.63,3.69A9,9 0 0,1 21.91,11C21.91,13.53 20.77,15.76 19.04,17.13M12,22L15,19H9L12,22Z" }),
    utensils: _jsx("path", { d: "M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" }),
    coffee: _jsx("path", { d: "M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z" }),
    chocolate: _jsx("path", { d: "M16,6V4A2,2 0 0,0 14,2H10A2,2 0 0,0 8,4V6A6,6 0 0,0 2,12V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V12A6,6 0 0,0 16,6M10,4H14V6H10M20,20H4V12A4,4 0 0,1 8,8H16A4,4 0 0,1 20,12Z" }),
    tea: _jsx("path", { d: "M4,19H20V21H4V19M20,3H4V5L6,15H18L20,5V3M12,10A2,2 0 0,1 10,8A2,2 0 0,1 12,6A2,2 0 0,1 14,8A2,2 0 0,1 12,10Z" }),
    leaf: _jsx("path", { d: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" }),
    icecream: _jsx("path", { d: "M12,4C9.11,4 6.56,5.64 5.35,8.14C2.27,8.61 0,11.29 0,14.5A5.5,5.5 0 0,0 5.5,20H8L12,24L16,20H18.5A5.5,5.5 0 0,0 24,14.5C24,11.29 21.73,8.61 18.65,8.14C17.44,5.64 14.89,4 12,4Z" }),
    juice: _jsx("path", { d: "M6,2V8H4V2H6M18,2V8H16V2H18M7,8L5.5,18C5.22,19.68 6.56,21 8.25,21H15.75C17.44,21 18.78,19.68 18.5,18L17,8H7M12,12A3,3 0 0,1 15,15A3,3 0 0,1 12,18A3,3 0 0,1 9,15A3,3 0 0,1 12,12Z" }),
    pancake: _jsx("path", { d: "M12,2A8,8 0 0,0 4,10C4,14.4 7.6,18 12,18A8,8 0 0,0 20,10C20,5.6 16.4,2 12,2M12,4A6,6 0 0,1 18,10H6A6,6 0 0,1 12,4M3,20V22H21V20H3Z" }),
    crepe: _jsx("path", { d: "M12,3L2,12H5V20H19V12H22L12,3M12,7.7L16,11.2V18H8V11.2L12,7.7Z" }),
    waffle: _jsx("path", { d: "M3,3V21H21V3H3M9,19H5V15H9V19M9,13H5V9H9V13M9,7H5V5H9V7M15,19H11V15H15V19M15,13H11V9H15V13M15,7H11V5H15V7M19,19H17V15H19V19M19,13H17V9H19V13M19,7H17V5H19V7Z" }),
    milkshake: _jsx("path", { d: "M6,2V8L4,18C3.72,19.68 5.06,21 6.75,21H17.25C18.94,21 20.28,19.68 20,18L18,8V2H6M8,4H16V8H8V4M12,12A3,3 0 0,1 15,15A3,3 0 0,1 12,18A3,3 0 0,1 9,15A3,3 0 0,1 12,12Z" }),
    cocktail: _jsx("path", { d: "M7.5,7L5.5,5L6.5,4L8.5,6L20.5,6L12,14.5V20H16V22H8V20H12V14.5L3.5,6L4.5,5L7.5,7M12,8.5L15.5,8H8.5L12,8.5M10,10L12,12L14,10H10Z" }),
    bottle: _jsx("path", { d: "M15,2H9V5H11V7A8,8 0 0,0 4,14V22H20V14A8,8 0 0,0 13,7V5H15V2M12,9A6,6 0 0,1 18,14V20H6V14A6,6 0 0,1 12,9Z" }),
    share: _jsx("path", { d: "M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" }),
    pizza: _jsx("path", { d: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M9,7A2,2 0 0,0 7,9A2,2 0 0,0 9,11A2,2 0 0,0 11,9A2,2 0 0,0 9,7M15,11A2,2 0 0,0 13,13A2,2 0 0,0 15,15A2,2 0 0,0 17,13A2,2 0 0,0 15,11M10,14A1.5,1.5 0 0,0 8.5,15.5A1.5,1.5 0 0,0 10,17A1.5,1.5 0 0,0 11.5,15.5A1.5,1.5 0 0,0 10,14Z" }),
    burger: _jsx("path", { d: "M22,17H2A1,1 0 0,0 1,18A1,1 0 0,0 2,19H22A1,1 0 0,0 23,18A1,1 0 0,0 22,17M2,15H22C22,15 22,12 22,11C22,8 19,5 12,5C5,5 2,8 2,11C2,12 2,15 2,15M8.5,8A1.5,1.5 0 0,1 10,9.5A1.5,1.5 0 0,1 8.5,11A1.5,1.5 0 0,1 7,9.5A1.5,1.5 0 0,1 8.5,8M15,9A1,1 0 0,1 16,10A1,1 0 0,1 15,11A1,1 0 0,1 14,10A1,1 0 0,1 15,9M2,21H22V20H2V21Z" }),
    crepeSavory: _jsx("path", { d: "M12,3L2,12H5V20H19V12H22L12,3Z" }),
    cake: _jsx("path", { d: "M12,6C13.11,6 14,5.1 14,4C14,3.62 13.83,3.26 13.65,2.97C13.45,2.64 13.19,2.27 12.92,1.87C12.64,1.48 12.42,1.15 12.27,0.88C12.13,0.64 12,0.5 12,0.5C12,0.5 11.87,0.64 11.73,0.88C11.58,1.15 11.36,1.48 11.08,1.87C10.81,2.27 10.55,2.64 10.35,2.97C10.17,3.26 10,3.62 10,4A2,2 0 0,0 12,6M16.5,14C17.33,14 18,13.33 18,12.5C18,11.67 17.33,11 16.5,11C15.67,11 15,11.67 15,12.5C15,13.33 15.67,14 16.5,14M9,22V20H7A2,2 0 0,1 5,18V14.56C3.81,13.76 3,12.47 3,11C3,8.79 4.79,7 7,7H17C19.21,7 21,8.79 21,11C21,12.47 20.19,13.76 19,14.56V18A2,2 0 0,1 17,20H15V22H9Z" }),
};
export function CategoryIcon({ icon, size = 20, className = '' }) {
    const pathContent = categoryIconPaths[icon];
    if (!pathContent)
        return null;
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", className: className, "aria-hidden": "true", children: pathContent }));
}
