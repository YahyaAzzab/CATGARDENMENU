import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { config } from '../config';
import { PawPrint } from '../components/Icons';
import { CartProvider, orderHref, useCart } from './cart';
import { CatalogProvider, useCatalog } from './catalog';
import { defaultCategoryArt } from './categories';
import { getMoment, popularFor } from './moment';
import { rememberOrder } from './orders';
import { settle } from './motion';
import { formatDh } from './pastries';
import { playUiSoundThenGo, preloadUiSounds } from '../lib/uiSound';
import './maison.css';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Monsieur+La+Doulaise&family=Outfit:wght@300;400;500&display=swap';
function Drip({ className }) {
    return (_jsx("svg", { className: className, viewBox: "0 0 40 56", "aria-hidden": "true", children: _jsx("path", { fill: "currentColor", d: "M20 1.5C28 14 34 26 34 36.5 34 46.5 27.8 54 20 54S6 46.5 6 36.5C6 26 12 14 20 1.5z" }) }));
}
function Arrow({ className }) {
    return (_jsx("svg", { className: className, viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M5 12h14M13 6l6 6-6 6", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
function Opening({ reduce, onLift, onDone, }) {
    const [ready, setReady] = useState(false);
    const [lift, setLift] = useState(false);
    const finished = useRef(false);
    const onLiftRef = useRef(onLift);
    const onDoneRef = useRef(onDone);
    onLiftRef.current = onLift;
    onDoneRef.current = onDone;
    const pace = reduce ? 0.78 : 1;
    const at = (seconds) => seconds * pace;
    const finish = () => {
        if (finished.current)
            return;
        finished.current = true;
        onDoneRef.current();
    };
    useEffect(() => {
        const timers = [
            window.setTimeout(() => setReady(true), at(1.55) * 1000),
            window.setTimeout(() => setLift(true), at(2.55) * 1000),
        ];
        return () => timers.forEach((id) => window.clearTimeout(id));
    }, [reduce]);
    useEffect(() => {
        if (!lift)
            return;
        onLiftRef.current();
        const id = window.setTimeout(finish, at(0.9) * 1000);
        return () => window.clearTimeout(id);
    }, [lift, reduce]);
    return (_jsx(MotionConfig, { reducedMotion: "never", children: _jsxs(motion.div, { className: "opening", role: "dialog", "aria-label": "Ma\u00EEtre Chocolatier Bennis", initial: { y: 0 }, animate: lift ? { y: '-100%' } : { y: 0 }, transition: lift ? { duration: at(0.95), ease: settle } : { duration: 0 }, onAnimationComplete: () => {
                if (lift)
                    finish();
            }, children: [_jsx(motion.div, { className: "opening-mark", initial: { opacity: 1, y: 0 }, animate: lift ? { opacity: 0, y: -28 } : { opacity: 1, y: 0 }, transition: { duration: at(0.7), ease: settle }, children: _jsx(motion.img, { src: "/maison/wordmark.png", alt: "Ma\u00EEtre Chocolatier Bennis", initial: { opacity: 0, y: 16, filter: 'blur(10px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, transition: { duration: at(1.15), ease: settle, delay: at(0.2) } }) }), _jsx(motion.button, { type: "button", className: "opening-enter", initial: { opacity: 0, y: 8 }, animate: ready && !lift ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }, transition: { duration: at(0.45), ease: settle }, "aria-hidden": !ready || lift, style: { pointerEvents: ready && !lift ? 'auto' : 'none' }, onClick: () => setLift(true), children: "Entrer" })] }) }));
}
function useWide() {
    const [wide, setWide] = useState(() => window.matchMedia('(min-width: 840px)').matches);
    useEffect(() => {
        const media = window.matchMedia('(min-width: 840px)');
        const onChange = () => setWide(media.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);
    return wide;
}
export default function MaisonApp() {
    return (_jsxs(CatalogProvider, { children: [_jsx("link", { rel: "stylesheet", href: FONT_HREF }), _jsx(CartProvider, { children: _jsx(House, {}) })] }));
}
function House() {
    const reduce = useReducedMotion();
    const wide = useWide();
    const { pieces, categories, theme } = useCatalog();
    const { count, cartRef } = useCart();
    const [intro, setIntro] = useState(true);
    const [live, setLive] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [pieceId, setPieceId] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [openCat, setOpenCat] = useState(null);
    const [now, setNow] = useState(() => new Date());
    const categoryIds = useRef([]);
    const opener = useRef(null);
    const pieceWasOpen = useRef(false);
    const piece = pieces.find((item) => item.id === pieceId) ?? null;
    const moment = getMoment(now);
    const collections = useMemo(() => {
        const known = new Set(categories.map((item) => item.id));
        const extras = [];
        for (const piece of pieces) {
            if (known.has(piece.category) || extras.some((item) => item.id === piece.category))
                continue;
            extras.push({
                id: piece.category,
                name: piece.category,
                blurb: '',
                art: defaultCategoryArt,
                photo: piece.image,
                sort: 1000 + extras.length,
            });
        }
        return [...categories, ...extras]
            .sort((a, b) => a.sort - b.sort)
            .map((category) => ({
            category,
            items: pieces
                .filter((item) => item.category === category.id)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
        }));
    }, [pieces, categories]);
    categoryIds.current = collections.map((group) => group.category.id);
    const popular = useMemo(() => popularFor(pieces, moment, 10), [pieces, moment]);
    const current = openCat ? collections.find((group) => group.category.id === openCat) ?? null : null;
    useEffect(() => {
        document.title = 'Maître Chocolatier Bennis · Fès';
        void preloadUiSounds();
        const theme = document.querySelector('meta[name="theme-color"]');
        const previous = theme?.getAttribute('content');
        theme?.setAttribute('content', '#F6EFE4');
        return () => {
            if (previous)
                theme?.setAttribute('content', previous);
        };
    }, []);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
        document.body.style.overflow = intro || piece || cartOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [intro, piece, cartOpen]);
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(id);
    }, []);
    useEffect(() => {
        const onPop = () => {
            const state = history.state;
            if (state?.mcb === 'piece' && state.id) {
                setPieceId(state.id);
                setCartOpen(false);
                return;
            }
            if (state?.mcb === 'cart') {
                setCartOpen(true);
                setPieceId(null);
                return;
            }
            if (state?.mcb === 'cat' && state.id) {
                setOpenCat(state.id && categoryIds.current.includes(state.id) ? state.id : null);
                setPieceId(null);
                setCartOpen(false);
                return;
            }
            setOpenCat(null);
            setPieceId(null);
            setCartOpen(false);
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    const closeTop = () => {
        const state = history.state;
        if (state?.mcb) {
            history.back();
            return;
        }
        setOpenCat(null);
        setPieceId(null);
        setCartOpen(false);
    };
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape')
                closeTop();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });
    useEffect(() => {
        if (pieceId) {
            pieceWasOpen.current = true;
            return;
        }
        if (pieceWasOpen.current) {
            pieceWasOpen.current = false;
            opener.current?.focus();
        }
    }, [pieceId]);
    const openPiece = (id, source) => {
        opener.current = source;
        setCartOpen(false);
        setPieceId(id);
        history.pushState({ mcb: 'piece', id }, '');
    };
    const openCart = () => {
        setPieceId(null);
        setCartOpen(true);
        history.pushState({ mcb: 'cart' }, '');
    };
    const openCollection = (id) => {
        setOpenCat(id);
        setPieceId(null);
        setCartOpen(false);
        history.pushState({ mcb: 'cat', id }, '');
        window.scrollTo({ top: 0, behavior: 'auto' });
    };
    const switchCollection = (id) => {
        setOpenCat(id);
        history.replaceState({ mcb: 'cat', id }, '');
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    const goTop = () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    return (_jsxs("div", { className: "maison", "data-theme": theme, children: [_jsxs("header", { className: scrolled ? 'maison-header is-scrolled' : 'maison-header', children: [_jsx("button", { type: "button", className: "brand-link", onClick: goTop, "aria-label": "Ma\u00EEtre Chocolatier Bennis", children: _jsx("img", { src: "/maison/wordmark-night.png", alt: "" }) }), _jsxs("button", { type: "button", className: "cart-button", ref: cartRef, onClick: openCart, "aria-label": count > 0 ? `Panier, ${count} pièces` : 'Panier', children: ["Panier", _jsx(AnimatePresence, { children: count > 0 && (_jsx(motion.span, { className: "cart-count", initial: reduce ? false : { scale: 0.6, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.6, opacity: 0 }, transition: { type: 'spring', stiffness: 420, damping: 18 }, children: count }, count)) })] })] }), _jsx("main", { children: _jsx(AnimatePresence, { mode: "wait", initial: false, children: current ? (_jsx(motion.div, { initial: reduce ? undefined : { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: reduce ? undefined : { opacity: 0, y: -12 }, transition: { duration: reduce ? 0 : 0.45, ease: settle }, children: _jsx(CollectionView, { category: current.category, items: current.items, groups: collections, live: live, reduce: !!reduce, onBack: closeTop, onSwitch: switchCollection, onOpen: openPiece }) }, current.category.id)) : (_jsxs(motion.div, { initial: reduce ? undefined : { opacity: 0 }, animate: { opacity: 1 }, exit: reduce ? undefined : { opacity: 0 }, transition: { duration: reduce ? 0 : 0.4, ease: settle }, children: [_jsx(Collections, { groups: collections, live: live, reduce: !!reduce, onOpen: openCollection }), _jsx(PopularRail, { items: popular, live: live, reduce: !!reduce, onOpen: openPiece })] }, "home")) }) }), _jsxs("footer", { className: "maison-footer", children: [_jsx("a", { className: "secret-mark", href: "/admin", children: _jsx("img", { src: "/maison/wordmark.png", alt: "Ma\u00EEtre Chocolatier Bennis" }) }), _jsxs("div", { className: "footer-actions", children: [_jsxs("a", { href: config.managerInstagramUrl, target: "_blank", rel: "noopener noreferrer", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: [_jsx("rect", { x: "2", y: "2", width: "20", height: "20", rx: "5" }), _jsx("circle", { cx: "12", cy: "12", r: "5" }), _jsx("circle", { cx: "17.5", cy: "6.5", r: "1.5", fill: "currentColor", stroke: "none" })] }), "Suivez-nous"] }), _jsxs("a", { href: config.googleMapsUrl, target: "_blank", rel: "noopener noreferrer", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: [_jsx("path", { d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" }), _jsx("circle", { cx: "12", cy: "9", r: "2.5" })] }), "Itin\u00E9raire"] }), _jsxs("a", { href: config.googleReviewsUrl, target: "_blank", rel: "noopener noreferrer", children: [_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: _jsx("polygon", { points: "12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" }) }), "Avis Google"] }), _jsxs("a", { href: `https://wa.me/${config.whatsappNumber}`, target: "_blank", rel: "noopener noreferrer", children: [_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .2-1.6 0-.4-.1-.9-.2-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.4.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.2.1.4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1.2.1 1.5.7 1.8.8.2.1.4.2.5.3.1.3 0 .8-.2 1.2z" }) }), "WhatsApp"] })] }), _jsxs("a", { className: "cat-gate", href: "/catgardenmenu", onClick: (event) => playUiSoundThenGo(event, 'meow'), children: [_jsxs("span", { className: "cat-paws", "aria-hidden": "true", children: [_jsx(PawPrint, { size: 18 }), _jsx(PawPrint, { size: 14 }), _jsx(PawPrint, { size: 18 })] }), _jsxs("span", { children: [_jsx("small", { children: "Le caf\u00E9 aux chats" }), _jsx("strong", { children: "Cat\u2019s Garden" })] })] }), _jsxs("p", { className: "footer-credit", children: ["Cette boutique a \u00E9t\u00E9 cr\u00E9\u00E9e par l\u2019\u00E9quipe", ' ', _jsx("a", { href: "https://bitaqa-project.vercel.app/fr", target: "_blank", rel: "noopener noreferrer", children: "Bitaqa" })] })] }), _jsx(OrderDock, { cartOpen: cartOpen, onOpen: openCart }), _jsx(ToTop, { hidden: cartOpen || !!pieceId }), _jsx(AnimatePresence, { children: piece && (_jsx(Sheet, { pastry: piece, wide: wide, onClose: closeTop }, piece.id)) }), _jsx(AnimatePresence, { children: cartOpen && _jsx(CartPanel, { wide: wide, onClose: closeTop }) }), intro && (_jsx(Opening, { reduce: !!reduce, onLift: () => setLive(true), onDone: () => setIntro(false) }))] }));
}
function Collections({ groups, live, reduce, onOpen, }) {
    return (_jsxs("section", { className: "collections", "aria-labelledby": "collections-title", children: [_jsx("header", { className: "block-head vitrine-head", children: _jsx("h2", { id: "collections-title", children: "Collections" }) }), _jsx("div", { className: "tile-grid", children: groups.map(({ category, items }, index) => (_jsxs(motion.button, { type: "button", className: "tile", initial: reduce ? false : { opacity: 0, y: 22 }, animate: live ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }, transition: { duration: reduce ? 0 : 0.7, ease: settle, delay: reduce ? 0 : index * 0.06 }, onClick: () => onOpen(category.id), "aria-label": `${category.name} — ${items.length === 1 ? '1 pièce' : `${items.length} pièces`}`, children: [_jsx("span", { className: "tile-frame", children: _jsx("img", { src: category.photo || items[0]?.image, alt: "", loading: "lazy" }) }), _jsxs("span", { className: "tile-copy", children: [_jsx("strong", { children: category.name }), _jsx("small", { children: items.length === 1 ? '1 pièce' : `${items.length} pièces` })] }), _jsx(Arrow, { className: "tile-arrow" })] }, category.id))) })] }));
}
function PopularRail({ items, live, reduce, onOpen, }) {
    const [held, setHeld] = useState(false);
    if (items.length === 0)
        return null;
    return (_jsxs("section", { className: "rail", "aria-labelledby": "rail-title", children: [_jsx("header", { className: "block-head", children: _jsx("h2", { id: "rail-title", children: "Produits populaires" }) }), _jsx("div", { className: held ? 'rail-window is-held' : 'rail-window', onPointerDown: () => setHeld(true), onPointerUp: () => setHeld(false), onPointerCancel: () => setHeld(false), onPointerLeave: () => setHeld(false), children: _jsxs("div", { className: "rail-track", children: [_jsx(RailSet, { items: items, live: live, reduce: reduce, onOpen: onOpen }), _jsx(RailSet, { items: items, live: live, reduce: reduce, onOpen: onOpen, decorative: true })] }) })] }));
}
function RailSet({ items, live, reduce, onOpen, decorative = false, }) {
    return (_jsx("ul", { className: "rail-set", "aria-hidden": decorative ? true : undefined, children: items.map((pastry, index) => (_jsx("li", { children: _jsx(RailCard, { pastry: pastry, live: live, reduce: reduce, delay: index * 0.05, decorative: decorative, onOpen: onOpen }) }, pastry.id))) }));
}
function RailCard({ pastry, live, reduce, delay, decorative, onOpen, }) {
    const motionProps = {
        initial: reduce ? false : { opacity: 0, y: 18 },
        animate: live ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
        transition: { duration: reduce ? 0 : 0.65, ease: settle, delay: reduce ? 0 : delay },
    };
    return (_jsxs(motion.article, { className: decorative ? 'rail-card is-decorative' : 'rail-card', ...motionProps, children: [_jsxs("button", { type: "button", className: "rail-hit", disabled: decorative, tabIndex: decorative ? -1 : undefined, "aria-label": `${pastry.name}, ${formatDh(pastry.price)}`, onClick: (event) => onOpen(pastry.id, event.currentTarget), children: [_jsx("span", { className: "rail-thumb", children: _jsx("img", { src: pastry.image, alt: "", loading: "lazy" }) }), _jsxs("span", { className: "rail-copy", children: [_jsx("strong", { children: pastry.name }), _jsx("small", { children: pastry.detail })] })] }), _jsxs("span", { className: "rail-foot", children: [_jsx("span", { className: "price", children: formatDh(pastry.price) }), _jsx(RailAdd, { pastry: pastry, inert: decorative })] })] }));
}
function RailAdd({ pastry, inert }) {
    const { add } = useCart();
    if (inert) {
        return _jsx("span", { className: "round-add is-inert", children: "+" });
    }
    return (_jsx("button", { type: "button", className: "round-add", "aria-label": `Ajouter ${pastry.name} au panier`, onClick: (event) => {
            event.stopPropagation();
            add(pastry, 1, event.currentTarget.getBoundingClientRect());
        }, children: "+" }));
}
function CollectionView({ category, items, groups, live, reduce, onBack, onSwitch, onOpen, }) {
    return (_jsxs("section", { className: "collection", children: [_jsxs("header", { className: "collection-head", children: [_jsx("div", { className: "collection-photo", children: _jsx("img", { src: category.photo, alt: "" }) }), _jsxs("div", { className: "collection-copy", children: [_jsxs("button", { type: "button", className: "back-link", onClick: onBack, children: [_jsx(Arrow, { className: "back-arrow" }), "Toutes les collections"] }), _jsx("p", { className: "eyebrow", children: "Collection" }), _jsx("h2", { children: category.name }), _jsx("p", { className: "collection-blurb", children: category.blurb }), _jsxs("p", { className: "collection-count", children: [items.length === 1 ? '1 pièce' : `${items.length} pièces`, " \u00B7 commande sur WhatsApp"] })] })] }), _jsx("nav", { className: "cat-switch", "aria-label": "Collections", children: groups.map((group) => (_jsxs("button", { type: "button", className: group.category.id === category.id ? 'collection-pill is-active' : 'collection-pill', "aria-current": group.category.id === category.id ? 'true' : undefined, onClick: () => onSwitch(group.category.id), children: [_jsx("img", { src: group.category.art, alt: "" }), _jsx("span", { children: group.category.name })] }, group.category.id))) }), _jsxs("div", { className: "piece-grid", children: [items.length === 0 && _jsx("p", { className: "empty", children: "Aucune pi\u00E8ce dans cette collection." }), items.map((pastry, index) => (_jsx(PieceCard, { pastry: pastry, live: live, reduce: reduce, delay: index * 0.04, onOpen: onOpen }, pastry.id)))] })] }));
}
function PieceCard({ pastry, live, reduce, delay, onOpen, }) {
    const { add } = useCart();
    return (_jsxs(motion.article, { className: "piece-card", initial: reduce ? false : { opacity: 0, y: 20 }, animate: live ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }, transition: { duration: reduce ? 0 : 0.6, ease: settle, delay: reduce ? 0 : delay }, children: [_jsxs("button", { type: "button", className: "piece-hit", "aria-label": `${pastry.name}, ${formatDh(pastry.price)}`, onClick: (event) => onOpen(pastry.id, event.currentTarget), children: [_jsx("span", { className: "piece-frame", children: _jsx("img", { src: pastry.image, alt: "", loading: "lazy" }) }), _jsxs("span", { className: "piece-copy", children: [_jsx("strong", { children: pastry.name }), _jsx("small", { children: pastry.detail })] })] }), _jsxs("div", { className: "piece-buy", children: [_jsx("span", { className: "price", children: formatDh(pastry.price) }), _jsx("button", { type: "button", className: "round-add", "aria-label": `Ajouter ${pastry.name} au panier`, onClick: (event) => add(pastry, 1, event.currentTarget.getBoundingClientRect()), children: "+" })] })] }));
}
function Sheet({ pastry, wide, onClose, }) {
    const reduce = useReducedMotion();
    const { categories } = useCatalog();
    const { add } = useCart();
    const [qty, setQty] = useState(1);
    const categoryName = categories.find((item) => item.id === pastry.category)?.name ?? 'La maison';
    const closeRef = useRef(null);
    useEffect(() => {
        closeRef.current?.focus();
    }, []);
    const travel = reduce
        ? { duration: 0.01 }
        : wide
            ? { duration: 0.48, ease: settle }
            : { duration: 0.55, ease: settle };
    return (_jsx(Overlay, { onClose: onClose, children: _jsxs(motion.article, { className: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "piece-title", initial: wide ? { opacity: 0, y: 28 } : { y: '100%' }, animate: wide ? { opacity: 1, y: 0 } : { y: 0 }, exit: wide ? { opacity: 0, y: 18 } : { y: '100%' }, transition: travel, children: [_jsx("div", { className: "sheet-photo", children: _jsx(motion.img, { src: pastry.image, alt: "", initial: reduce ? false : { scale: 1.08 }, animate: { scale: 1 }, transition: { duration: 0.8, ease: settle } }) }), _jsxs("div", { className: "sheet-body", children: [_jsxs("div", { className: "sheet-top", children: [_jsx(Drip, { className: "sheet-drip" }), _jsx("button", { ref: closeRef, type: "button", className: "text-button", onClick: onClose, children: "Fermer" })] }), _jsx("p", { className: "eyebrow", children: categoryName }), _jsx("h2", { id: "piece-title", children: pastry.name }), _jsx("p", { className: "detail", children: pastry.detail }), _jsx("p", { className: "price", children: formatDh(pastry.price) }), _jsxs("div", { className: "sheet-actions", children: [_jsx(Stepper, { qty: qty, onChange: setQty }), _jsx("button", { type: "button", className: "primary", onClick: (event) => add(pastry, qty, event.currentTarget.getBoundingClientRect()), children: "Ajouter au panier" })] })] })] }) }));
}
function CartPanel({ wide, onClose }) {
    const reduce = useReducedMotion();
    const { lines, total, setQty, clear } = useCart();
    const closeRef = useRef(null);
    useEffect(() => {
        closeRef.current?.focus();
    }, []);
    const travel = reduce
        ? { duration: 0.01 }
        : wide
            ? { duration: 0.5, ease: settle }
            : { duration: 0.55, ease: settle };
    return (_jsx(Overlay, { onClose: onClose, align: wide ? 'end' : 'tray', children: _jsxs(motion.aside, { className: "cart", role: "dialog", "aria-modal": "true", "aria-labelledby": "cart-title", initial: wide ? { x: '104%' } : { y: '100%' }, animate: wide ? { x: 0 } : { y: 0 }, exit: wide ? { x: '104%' } : { y: '100%' }, transition: travel, children: [_jsxs("div", { className: "cart-top", children: [_jsx("h2", { id: "cart-title", children: "Panier" }), _jsx("button", { ref: closeRef, type: "button", className: "text-button", onClick: onClose, children: "Fermer" })] }), lines.length === 0 ? (_jsx("p", { className: "empty", children: "Aucune pi\u00E8ce pour le moment." })) : (_jsx("ul", { className: "cart-lines", children: _jsx(AnimatePresence, { initial: false, children: lines.map((line) => (_jsxs(motion.li, { layout: true, initial: reduce ? false : { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, transition: { duration: 0.35, ease: settle }, children: [_jsx("img", { className: "thumb", src: line.pastry.image, alt: "" }), _jsx("h3", { children: line.pastry.name }), _jsx("span", { className: "line-price", children: formatDh(line.qty * line.pastry.price) }), _jsxs("div", { className: "line-actions", children: [_jsx(Stepper, { qty: line.qty, onChange: (qty) => setQty(line.pastry.id, qty) }), _jsx("button", { type: "button", className: "ghost", onClick: () => setQty(line.pastry.id, 0), children: "Retirer" })] })] }, line.pastry.id))) }) })), _jsxs("div", { className: "cart-foot", children: [_jsxs("p", { className: "total", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: formatDh(total) })] }), lines.length > 0 ? (_jsx("a", { className: "primary wide", href: orderHref(lines, total), target: "_blank", rel: "noopener noreferrer", onClick: () => {
                                void rememberOrder(lines, total);
                            }, children: "Commander sur WhatsApp" })) : (_jsx("button", { type: "button", className: "primary wide", disabled: true, children: "Commander sur WhatsApp" })), _jsx("p", { className: "fine", children: "Vous confirmez la commande avec le chef. Aucun paiement sur le site." }), lines.length > 0 && (_jsx("button", { type: "button", className: "ghost", onClick: clear, children: "Vider le panier" }))] })] }) }));
}
function OrderDock({ cartOpen, onOpen }) {
    const reduce = useReducedMotion();
    const { lines, total } = useCart();
    const shown = lines.slice(0, 3);
    const extra = lines.length - shown.length;
    return (_jsx(AnimatePresence, { children: lines.length > 0 && !cartOpen && (_jsxs(motion.button, { type: "button", className: "order-dock", "aria-label": `Finaliser la commande, ${formatDh(total)}`, onClick: onOpen, initial: reduce ? false : { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: reduce ? { opacity: 0 } : { opacity: 0, y: 14 }, transition: { duration: reduce ? 0.12 : 0.4, ease: settle }, children: [_jsxs("span", { className: "dock-copy", children: [_jsx("small", { children: "Votre commande" }), _jsx("ul", { children: shown.map((line) => (_jsx("li", { children: line.qty > 1 ? `${line.qty} × ${line.pastry.name}` : line.pastry.name }, line.pastry.id))) }), extra > 0 && _jsx("em", { children: extra > 1 ? `et ${extra} autres` : 'et 1 autre' })] }), _jsx("span", { className: "dock-total", children: formatDh(total) })] })) }));
}
function ToTop({ hidden }) {
    const reduce = useReducedMotion();
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 520);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!visible || hidden)
        return null;
    return (_jsx("button", { type: "button", className: "to-top", "aria-label": "Remonter en haut", onClick: () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }), children: _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "M12 19V6", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }), _jsx("path", { d: "M6 11l6-6 6 6", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" })] }) }));
}
function Overlay({ children, onClose, align = 'tray', }) {
    const reduce = useReducedMotion();
    return (_jsxs(_Fragment, { children: [_jsx(motion.button, { type: "button", className: "scrim", "aria-label": "Fermer", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: reduce ? 0.01 : 0.35 }, onClick: onClose }), _jsx("div", { className: align === 'end' ? 'cart-center' : 'sheet-center', children: children })] }));
}
function Stepper({ qty, onChange }) {
    return (_jsxs("div", { className: "stepper", "aria-label": "Quantit\u00E9", children: [_jsx("button", { type: "button", onClick: () => onChange(Math.max(1, qty - 1)), "aria-label": "Diminuer", children: "\u2013" }), _jsx("span", { children: qty }), _jsx("button", { type: "button", onClick: () => onChange(Math.min(12, qty + 1)), "aria-label": "Augmenter", children: "+" })] }));
}
