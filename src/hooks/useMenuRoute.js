import { useCallback, useEffect, useRef, useState } from 'react';
import { FAMILY_IDS } from '../data/families';
function inferDirection(from, to) {
    if (!from || !to)
        return to ? 'forward' : 'back';
    const a = FAMILY_IDS.indexOf(from);
    const b = FAMILY_IDS.indexOf(to);
    if (a === FAMILY_IDS.length - 1 && b === 0)
        return 'next';
    if (b === FAMILY_IDS.length - 1 && a === 0)
        return 'prev';
    return b > a ? 'next' : 'prev';
}
function readTable() {
    return new URLSearchParams(window.location.search).get('table');
}
function readFamily() {
    const raw = new URLSearchParams(window.location.search).get('family');
    if (raw && FAMILY_IDS.includes(raw))
        return raw;
    return null;
}
function buildUrl(family) {
    const params = new URLSearchParams();
    if (family)
        params.set('family', family);
    const table = readTable();
    if (table)
        params.set('table', table);
    const qs = params.toString();
    return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}
export function useMenuRoute() {
    const [familyId, setFamilyId] = useState(() => typeof window === 'undefined' ? null : readFamily());
    const [direction, setDirection] = useState('forward');
    const familyRef = useRef(familyId);
    const [tableNumber] = useState(() => typeof window === 'undefined' ? null : readTable());
    const homeScrollRef = useRef(0);
    useEffect(() => {
        history.scrollRestoration = 'manual';
        const onPop = () => {
            const next = readFamily();
            setDirection(inferDirection(familyRef.current, next));
            familyRef.current = next;
            setFamilyId(next);
            if (!next) {
                requestAnimationFrame(() => {
                    window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
                });
            }
            else {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    const openFamily = useCallback((id) => {
        homeScrollRef.current = window.scrollY;
        history.pushState({ family: id, fromHome: true }, '', buildUrl(id));
        setDirection('forward');
        familyRef.current = id;
        setFamilyId(id);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);
    const goHome = useCallback(() => {
        const state = history.state;
        if (state?.fromHome && window.history.length > 1) {
            history.back();
            return;
        }
        history.replaceState({ family: null }, '', buildUrl(null));
        setDirection('back');
        familyRef.current = null;
        setFamilyId(null);
        requestAnimationFrame(() => {
            window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
        });
    }, []);
    /** Swipe between families: replace URL so Back still returns to Home. */
    const replaceFamily = useCallback((id, dir) => {
        history.replaceState({ family: id, fromHome: true }, '', buildUrl(id));
        setDirection(dir);
        familyRef.current = id;
        setFamilyId(id);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);
    return { familyId, direction, tableNumber, openFamily, goHome, replaceFamily };
}
