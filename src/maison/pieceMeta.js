import { useSyncExternalStore } from 'react';
import { isMoment } from './moment';
const STORAGE_KEY = 'mcb.piece-meta';
function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object')
            return {};
        return parsed;
    }
    catch {
        return {};
    }
}
function writeAll(store) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
    catch {
        /* la mémoire de secours n’est pas disponible */
    }
}
export function readPieceMeta(id) {
    const row = readAll()[id];
    if (!row)
        return undefined;
    const rawMoments = row.moments;
    const moments = Array.isArray(rawMoments)
        ? rawMoments.filter((item) => typeof item === 'string' && isMoment(item))
        : undefined;
    const category = typeof row.category === 'string' && row.category.trim() ? row.category.trim() : undefined;
    if (!category && !moments)
        return undefined;
    return { category, moments };
}
export function writePieceMeta(id, patch) {
    const all = readAll();
    const next = { ...(all[id] ?? {}) };
    if (patch.category !== undefined) {
        if (patch.category.trim())
            next.category = patch.category.trim();
        else
            delete next.category;
    }
    if (patch.moments !== undefined)
        next.moments = patch.moments;
    if (!next.category && next.moments === undefined)
        delete all[id];
    else
        all[id] = next;
    writeAll(all);
}
export function clearPieceMeta(id, keys) {
    const all = readAll();
    const current = all[id];
    if (!current)
        return;
    if (keys.category)
        delete current.category;
    if (keys.moments)
        delete current.moments;
    if (!current.category && !current.moments)
        delete all[id];
    else
        all[id] = current;
    writeAll(all);
}
let usage = null;
const usageListeners = new Set();
export function setPieceCategoryUsage(ids) {
    usage = ids;
    usageListeners.forEach((listener) => listener());
}
export function pieceCategoryUsage() {
    return usage;
}
function subscribeUsage(listener) {
    usageListeners.add(listener);
    return () => usageListeners.delete(listener);
}
export function usePieceCategoryUsage() {
    return useSyncExternalStore(subscribeUsage, pieceCategoryUsage, () => null);
}
