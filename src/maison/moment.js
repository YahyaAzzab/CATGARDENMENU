export const moments = [
    { id: 'matin', label: 'Matin' },
    { id: 'midi', label: 'Midi' },
    { id: 'gouter', label: 'Goûter' },
    { id: 'soir', label: 'Soir' },
    { id: 'nuit', label: 'Nuit' },
];
export function isMoment(value) {
    return moments.some((moment) => moment.id === value);
}
export function getMoment(now = new Date()) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes >= 5 * 60 && minutes < 11 * 60 + 30)
        return 'matin';
    if (minutes >= 11 * 60 + 30 && minutes < 15 * 60 + 30)
        return 'midi';
    if (minutes >= 15 * 60 + 30 && minutes < 18 * 60 + 30)
        return 'gouter';
    if (minutes >= 18 * 60 + 30 && minutes < 23 * 60)
        return 'soir';
    return 'nuit';
}
export function momentById(id) {
    return moments.find((moment) => moment.id === id) ?? moments[0];
}
export function orderedMoments(ids) {
    return moments.filter((moment) => ids.includes(moment.id)).map((moment) => moment.id);
}
/**
 * Pièces assignées au moment en cours. S’il n’y a encore aucune assignation,
 * le rail retombe sur les pièces les plus demandées.
 */
export function popularFor(items, moment, size = 10) {
    const assigned = items.filter((item) => item.moments?.includes(moment));
    const pool = assigned.length > 0 ? assigned : items;
    const score = (item) => item.pull ?? 60;
    return [...pool].sort((a, b) => score(b) - score(a)).slice(0, Math.min(size, pool.length));
}
