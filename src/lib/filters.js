import { arCopy } from '../i18n/arMenu';
export function matchesSearch(item, query) {
    if (!query)
        return true;
    const q = query.toLowerCase().trim();
    if (!q)
        return true;
    const ar = arCopy[item.id];
    return (item.nameFr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        (item.descriptionFr?.toLowerCase().includes(q) ?? false) ||
        (item.descriptionEn?.toLowerCase().includes(q) ?? false) ||
        (ar?.name?.toLowerCase().includes(q) ?? false) ||
        (ar?.description?.toLowerCase().includes(q) ?? false));
}
