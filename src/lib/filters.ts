import type { MenuItem } from '../data/types';
import type { FilterKey } from '../components/FilterChips';

export function matchesFilters(item: MenuItem, filters: Set<FilterKey>): boolean {
  if (filters.size === 0) return true;
  for (const f of filters) {
    switch (f) {
      case 'vegetarian':
        if (!item.tags.includes('vegetarian')) return false;
        break;
      case 'chocolate':
        if (!item.tags.includes('chocolate')) return false;
        break;
      case 'signature':
        if (!item.badges.includes('signature')) return false;
        break;
      case 'popular':
        if (!item.badges.includes('popular')) return false;
        break;
    }
  }
  return true;
}

export function matchesSearch(item: MenuItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    item.nameFr.toLowerCase().includes(q) ||
    item.nameEn.toLowerCase().includes(q) ||
    (item.descriptionFr?.toLowerCase().includes(q) ?? false) ||
    (item.descriptionEn?.toLowerCase().includes(q) ?? false)
  );
}
