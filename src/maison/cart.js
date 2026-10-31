import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { config } from '../config';
import { pour } from './motion';
import { useCatalog } from './catalog';
import { pastries } from './pastries';
const KEY = 'mcb-cart';
const CartContext = createContext(null);
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw)
            return [];
        const data = JSON.parse(raw);
        if (!Array.isArray(data))
            return [];
        const lines = [];
        for (const row of data) {
            const pastry = pastries.find((item) => item.id === row.id);
            const qty = Number(row.qty);
            if (!pastry || !Number.isFinite(qty) || qty < 1)
                continue;
            lines.push({ pastry, qty: Math.min(12, Math.round(qty)) });
        }
        return lines;
    }
    catch {
        return [];
    }
}
function persist(lines) {
    localStorage.setItem(KEY, JSON.stringify(lines.map((line) => ({ id: line.pastry.id, qty: line.qty }))));
}
export function orderText(lines, total) {
    const body = lines
        .map((line) => `${line.pastry.name} × ${line.qty} — ${line.qty * line.pastry.price} DH`)
        .join('\n');
    return `Maître Chocolatier Bennis\n\nBonjour,\n\n${body}\n\nTotal : ${total} DH`;
}
export function orderHref(lines, total) {
    return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(orderText(lines, total))}`;
}
export function CartProvider({ children }) {
    const reduce = useReducedMotion();
    const cartRef = useRef(null);
    const { pieces } = useCatalog();
    const [lines, setLines] = useState(load);
    const [drops, setDrops] = useState([]);
    const dropId = useRef(0);
    useEffect(() => {
        setLines((current) => {
            let changed = false;
            const next = current.flatMap((line) => {
                const pastry = pieces.find((item) => item.id === line.pastry.id && item.visible !== false);
                if (!pastry) {
                    changed = true;
                    return [];
                }
                if (pastry !== line.pastry) {
                    changed = true;
                    return [{ ...line, pastry }];
                }
                return [line];
            });
            return changed ? next : current;
        });
    }, [pieces]);
    useEffect(() => {
        persist(lines);
    }, [lines]);
    const api = useMemo(() => {
        const count = lines.reduce((sum, line) => sum + line.qty, 0);
        const total = lines.reduce((sum, line) => sum + line.qty * line.pastry.price, 0);
        return {
            lines,
            count,
            total,
            cartRef,
            add: (pastry, qty, from) => {
                const safe = Math.min(12, Math.max(1, Math.round(qty)));
                setLines((current) => {
                    const existing = current.find((line) => line.pastry.id === pastry.id);
                    if (!existing)
                        return [...current, { pastry, qty: safe }];
                    return current.map((line) => line.pastry.id === pastry.id
                        ? { ...line, qty: Math.min(12, line.qty + safe) }
                        : line);
                });
                const target = cartRef.current?.getBoundingClientRect();
                if (!from || !target || reduce)
                    return;
                dropId.current += 1;
                setDrops((current) => [
                    ...current,
                    {
                        id: dropId.current,
                        x: from.left + from.width / 2,
                        y: from.top + from.height / 2,
                        tx: target.left + target.width / 2,
                        ty: target.top + target.height / 2,
                    },
                ]);
            },
            setQty: (id, qty) => {
                setLines((current) => {
                    if (qty < 1)
                        return current.filter((line) => line.pastry.id !== id);
                    return current.map((line) => line.pastry.id === id ? { ...line, qty: Math.min(12, Math.round(qty)) } : line);
                });
            },
            clear: () => setLines([]),
        };
    }, [lines, reduce]);
    return (_jsxs(CartContext.Provider, { value: api, children: [children, _jsx(AnimatePresence, { children: drops.map((drop) => (_jsx(motion.span, { className: "gold-drop", "aria-hidden": "true", initial: { x: drop.x, y: drop.y, scale: 1, opacity: 1 }, animate: {
                        x: [drop.x, (drop.x + drop.tx) / 2, drop.tx],
                        y: [drop.y, Math.min(drop.y, drop.ty) - 72, drop.ty],
                        scale: [1, 0.8, 0.35],
                        opacity: [1, 1, 0],
                    }, transition: { duration: 0.72, ease: pour, times: [0, 0.46, 1] }, onAnimationComplete: () => setDrops((current) => current.filter((item) => item.id !== drop.id)) }, drop.id))) })] }));
}
export function useCart() {
    const value = useContext(CartContext);
    if (!value)
        throw new Error('useCart must be used inside CartProvider');
    return value;
}
