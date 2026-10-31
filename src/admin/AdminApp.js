import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, supabaseEnv } from '../lib/supabase';
import { isTheme, orderStatuses, themes } from '../maison/house';
import { categoriesMigrationSql, fetchCategories, persistCategories, setCategoryList, useCategoryList, } from '../maison/categoriesDb';
import { defaultCategoryArt, defaultCategoryPhoto } from '../maison/categories';
import { moments, orderedMoments } from '../maison/moment';
import { pastryFallback, pastryImages } from '../maison/pastries';
import { clearPieceMeta, pieceCategoryUsage, setPieceCategoryUsage, usePieceCategoryUsage, writePieceMeta, } from '../maison/pieceMeta';
import { constraintViolation, fetchPieces, missingColumn } from '../maison/piecesDb';
import { adminDrafts } from '../maison/vitrine';
import schemaSql from '../../supabase/schema.sql?raw';
import './admin.css';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600&family=Monsieur+La+Doulaise&family=Outfit:wght@300;400;500&display=swap';
const ChangeContext = createContext(null);
function useChangeReport(id, label, dirty, count, save, discard) {
    const report = useContext(ChangeContext);
    const saveRef = useRef(save);
    const discardRef = useRef(discard);
    saveRef.current = save;
    discardRef.current = discard;
    useEffect(() => {
        report?.(id, {
            dirty,
            count,
            label,
            save: () => saveRef.current(),
            discard: () => discardRef.current(),
        });
    }, [report, id, label, dirty, count]);
}
function phrase(labels) {
    if (labels.length <= 1)
        return labels[0] ?? '';
    if (labels.length === 2)
        return `${labels[0]} et ${labels[1]}`;
    return `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;
}
function pieceId(name, taken) {
    const base = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 42) || 'piece';
    let id = base;
    let n = 2;
    while (taken.includes(id)) {
        id = `${base}-${n}`;
        n += 1;
    }
    return id;
}
function rowPayload(row, includeImage, includeCategory, includeMoments) {
    const base = {
        id: row.id,
        name: row.name.trim(),
        detail: row.detail.trim(),
        price: Math.round(Number(row.price)) || 0,
        signature: row.signature,
        visible: row.visible,
        sort: row.sort,
    };
    if (includeCategory)
        base.category = row.category;
    if (includeImage)
        base.image_url = row.imageUrl.trim() || null;
    if (includeMoments)
        base.moments = orderedMoments(row.moments);
    return base;
}
function sameMoments(a, b) {
    const left = orderedMoments(a);
    const right = orderedMoments(b);
    return left.length === right.length && left.every((id, index) => id === right[index]);
}
function pieceBodyChanged(a, b) {
    return (a.name !== b.name ||
        a.detail !== b.detail ||
        a.price !== b.price ||
        a.category !== b.category ||
        a.signature !== b.signature ||
        a.visible !== b.visible ||
        a.imageUrl !== b.imageUrl ||
        !sameMoments(a.moments, b.moments));
}
function toggleMoment(current, id) {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    return orderedMoments(next);
}
function diffPieces(saved, rows) {
    const touched = [];
    const removed = [];
    const dirtyIds = new Set();
    const freshIds = new Set();
    if (!rows)
        return { count: 0, touched, removed, dirtyIds, freshIds };
    const savedById = new Map(saved.map((row) => [row.id, row]));
    const currentIds = new Set(rows.map((row) => row.id));
    let bodyCount = 0;
    let orderChanged = false;
    for (const row of saved) {
        if (!currentIds.has(row.id))
            removed.push(row);
    }
    for (const row of rows) {
        const prev = savedById.get(row.id);
        if (!prev) {
            touched.push(row);
            dirtyIds.add(row.id);
            freshIds.add(row.id);
            bodyCount += 1;
            continue;
        }
        const body = pieceBodyChanged(prev, row);
        const order = prev.sort !== row.sort;
        if (!body && !order)
            continue;
        touched.push(row);
        dirtyIds.add(row.id);
        if (body)
            bodyCount += 1;
        else
            orderChanged = true;
    }
    return {
        count: bodyCount + removed.length + (orderChanged ? 1 : 0),
        touched,
        removed,
        dirtyIds,
        freshIds,
    };
}
function PieceGrip({ active, onDragStart, onDragOver, onDragEnd, }) {
    const timer = useRef(null);
    const dragging = useRef(false);
    const origin = useRef(0);
    const clearTimer = () => {
        if (timer.current !== null)
            window.clearTimeout(timer.current);
        timer.current = null;
    };
    const end = () => {
        clearTimer();
        if (dragging.current)
            onDragEnd();
        dragging.current = false;
    };
    return (_jsx("button", { type: "button", className: active ? 'piece-grip is-on' : 'piece-grip', "aria-label": "Maintenir puis glisser pour changer l\u2019ordre", onClick: (event) => event.preventDefault(), onPointerDown: (event) => {
            if (event.button !== 0)
                return;
            const handle = event.currentTarget;
            const pointerId = event.pointerId;
            origin.current = event.clientY;
            clearTimer();
            timer.current = window.setTimeout(() => {
                dragging.current = true;
                handle.setPointerCapture(pointerId);
                onDragStart();
            }, 200);
        }, onPointerMove: (event) => {
            if (!dragging.current) {
                if (Math.abs(event.clientY - origin.current) > 10)
                    clearTimer();
                return;
            }
            onDragOver({ x: event.clientX, y: event.clientY });
        }, onPointerUp: end, onPointerCancel: end, children: _jsxs("svg", { viewBox: "0 0 10 16", "aria-hidden": "true", children: [_jsx("circle", { cx: "2.2", cy: "2.2", r: "1.15" }), _jsx("circle", { cx: "7.8", cy: "2.2", r: "1.15" }), _jsx("circle", { cx: "2.2", cy: "8", r: "1.15" }), _jsx("circle", { cx: "7.8", cy: "8", r: "1.15" }), _jsx("circle", { cx: "2.2", cy: "13.8", r: "1.15" }), _jsx("circle", { cx: "7.8", cy: "13.8", r: "1.15" })] }) }));
}
function cleanDraft(row) {
    return {
        ...row,
        name: row.name.trim(),
        detail: row.detail.trim(),
        price: String(Math.round(Number(row.price)) || 0),
    };
}
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, 900 / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('image'));
                    return;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => reject(new Error('image'));
            img.src = String(reader.result);
        };
        reader.onerror = () => reject(new Error('image'));
        reader.readAsDataURL(file);
    });
}
function missingTable(error) {
    if (!error)
        return false;
    return error.code === 'PGRST205' || /schema cache/i.test(error.message ?? '');
}
const SESSION_EXPIRED = 'La session a expiré. Reconnecte-toi pour continuer.';
function isAuthError(error) {
    if (!error)
        return false;
    const message = error.message ?? '';
    return (error.status === 401 ||
        error.code === 'PGRST301' ||
        /jwt expired/i.test(message) ||
        /invalid jwt/i.test(message) ||
        /invalid claim/i.test(message));
}
let expiredNotice = '';
function takeExpiredNotice() {
    const note = expiredNotice;
    expiredNotice = '';
    return note;
}
async function ensureSession() {
    if (!supabase)
        return false;
    const { data } = await supabase.auth.getSession();
    const current = data.session;
    if (!current)
        return false;
    const expiresAt = (current.expires_at ?? 0) * 1000;
    if (expiresAt > Date.now() + 20_000)
        return true;
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.data.session)
        return true;
    expiredNotice = SESSION_EXPIRED;
    await supabase.auth.signOut();
    return false;
}
async function dropExpiredSession() {
    expiredNotice = SESSION_EXPIRED;
    await supabase?.auth.signOut();
}
export default function AdminApp() {
    const [session, setSession] = useState(null);
    const [ready, setReady] = useState(false);
    const [needsSchema, setNeedsSchema] = useState(false);
    useEffect(() => {
        document.title = 'Atelier · Maître Chocolatier Bennis';
    }, []);
    useEffect(() => {
        if (!supabase) {
            setReady(true);
            return;
        }
        let cancel = false;
        void (async () => {
            const ok = await ensureSession();
            if (cancel)
                return;
            if (!ok)
                setSession(null);
            else {
                const { data } = await supabase.auth.getSession();
                if (!cancel)
                    setSession(data.session);
            }
            if (!cancel)
                setReady(true);
        })();
        const { data } = supabase.auth.onAuthStateChange((_event, next) => {
            if (!cancel)
                setSession(next);
        });
        return () => {
            cancel = true;
            data.subscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if (!supabase)
            return;
        void supabase
            .from('pieces')
            .select('id')
            .limit(1)
            .then(({ error }) => setNeedsSchema(missingTable(error)));
    }, [session]);
    return (_jsxs("div", { className: "atelier", children: [_jsx("link", { rel: "stylesheet", href: FONT_HREF }), !ready ? null : !supabase ? (_jsx(Gate, { needsSchema: false, offline: supabaseEnv.missing === 'key' ? 'key' : 'url', onSession: () => { } })) : session ? (_jsx(Desk, { needsSchema: needsSchema, onSchema: () => setNeedsSchema(false) })) : (_jsx(Gate, { needsSchema: needsSchema, offline: false, onSession: setSession }))] }));
}
function Brand() {
    return (_jsx("a", { className: "atelier-brand", href: "/", children: _jsx("img", { src: "/maison/wordmark-night.png", alt: "Ma\u00EEtre Chocolatier Bennis" }) }));
}
function Gate({ needsSchema, offline, onSession, }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(takeExpiredNotice);
    const [pending, setPending] = useState(false);
    const submit = async (event) => {
        event.preventDefault();
        if (!supabase)
            return;
        setPending(true);
        setError('');
        const { data, error: signError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        setPending(false);
        if (signError || !data.session) {
            setError('Connexion impossible. Vérifie l’e-mail et le mot de passe.');
            return;
        }
        onSession(data.session);
    };
    return (_jsx("div", { className: "gate", children: _jsxs("div", { children: [_jsxs("section", { className: "gate-card", children: [_jsx("a", { className: "gate-back", href: "/", children: "Retour" }), _jsx("img", { className: "gate-logo", src: "/maison/wordmark.png", alt: "Ma\u00EEtre Chocolatier Bennis" }), _jsx("h1", { children: "L\u2019atelier" }), _jsx("p", { children: "Les pi\u00E8ces, les commandes et le th\u00E8me de la boutique." }), offline ? (_jsx("p", { className: "form-error", children: offline === 'key'
                                ? 'L’adresse de la base est en place. La clé publique n’a pas été prise dans ce dépôt : dans Vercel, la variable doit s’appeler VITE_SUPABASE_ANON_KEY, être cochée pour Production, puis un nouveau déploiement est nécessaire.'
                                : 'La base n’est pas encore reliée à ce site.' })) : (_jsxs("form", { onSubmit: submit, children: [_jsxs("label", { children: ["E-mail", _jsx("input", { type: "email", autoComplete: "username", value: email, onChange: (event) => setEmail(event.target.value), required: true })] }), _jsxs("label", { children: ["Mot de passe", _jsx("input", { type: "password", autoComplete: "current-password", value: password, onChange: (event) => setPassword(event.target.value), required: true })] }), error && _jsx("p", { className: "form-error", children: error }), _jsx("button", { className: "solid", type: "submit", disabled: pending, children: "Entrer" })] }))] }), needsSchema && _jsx(SchemaCard, {})] }) }));
}
function SchemaCard() {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(schemaSql);
            setCopied(true);
        }
        catch {
            setCopied(false);
        }
    };
    return (_jsxs("section", { className: "schema-card", children: [_jsx("h2", { children: "Pr\u00E9parer la base" }), _jsx("p", { children: "Dans Supabase, ouvre SQL Editor, colle ce script, puis lance-le. Cr\u00E9e ensuite un utilisateur dans Authentication \u2192 Users." }), _jsx("pre", { children: schemaSql }), _jsx("button", { className: "solid", type: "button", onClick: copy, children: copied ? 'Script copié' : 'Copier le script' })] }));
}
function Desk({ needsSchema, onSchema, }) {
    const [panel, setPanel] = useState('pieces');
    const [reports, setReports] = useState({});
    const [pending, setPending] = useState(false);
    const [saveError, setSaveError] = useState('');
    const actions = useRef(new Map());
    const report = useCallback((id, change) => {
        actions.current.set(id, change);
        setReports((current) => {
            const prev = current[id];
            if (prev && prev.dirty === change.dirty && prev.count === change.count && prev.label === change.label)
                return current;
            return { ...current, [id]: { dirty: change.dirty, count: change.count, label: change.label } };
        });
    }, []);
    const dirty = Object.values(reports).filter((item) => item.dirty && item.count > 0);
    const total = dirty.reduce((sum, item) => sum + item.count, 0);
    const detail = phrase(dirty.map((item) => item.label));
    useEffect(() => {
        if (total === 0)
            return;
        const onLeave = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', onLeave);
        return () => window.removeEventListener('beforeunload', onLeave);
    }, [total]);
    const leave = async () => {
        if (total > 0 && !window.confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?'))
            return;
        await supabase?.auth.signOut();
    };
    const saveAll = async () => {
        setPending(true);
        setSaveError('');
        let message = '';
        for (const change of actions.current.values()) {
            if (!change.dirty || change.count === 0)
                continue;
            const error = await change.save();
            if (error)
                message = message || error;
        }
        setSaveError(message);
        setPending(false);
    };
    const discardAll = () => {
        if (pending)
            return;
        for (const change of actions.current.values()) {
            if (change.dirty && change.count > 0)
                change.discard();
        }
        setSaveError('');
    };
    return (_jsxs(ChangeContext.Provider, { value: report, children: [_jsxs("header", { className: "atelier-bar", children: [_jsx(Brand, {}), _jsxs("div", { className: "atelier-actions", children: [_jsx("a", { href: "/", children: "Voir la boutique" }), _jsx("button", { type: "button", className: "quiet", onClick: leave, children: "Quitter" })] })] }), _jsxs("nav", { className: "atelier-nav", children: [_jsx("button", { type: "button", className: panel === 'pieces' ? 'is-on' : '', onClick: () => setPanel('pieces'), children: "Pi\u00E8ces" }), _jsx("button", { type: "button", className: panel === 'categories' ? 'is-on' : '', onClick: () => setPanel('categories'), children: "Cat\u00E9gories" }), _jsx("button", { type: "button", className: panel === 'orders' ? 'is-on' : '', onClick: () => setPanel('orders'), children: "Commandes" }), _jsx("button", { type: "button", className: panel === 'themes' ? 'is-on' : '', onClick: () => setPanel('themes'), children: "Saisons" })] }), _jsxs("main", { className: total > 0 ? 'atelier-main has-changes' : 'atelier-main', children: [needsSchema && _jsx(SchemaCard, {}), _jsx("div", { hidden: panel !== 'pieces', children: _jsx(Pieces, { onReady: onSchema }) }), _jsx("div", { hidden: panel !== 'categories', children: _jsx(CategoriesPanel, {}) }), _jsx("div", { hidden: panel !== 'orders', children: _jsx(Orders, {}) }), _jsx("div", { hidden: panel !== 'themes', children: _jsx(Themes, {}) })] }), total > 0 && (_jsxs("div", { className: "save-dock", role: "status", "aria-live": "polite", children: [_jsxs("div", { className: "save-dock-copy", children: [_jsx("strong", { children: total === 1 ? '1 modification' : `${total} modifications` }), _jsx("small", { children: detail }), saveError && _jsx("p", { className: "form-error", children: saveError })] }), _jsxs("div", { className: "save-dock-actions", children: [_jsx("button", { className: "ghost-ink", type: "button", onClick: discardAll, disabled: pending, children: "Annuler" }), _jsx("button", { className: "solid", type: "button", onClick: saveAll, disabled: pending, children: pending ? 'Enregistrement…' : 'Enregistrer' })] })] }))] }));
}
const photoSql = 'alter table public.pieces add column if not exists image_url text;';
function PhotoColumn() {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(photoSql);
            setCopied(true);
        }
        catch {
            setCopied(false);
        }
    };
    return (_jsxs("section", { className: "schema-card", children: [_jsx("h2", { children: "Les photos" }), _jsx("p", { children: "Une pi\u00E8ce sans photo enregistr\u00E9e n\u2019appara\u00EEt qu\u2019avec une assiette vide dans la boutique. Dans Supabase, ouvre SQL Editor, lance cette ligne, puis red\u00E9pose la photo et enregistre." }), _jsx("pre", { children: photoSql }), _jsx("button", { className: "solid", type: "button", onClick: copy, children: copied ? 'Ligne copiée' : 'Copier la ligne' })] }));
}
function VitrineColumns() {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(categoriesMigrationSql);
            setCopied(true);
        }
        catch {
            setCopied(false);
        }
    };
    return (_jsxs("section", { className: "schema-card", children: [_jsx("h2", { children: "Enregistrement dans la base" }), _jsx("p", { children: "Supabase bloque encore l\u2019\u00E9criture des pi\u00E8ces. Ouvre SQL Editor, lance ce script, puis clique \u00E0 nouveau sur Enregistrer." }), _jsx("pre", { children: categoriesMigrationSql }), _jsx("button", { className: "solid", type: "button", onClick: copy, children: copied ? 'Script copié' : 'Copier le script' })] }));
}
function MomentField({ value, onChange }) {
    return (_jsxs("fieldset", { className: "moment-field", children: [_jsx("legend", { children: "Moment de la journ\u00E9e" }), _jsx("div", { className: "moment-options", children: moments.map((moment) => (_jsxs("label", { className: "moment-option", children: [_jsx("input", { type: "checkbox", checked: value.includes(moment.id), onChange: () => onChange(toggleMoment(value, moment.id)) }), _jsx("span", { children: moment.label })] }, moment.id))) })] }));
}
function CategorySelect({ value, onChange }) {
    const list = useCategoryList();
    const options = list.some((item) => item.id === value) || !value
        ? list
        : [...list, { id: value, name: value, blurb: '', art: defaultCategoryArt, photo: defaultCategoryPhoto, sort: 999 }];
    return (_jsxs("label", { children: ["Cat\u00E9gorie", _jsx("select", { value: value, onChange: (event) => onChange(event.target.value), children: options.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id))) })] }));
}
function fold(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}
function Choice({ kind, pressed, title, hint, onToggle, }) {
    return (_jsxs("button", { type: "button", className: pressed ? `choice choice-${kind} is-on` : `choice choice-${kind}`, "aria-pressed": pressed, onClick: onToggle, children: [_jsx("span", { className: "choice-mark", "aria-hidden": "true", children: kind === 'star' ? (_jsx("svg", { viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 3.2 14.4 9l6.2.5-4.7 4 1.5 6L12 16.2 6.6 19.5l1.5-6-4.7-4L9.6 9Z" }) })) : (_jsx("svg", { viewBox: "0 0 24 24", children: _jsx("path", { d: "M5 12.5 10 17.5 19 7.5" }) })) }), _jsxs("span", { className: "choice-copy", children: [_jsx("strong", { children: title }), _jsx("small", { children: hint })] })] }));
}
function Pieces({ onReady }) {
    const categoryList = useCategoryList();
    const [rows, setRows] = useState(null);
    const [saved, setSaved] = useState([]);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('toutes');
    const [creating, setCreating] = useState(false);
    const [openId, setOpenId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [freshName, setFreshName] = useState('');
    const [freshDetail, setFreshDetail] = useState('');
    const [freshPrice, setFreshPrice] = useState('');
    const [freshCategory, setFreshCategory] = useState('patisseries');
    const [freshMoments, setFreshMoments] = useState([]);
    const [freshImage, setFreshImage] = useState('');
    const [hasImage, setHasImage] = useState(true);
    const [hasCategory, setHasCategory] = useState(true);
    const [hasMoments, setHasMoments] = useState(true);
    const [columnsKnown, setColumnsKnown] = useState(false);
    const [needsConstraint, setNeedsConstraint] = useState(false);
    const savedRef = useRef(saved);
    savedRef.current = saved;
    const load = async () => {
        if (!(await ensureSession()))
            return;
        let result = await fetchPieces();
        if (isAuthError(result.error)) {
            const refreshed = await supabase?.auth.refreshSession();
            if (!refreshed?.data.session) {
                await dropExpiredSession();
                return;
            }
            result = await fetchPieces();
            if (isAuthError(result.error)) {
                await dropExpiredSession();
                return;
            }
        }
        const missing = missingTable(result.error);
        const flags = {
            hasCategory: result.hasCategory,
            hasMoments: result.hasMoments,
            failed: Boolean(result.error),
        };
        const built = adminDrafts(result.rows, flags);
        const drafts = built.map(({ persisted: _persisted, ...draft }) => draft);
        if (!result.error) {
            onReady();
            setHasImage(result.hasImage);
            setHasCategory(result.hasCategory);
            setHasMoments(result.hasMoments);
            setColumnsKnown(true);
            setError('');
        }
        else if (!missing) {
            setError('La lecture des pièces a échoué. La vitrine locale reste affichée.');
        }
        else {
            setError('');
        }
        setRows(drafts);
        setSaved(drafts.map((row) => ({ ...row })));
    };
    useEffect(() => {
        void load();
    }, []);
    useEffect(() => {
        setPieceCategoryUsage(rows?.map((row) => row.category) ?? null);
    }, [rows]);
    useEffect(() => () => setPieceCategoryUsage(null), []);
    useEffect(() => {
        if (categoryFilter !== 'toutes' && !categoryList.some((item) => item.id === categoryFilter)) {
            setCategoryFilter('toutes');
        }
    }, [categoryFilter, categoryList]);
    const update = (id, patch) => {
        setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null);
    };
    const rememberFields = (drafts, categoryStored, momentsStored) => {
        for (const row of drafts) {
            if (categoryStored)
                clearPieceMeta(row.id, { category: true });
            else
                writePieceMeta(row.id, { category: row.category });
            if (momentsStored)
                clearPieceMeta(row.id, { moments: true });
            else
                writePieceMeta(row.id, { moments: orderedMoments(row.moments) });
        }
    };
    const push = async (drafts) => {
        const client = supabase;
        if (!client)
            return { status: 'failed', message: 'La connexion à la base est absente.' };
        if (drafts.length === 0)
            return { status: 'saved' };
        if (!(await ensureSession())) {
            return { status: 'failed', message: SESSION_EXPIRED };
        }
        let image = true;
        let category = true;
        let moment = true;
        let lastMessage = 'Les pièces n’ont pas pu être enregistrées dans la base.';
        let refreshedAuth = false;
        for (let attempt = 0; attempt < 6; attempt += 1) {
            const result = await client.from('pieces').upsert(drafts.map((row) => rowPayload(row, image, category, moment)));
            if (!result.error) {
                rememberFields(drafts, category, moment);
                setHasImage(image);
                setHasCategory(category);
                setHasMoments(moment);
                setColumnsKnown(true);
                return { status: image ? 'saved' : 'photo' };
            }
            if (result.error.code === '42501') {
                setNeedsConstraint(true);
                setColumnsKnown(true);
                return {
                    status: 'failed',
                    message: 'La base refuse l’enregistrement. Lance le script ci-dessous dans Supabase, puis réessaie.',
                };
            }
            if (category && (missingColumn(result.error, 'category') || constraintViolation(result.error))) {
                if (constraintViolation(result.error))
                    setNeedsConstraint(true);
                category = false;
                continue;
            }
            if (moment && missingColumn(result.error, 'moments')) {
                moment = false;
                setHasMoments(false);
                setColumnsKnown(true);
                continue;
            }
            if (image && missingColumn(result.error, 'image_url')) {
                image = false;
                setHasImage(false);
                setColumnsKnown(true);
                continue;
            }
            if (isAuthError(result.error)) {
                if (!refreshedAuth) {
                    refreshedAuth = true;
                    const refreshed = await client.auth.refreshSession();
                    if (refreshed.data.session)
                        continue;
                }
                await dropExpiredSession();
                return { status: 'failed', message: SESSION_EXPIRED };
            }
            lastMessage = result.error.message || lastMessage;
            return { status: 'failed', message: lastMessage };
        }
        return { status: 'failed', message: lastMessage };
    };
    const [dragId, setDragId] = useState(null);
    const rowsRef = useRef(rows);
    const shownRef = useRef([]);
    rowsRef.current = rows;
    const placePiece = (fromId, x, y) => {
        const hit = document.elementFromPoint(x, y)?.closest('[data-piece-id]');
        const overId = hit?.getAttribute('data-piece-id');
        if (!overId || overId === fromId || !(hit instanceof HTMLElement))
            return;
        const rect = hit.getBoundingClientRect();
        const after = y > rect.top + rect.height / 2;
        const current = rowsRef.current;
        const visible = shownRef.current;
        if (!current)
            return;
        const order = visible.map((row) => row.id);
        const from = order.indexOf(fromId);
        let to = order.indexOf(overId);
        if (from < 0 || to < 0)
            return;
        order.splice(from, 1);
        if (from < to)
            to -= 1;
        order.splice(after ? to + 1 : to, 0, fromId);
        if (order.every((id, index) => id === visible[index]?.id))
            return;
        const byId = new Map(current.map((row) => [row.id, row]));
        const queue = order.flatMap((id) => {
            const row = byId.get(id);
            return row ? [row] : [];
        });
        const shownIds = new Set(order);
        let cursor = 0;
        const next = current.map((row) => (shownIds.has(row.id) ? queue[cursor++] : row));
        setRows(next.map((row, sort) => ({ ...row, sort })));
    };
    const remove = (id) => {
        setError('');
        setPendingDelete(null);
        setOpenId((current) => (current === id ? null : current));
        setRows((current) => current?.filter((row) => row.id !== id) ?? null);
    };
    const clearFresh = () => {
        setFreshName('');
        setFreshDetail('');
        setFreshPrice('');
        setFreshCategory('patisseries');
        setFreshMoments([]);
        setFreshImage('');
        setCreating(false);
    };
    const create = () => {
        const price = Math.round(Number(freshPrice));
        if (!freshName.trim() || !Number.isFinite(price) || price < 0) {
            setError('Le nom et le prix sont nécessaires.');
            return;
        }
        const id = pieceId(freshName, (rows ?? []).map((row) => row.id));
        const created = {
            id,
            name: freshName.trim(),
            detail: freshDetail.trim(),
            price: String(price),
            category: freshCategory,
            signature: false,
            visible: true,
            sort: rows?.length ?? 0,
            imageUrl: freshImage,
            moments: freshMoments,
        };
        setRows((current) => [...(current ?? []), created]);
        clearFresh();
        setError('');
        setOpenId(id);
    };
    const formStarted = creating && Boolean(freshName.trim() || freshDetail.trim() || freshPrice.trim() || freshImage || freshMoments.length);
    const diff = useMemo(() => diffPieces(saved, rows), [saved, rows]);
    const changeCount = diff.count + (formStarted ? 1 : 0);
    const pendingForm = () => {
        if (!formStarted)
            return null;
        const price = Math.round(Number(freshPrice));
        if (!freshName.trim() || !Number.isFinite(price) || price < 0)
            return 'invalid';
        return {
            id: pieceId(freshName, (rows ?? []).map((row) => row.id)),
            name: freshName.trim(),
            detail: freshDetail.trim(),
            price: String(price),
            category: freshCategory,
            signature: false,
            visible: true,
            sort: rows?.length ?? 0,
            imageUrl: freshImage,
            moments: freshMoments,
        };
    };
    const savePieces = async () => {
        if (!rows || !supabase)
            return null;
        const extra = pendingForm();
        if (extra === 'invalid')
            return 'Le nom et le prix sont nécessaires.';
        const batch = extra ? [...diff.touched, extra] : [...diff.touched];
        for (const row of batch) {
            const price = Math.round(Number(row.price));
            if (!row.name.trim() || !Number.isFinite(price) || price < 0)
                return 'Le nom et le prix sont nécessaires.';
        }
        if (batch.length) {
            const result = await push(batch.map(cleanDraft));
            if (result.status === 'failed')
                return result.message ?? 'L’enregistrement a échoué.';
        }
        if (diff.removed.length) {
            const { error: writeError } = await supabase.from('pieces').delete().in('id', diff.removed.map((row) => row.id));
            if (writeError) {
                if (isAuthError(writeError)) {
                    await dropExpiredSession();
                    return SESSION_EXPIRED;
                }
                return 'Une pièce n’a pas pu être retirée.';
            }
        }
        const next = (extra ? [...rows, extra] : rows).map(cleanDraft);
        setRows(next);
        setSaved(next.map((row) => ({ ...row })));
        clearFresh();
        setError('');
        return null;
    };
    const discardPieces = () => {
        setRows(savedRef.current.map((row) => ({ ...row })));
        clearFresh();
        setError('');
        setPendingDelete(null);
    };
    useChangeReport('pieces', 'Pièces', changeCount > 0, changeCount, savePieces, discardPieces);
    useEffect(() => {
        return () => document.body.classList.remove('is-piece-dragging');
    }, []);
    if (!rows)
        return _jsx("p", { className: "note", children: "Ouverture des pi\u00E8ces\u2026" });
    const needle = fold(query.trim());
    const shown = rows.filter((row) => {
        if (categoryFilter !== 'toutes' && row.category !== categoryFilter)
            return false;
        if (needle && !fold(`${row.name} ${row.detail}`).includes(needle))
            return false;
        return true;
    });
    const filterOptions = categoryList.slice();
    shownRef.current = shown;
    for (const row of rows) {
        if (!filterOptions.some((item) => item.id === row.category)) {
            filterOptions.push({
                id: row.category,
                name: row.category,
                blurb: '',
                art: defaultCategoryArt,
                photo: defaultCategoryPhoto,
                sort: 999,
            });
        }
    }
    return (_jsxs("div", { className: "stack", children: [rows.length === 0 && !error && _jsx("p", { className: "note", children: "La vitrine est vide." }), error && _jsx("p", { className: "form-error", children: error }), columnsKnown && !hasImage && _jsx(PhotoColumn, {}), ((columnsKnown && (!hasCategory || !hasMoments)) || needsConstraint) && _jsx(VitrineColumns, {}), _jsxs("div", { className: "cat-filter", role: "group", "aria-label": "Filtrer par cat\u00E9gorie", children: [_jsx("button", { type: "button", className: categoryFilter === 'toutes' ? 'is-on' : '', onClick: () => setCategoryFilter('toutes'), children: "Toutes" }), filterOptions.map((category) => (_jsx("button", { type: "button", className: categoryFilter === category.id ? 'is-on' : '', onClick: () => setCategoryFilter(category.id), children: category.name }, category.id)))] }), _jsxs("label", { className: "piece-search", children: [_jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), _jsx("path", { d: "M15.2 15.2 20 20" })] }), _jsx("input", { type: "search", value: query, placeholder: "Rechercher une pi\u00E8ce", autoComplete: "off", onChange: (event) => setQuery(event.target.value) })] }), !creating ? (_jsxs("button", { className: "new-piece", type: "button", onClick: () => setCreating(true), children: [_jsx("span", { className: "new-piece-plus", "aria-hidden": "true", children: "+" }), _jsxs("span", { children: [_jsx("strong", { children: "Nouvelle pi\u00E8ce" }), _jsx("small", { children: "Ajouter un g\u00E2teau \u00E0 la vitrine" })] })] })) : (_jsxs("article", { className: "piece-edit is-new", children: [_jsx("p", { className: "new-kicker", children: "Nouvelle pi\u00E8ce" }), freshImage ? _jsx("img", { src: freshImage, alt: "" }) : _jsx("span", { className: "image-wait", children: "Image" }), _jsxs("div", { className: "fields", children: [_jsxs("label", { children: ["Nom", _jsx("input", { value: freshName, onChange: (event) => setFreshName(event.target.value) })] }), _jsxs("label", { children: ["D\u00E9tail", _jsx("textarea", { value: freshDetail, onChange: (event) => setFreshDetail(event.target.value) })] }), _jsxs("label", { children: ["Prix en DH", _jsx("input", { inputMode: "numeric", value: freshPrice, onChange: (event) => setFreshPrice(event.target.value) })] }), _jsx(CategorySelect, { value: freshCategory, onChange: setFreshCategory }), _jsx(MomentField, { value: freshMoments, onChange: setFreshMoments }), _jsxs("label", { className: "file-pick", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (event) => {
                                            const file = event.target.files?.[0];
                                            if (!file)
                                                return;
                                            void fileToDataUrl(file)
                                                .then(setFreshImage)
                                                .catch(() => setError('Cette image n’a pas pu être lue.'));
                                        } }), _jsx("span", { children: freshImage ? 'Changer l’image' : 'Choisir une image' })] }), _jsxs("label", { children: ["Ou un lien d\u2019image", _jsx("input", { value: freshImage.startsWith('data:') ? '' : freshImage, placeholder: "https://", onChange: (event) => setFreshImage(event.target.value) })] }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { className: "solid", type: "button", onClick: create, children: "Ajouter" }), _jsx("button", { className: "ghost-ink", type: "button", onClick: () => setCreating(false), children: "Annuler" })] })] })] })), shown.length === 0 && (needle || categoryFilter !== 'toutes') && (_jsx("p", { className: "note", children: "Aucune pi\u00E8ce pour ce filtre." })), shown.map((row) => {
                const thumb = row.imageUrl || pastryImages[row.id] || pastryFallback;
                const open = openId === row.id;
                return (_jsxs("div", { className: open
                        ? dragId === row.id
                            ? 'piece-block is-open is-lifted'
                            : 'piece-block is-open'
                        : dragId === row.id
                            ? 'piece-block is-lifted'
                            : 'piece-block', "data-piece-id": row.id, children: [_jsxs("div", { className: "piece-row", children: [_jsx(PieceGrip, { active: dragId === row.id, onDragStart: () => {
                                        setDragId(row.id);
                                        document.body.classList.add('is-piece-dragging');
                                    }, onDragOver: (point) => placePiece(row.id, point.x, point.y), onDragEnd: () => {
                                        setDragId(null);
                                        document.body.classList.remove('is-piece-dragging');
                                    } }), _jsxs("button", { className: "piece-open", type: "button", onClick: () => setOpenId(open ? null : row.id), children: [_jsx("img", { src: thumb, alt: "" }), _jsxs("span", { children: [_jsx("strong", { children: row.name || 'Sans nom' }), _jsxs("small", { children: [row.price || '0', " DH", ' · ', filterOptions.find((item) => item.id === row.category)?.name ?? 'Pâtisseries', row.moments.length > 0
                                                            ? ` · ${orderedMoments(row.moments)
                                                                .map((id) => moments.find((item) => item.id === id)?.label)
                                                                .filter(Boolean)
                                                                .join(', ')}`
                                                            : '', row.visible ? '' : ' · Masquée', !row.imageUrl && !pastryImages[row.id] ? ' · Sans photo' : '', diff.freshIds.has(row.id) ? ' · nouvelle' : diff.dirtyIds.has(row.id) ? ' · modifiée' : ''] })] })] }), pendingDelete === row.id ? (_jsxs("span", { className: "piece-confirm", children: [_jsx("button", { className: "piece-remove is-sure", type: "button", onClick: () => remove(row.id), children: "Retirer" }), _jsx("button", { className: "piece-remove", type: "button", onClick: () => setPendingDelete(null), children: "Annuler" })] })) : (_jsx("button", { className: "piece-remove", type: "button", onClick: () => setPendingDelete(row.id), children: "Retirer" }))] }), open && (_jsxs("article", { className: "piece-edit", children: [_jsx("img", { src: thumb, alt: "" }), _jsxs("div", { className: "fields", children: [_jsxs("label", { children: ["Nom", _jsx("input", { value: row.name, onChange: (event) => update(row.id, { name: event.target.value }) })] }), _jsxs("label", { children: ["D\u00E9tail", _jsx("textarea", { value: row.detail, onChange: (event) => update(row.id, { detail: event.target.value }) })] }), _jsxs("label", { children: ["Prix en DH", _jsx("input", { inputMode: "numeric", value: row.price, onChange: (event) => update(row.id, { price: event.target.value }) })] }), _jsx(CategorySelect, { value: row.category, onChange: (category) => update(row.id, { category }) }), _jsx(MomentField, { value: row.moments, onChange: (next) => update(row.id, { moments: next }) }), _jsxs("label", { className: "file-pick", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (event) => {
                                                        const file = event.target.files?.[0];
                                                        if (!file)
                                                            return;
                                                        void fileToDataUrl(file)
                                                            .then((imageUrl) => update(row.id, { imageUrl }))
                                                            .catch(() => setError('Cette image n’a pas pu être lue.'));
                                                    } }), _jsx("span", { children: row.imageUrl ? 'Changer la photo' : 'Déposer une photo' })] }), _jsx("div", { className: "choices", children: _jsx(Choice, { kind: "check", pressed: row.visible, title: "Visible", hint: row.visible ? 'Dans la boutique' : 'Hors de la vitrine', onToggle: () => update(row.id, { visible: !row.visible }) }) })] })] }))] }, row.id));
            })] }));
}
function CategoryPhoto({ photo, onPick, onError, }) {
    return (_jsxs("div", { className: "category-photo", children: [_jsx("img", { src: photo || defaultCategoryPhoto, alt: "" }), _jsxs("label", { className: "file-pick", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (event) => {
                            const file = event.target.files?.[0];
                            event.target.value = '';
                            if (!file)
                                return;
                            void fileToDataUrl(file).then(onPick).catch(onError);
                        } }), _jsx("span", { children: photo && photo !== defaultCategoryPhoto ? 'Changer la photo' : 'Déposer une photo' })] })] }));
}
function CategoriesPanel() {
    const usage = usePieceCategoryUsage();
    const [rows, setRows] = useState(null);
    const [saved, setSaved] = useState([]);
    const [tableReady, setTableReady] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [freshName, setFreshName] = useState('');
    const [freshBlurb, setFreshBlurb] = useState('');
    const [freshPhoto, setFreshPhoto] = useState(defaultCategoryPhoto);
    const [pendingDelete, setPendingDelete] = useState(null);
    const savedRef = useRef(saved);
    savedRef.current = saved;
    useEffect(() => {
        let cancel = false;
        void fetchCategories().then((result) => {
            if (cancel)
                return;
            setTableReady(result.table);
            setRows(result.rows);
            setSaved(result.rows.map((row) => ({ ...row })));
            setCategoryList(result.rows);
        });
        return () => {
            cancel = true;
        };
    }, []);
    useEffect(() => {
        if (rows)
            setCategoryList(rows);
    }, [rows]);
    const update = (id, patch) => {
        setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null);
    };
    const inUse = async (id) => {
        const live = pieceCategoryUsage();
        if (live)
            return live.includes(id);
        const result = await fetchPieces();
        return adminDrafts(result.rows, {
            hasCategory: result.hasCategory,
            hasMoments: result.hasMoments,
            failed: Boolean(result.error),
        }).some((row) => row.category === id);
    };
    const remove = async (id) => {
        if (await inUse(id)) {
            setPendingDelete(null);
            setError('Cette catégorie contient encore des pièces. Déplacez-les avant de la supprimer.');
            return;
        }
        setError('');
        setPendingDelete(null);
        setRows((current) => current?.filter((row) => row.id !== id) ?? null);
    };
    const move = (index, direction) => {
        if (!rows)
            return;
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= rows.length)
            return;
        const next = rows.slice();
        const [item] = next.splice(index, 1);
        next.splice(nextIndex, 0, item);
        setRows(next.map((row, sort) => ({ ...row, sort })));
    };
    const clearFresh = () => {
        setFreshName('');
        setFreshBlurb('');
        setFreshPhoto(defaultCategoryPhoto);
        setCreating(false);
    };
    const create = () => {
        if (!freshName.trim()) {
            setError('Le nom de la catégorie est nécessaire.');
            return;
        }
        const created = {
            id: pieceId(freshName, (rows ?? []).map((row) => row.id)),
            name: freshName.trim(),
            blurb: freshBlurb.trim(),
            art: defaultCategoryArt,
            photo: freshPhoto || defaultCategoryPhoto,
            sort: rows?.length ?? 0,
        };
        setRows((current) => [...(current ?? []), created]);
        clearFresh();
        setError('');
    };
    const formStarted = creating && Boolean(freshName.trim() || freshBlurb.trim() || freshPhoto !== defaultCategoryPhoto);
    const diff = useMemo(() => {
        if (!rows)
            return { count: 0 };
        const savedById = new Map(saved.map((row) => [row.id, row]));
        const currentIds = new Set(rows.map((row) => row.id));
        const removed = saved.filter((row) => !currentIds.has(row.id));
        let body = 0;
        let order = false;
        for (const row of rows) {
            const prev = savedById.get(row.id);
            if (!prev) {
                body += 1;
                continue;
            }
            if (prev.name !== row.name || prev.blurb !== row.blurb || prev.photo !== row.photo)
                body += 1;
            else if (prev.sort !== row.sort)
                order = true;
        }
        return { count: body + removed.length + (order ? 1 : 0) };
    }, [rows, saved]);
    const changeCount = diff.count + (formStarted ? 1 : 0);
    const saveCategories = async () => {
        if (!rows)
            return null;
        if (formStarted && !freshName.trim())
            return 'Le nom de la catégorie est nécessaire.';
        let next = rows;
        if (formStarted && freshName.trim()) {
            next = [
                ...rows,
                {
                    id: pieceId(freshName, rows.map((row) => row.id)),
                    name: freshName.trim(),
                    blurb: freshBlurb.trim(),
                    art: defaultCategoryArt,
                    photo: freshPhoto || defaultCategoryPhoto,
                    sort: rows.length,
                },
            ];
        }
        const removed = savedRef.current.filter((row) => !next.some((item) => item.id === row.id)).map((row) => row.id);
        for (const id of removed) {
            if (await inUse(id)) {
                return 'Une catégorie contient encore des pièces. Déplacez-les avant de la supprimer.';
            }
        }
        const result = await persistCategories(next, removed);
        if (!result.ok)
            return 'Les catégories n’ont pas pu être enregistrées.';
        const clean = next.map((row, sort) => ({ ...row, sort }));
        setRows(clean);
        setSaved(clean.map((row) => ({ ...row })));
        setTableReady(result.table);
        clearFresh();
        setError('');
        return null;
    };
    const discardCategories = () => {
        const baseline = savedRef.current.map((row) => ({ ...row }));
        setRows(baseline);
        setCategoryList(baseline);
        clearFresh();
        setError('');
        setPendingDelete(null);
    };
    useChangeReport('categories', 'Catégories', changeCount > 0, changeCount, saveCategories, discardCategories);
    if (!rows)
        return _jsx("p", { className: "note", children: "Ouverture des cat\u00E9gories\u2026" });
    return (_jsxs("div", { className: "stack", children: [_jsx("p", { className: "note", children: "Ces cat\u00E9gories deviennent les tuiles de la boutique. Une cat\u00E9gorie qui contient encore des pi\u00E8ces ne peut pas \u00EAtre supprim\u00E9e : d\u00E9placez d\u2019abord ses pi\u00E8ces." }), !tableReady && (_jsx("p", { className: "note", children: "Elles sont gard\u00E9es sur cet appareil en attendant la base Supabase." })), error && _jsx("p", { className: "form-error", children: error }), !tableReady && _jsx(VitrineColumns, {}), !creating ? (_jsxs("button", { className: "new-piece", type: "button", onClick: () => setCreating(true), children: [_jsx("span", { className: "new-piece-plus", "aria-hidden": "true", children: "+" }), _jsxs("span", { children: [_jsx("strong", { children: "Nouvelle cat\u00E9gorie" }), _jsx("small", { children: "Elle appara\u00EEt dans la boutique" })] })] })) : (_jsxs("article", { className: "piece-edit is-new is-plain", children: [_jsx("p", { className: "new-kicker", children: "Nouvelle cat\u00E9gorie" }), _jsxs("div", { className: "fields", children: [_jsxs("label", { children: ["Nom", _jsx("input", { value: freshName, onChange: (event) => setFreshName(event.target.value) })] }), _jsxs("label", { children: ["Description", _jsx("textarea", { value: freshBlurb, onChange: (event) => setFreshBlurb(event.target.value) })] }), _jsx(CategoryPhoto, { photo: freshPhoto, onPick: setFreshPhoto, onError: () => setError('Cette image n’a pas pu être lue.') }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { className: "solid", type: "button", onClick: create, children: "Ajouter" }), _jsx("button", { className: "ghost-ink", type: "button", onClick: clearFresh, children: "Annuler" })] })] })] })), rows.map((row, index) => {
                const count = usage?.filter((id) => id === row.id).length;
                return (_jsx("article", { className: "piece-edit is-plain", children: _jsxs("div", { className: "fields", children: [_jsxs("label", { children: ["Nom", _jsx("input", { value: row.name, onChange: (event) => update(row.id, { name: event.target.value }) })] }), _jsxs("label", { children: ["Description", _jsx("textarea", { value: row.blurb, onChange: (event) => update(row.id, { blurb: event.target.value }) })] }), _jsx(CategoryPhoto, { photo: row.photo, onPick: (photo) => update(row.id, { photo }), onError: () => setError('Cette image n’a pas pu être lue.') }), _jsx("p", { className: "note", children: count === undefined ? 'Pièces…' : count === 1 ? '1 pièce' : `${count} pièces` }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { className: "ghost-ink", type: "button", onClick: () => move(index, -1), disabled: index === 0, children: "Monter" }), _jsx("button", { className: "ghost-ink", type: "button", onClick: () => move(index, 1), disabled: index === rows.length - 1, children: "Descendre" }), pendingDelete === row.id ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "piece-remove is-sure", type: "button", onClick: () => void remove(row.id), children: "Supprimer" }), _jsx("button", { className: "piece-remove", type: "button", onClick: () => setPendingDelete(null), children: "Annuler" })] })) : (_jsx("button", { className: "piece-remove", type: "button", onClick: () => setPendingDelete(row.id), children: "Supprimer" }))] })] }) }, row.id));
            })] }));
}
function Orders() {
    const [rows, setRows] = useState(null);
    const [savedStatus, setSavedStatus] = useState({});
    const [error, setError] = useState('');
    const savedRef = useRef(savedStatus);
    savedRef.current = savedStatus;
    useEffect(() => {
        if (!supabase)
            return;
        void supabase
            .from('orders')
            .select('id,created_at,lines,total,status')
            .order('created_at', { ascending: false })
            .limit(40)
            .then(({ data, error: readError }) => {
            if (missingTable(readError)) {
                setError('missing');
                setRows([]);
                return;
            }
            if (readError) {
                setError('La lecture des commandes a échoué.');
                setRows([]);
                return;
            }
            const next = (data ?? []);
            setRows(next);
            setSavedStatus(Object.fromEntries(next.map((row) => [row.id, row.status])));
        });
    }, []);
    const setStatus = (id, status) => {
        setError('');
        setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null);
    };
    const dirtyOrders = rows?.filter((row) => savedStatus[row.id] !== row.status) ?? [];
    const saveOrders = async () => {
        if (!rows || !supabase)
            return null;
        const done = {};
        for (const row of rows) {
            if (savedRef.current[row.id] === row.status)
                continue;
            const { error: writeError } = await supabase.from('orders').update({ status: row.status }).eq('id', row.id);
            if (writeError) {
                if (Object.keys(done).length)
                    setSavedStatus((current) => ({ ...current, ...done }));
                return 'Le statut n’a pas été enregistré.';
            }
            done[row.id] = row.status;
        }
        setSavedStatus((current) => ({ ...current, ...done }));
        setError('');
        return null;
    };
    const discardOrders = () => {
        const baseline = savedRef.current;
        setRows((current) => current?.map((row) => ({ ...row, status: baseline[row.id] ?? row.status })) ?? null);
        setError('');
    };
    useChangeReport('orders', 'Commandes', dirtyOrders.length > 0, dirtyOrders.length, saveOrders, discardOrders);
    if (!rows)
        return _jsx("p", { className: "note", children: "Ouverture des commandes\u2026" });
    if (error === 'missing')
        return _jsx(SchemaCard, {});
    return (_jsxs("div", { className: "stack", children: [_jsx("p", { className: "note", children: "Chaque commande WhatsApp laisse une copie ici. Le paiement reste hors du site." }), error && _jsx("p", { className: "form-error", children: error }), rows.length === 0 && _jsx("p", { className: "note", children: "Aucune commande pour le moment." }), rows.map((row) => (_jsxs("article", { className: "order-card", children: [_jsxs("div", { className: "order-top", children: [_jsxs("div", { children: [_jsxs("h2", { children: [row.total, " DH"] }), _jsxs("p", { children: [new Date(row.created_at).toLocaleString('fr-MA', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            }), savedStatus[row.id] !== row.status ? ' · non enregistrée' : ''] })] }), _jsx("select", { value: row.status, onChange: (event) => setStatus(row.id, event.target.value), children: orderStatuses.map((status) => (_jsx("option", { value: status.id, children: status.name }, status.id))) })] }), _jsx("ul", { children: (Array.isArray(row.lines) ? row.lines : []).map((line, index) => (_jsxs("li", { children: [_jsxs("span", { children: [line.name, " \u00D7 ", line.qty] }), _jsxs("span", { children: [line.qty * line.price, " DH"] })] }, `${row.id}-${index}`))) })] }, row.id)))] }));
}
function Themes() {
    const [current, setCurrent] = useState('maison');
    const [savedTheme, setSavedTheme] = useState('maison');
    const [error, setError] = useState('');
    const savedRef = useRef(savedTheme);
    const touched = useRef(false);
    savedRef.current = savedTheme;
    useEffect(() => {
        if (!supabase)
            return;
        void supabase
            .from('house')
            .select('theme')
            .eq('id', 'maison')
            .maybeSingle()
            .then(({ data, error: readError }) => {
            if (missingTable(readError)) {
                setError('missing');
                return;
            }
            const theme = data && typeof data.theme === 'string' && isTheme(data.theme) ? data.theme : 'maison';
            setSavedTheme(theme);
            if (!touched.current)
                setCurrent(theme);
        });
    }, []);
    const choose = (theme) => {
        touched.current = true;
        setError('');
        setCurrent(theme);
    };
    const themeDirty = current !== savedTheme;
    const saveTheme = async () => {
        if (!supabase || current === savedRef.current)
            return null;
        const { error: writeError } = await supabase.from('house').upsert({ id: 'maison', theme: current });
        if (writeError)
            return missingTable(writeError) ? 'La base n’est pas prête.' : 'Le thème n’a pas été enregistré.';
        setSavedTheme(current);
        setError('');
        return null;
    };
    const discardTheme = () => {
        touched.current = false;
        setCurrent(savedRef.current);
        setError('');
    };
    useChangeReport('themes', 'Saison', themeDirty, themeDirty ? 1 : 0, saveTheme, discardTheme);
    if (error === 'missing')
        return _jsx(SchemaCard, {});
    return (_jsxs("div", { className: "stack", children: [_jsx("p", { className: "note", children: "Chaque saison teinte toute la vitrine : fonds, or, accents et illustration de l\u2019ouverture \u2014 c\u0153urs, lune, soleil, feuilles ou neige. Les pi\u00E8ces, elles, ne changent pas." }), error && _jsx("p", { className: "form-error", children: error }), _jsx("div", { className: "themes", children: themes.map((theme) => (_jsxs("button", { type: "button", className: current === theme.id ? 'theme-card is-on' : 'theme-card', onClick: () => choose(theme.id), children: [_jsxs("span", { children: [_jsx("strong", { children: theme.name }), _jsx("small", { children: theme.note })] }), _jsx("span", { className: `swatch swatch-${theme.id}` })] }, theme.id))) })] }));
}
