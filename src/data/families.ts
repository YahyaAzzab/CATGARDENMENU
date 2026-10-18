import { categories, menuItems } from './menu';
import type { Category, MenuItem } from './types';

export type FamilyId = 'breakfast' | 'hot-drinks' | 'cold-drinks' | 'sweet' | 'savory';

export interface Family {
  id: FamilyId;
  nameFr: string;
  nameEn: string;
  categoryIds: string[];
  accent: 'peach' | 'sage' | 'rose' | 'cream';
}

export const families: Family[] = [
  {
    id: 'breakfast',
    nameFr: 'Petit-déjeuner & Brunch',
    nameEn: 'Breakfast & Brunch',
    categoryIds: ['brunch', 'a-la-carte'],
    accent: 'peach',
  },
  {
    id: 'hot-drinks',
    nameFr: 'Boissons chaudes',
    nameEn: 'Hot Drinks',
    categoryIds: ['catffee', 'chocomeow', 'miauthe', 'infusions'],
    accent: 'sage',
  },
  {
    id: 'cold-drinks',
    nameFr: 'Boissons froides',
    nameEn: 'Cold Drinks',
    categoryIds: ['jus-smoothies', 'milkshake', 'cocktails', 'sodas-eaux', 'a-partager'],
    accent: 'sage',
  },
  {
    id: 'sweet',
    nameFr: 'Douceurs',
    nameEn: 'Sweets',
    categoryIds: ['pancakes', 'crepes-sucrees', 'gaufres', 'meow-gelato', 'gateaux-desserts'],
    accent: 'rose',
  },
  {
    id: 'savory',
    nameFr: 'Salé',
    nameEn: 'Savory',
    categoryIds: ['pizzas', 'burgers', 'crepes-salees'],
    accent: 'peach',
  },
];

export const FAMILY_IDS: FamilyId[] = families.map((f) => f.id);

/** Pastries currently stored under À la carte — surfaced as their own chip. */
export const VIENNOISERIE_ITEM_IDS = new Set([
  'carte-pain-chocolat',
  'carte-pain-suisse',
  'carte-mini-schneck',
  'carte-sfenj-nutella',
]);

export const DRINK_CATEGORY_IDS = new Set([
  'catffee',
  'chocomeow',
  'miauthe',
  'infusions',
  'jus-smoothies',
  'milkshake',
  'cocktails',
  'sodas-eaux',
]);

export const viennoiseriesCategory: Category = {
  id: 'viennoiseries',
  nameFr: 'Viennoiseries',
  nameEn: 'Pastries',
  icon: 'crepe',
  order: 3,
};

export function getFamilyById(id: string | null | undefined): Family | undefined {
  if (!id) return undefined;
  return families.find((f) => f.id === id);
}

export function isBrunchHours(now = new Date()): boolean {
  return now.getHours() < 14;
}

/** Breakfast first + featured before 14h; otherwise last. */
export function getOrderedFamilies(brunchTime = isBrunchHours()): Family[] {
  const breakfast = families.find((f) => f.id === 'breakfast')!;
  const rest = families.filter((f) => f.id !== 'breakfast');
  return brunchTime ? [breakfast, ...rest] : [...rest, breakfast];
}

export function getFamilyItems(family: Family): MenuItem[] {
  const ids = new Set(family.categoryIds);
  return menuItems.filter((item) => ids.has(item.categoryId));
}

export function getFamilyItemCount(family: Family): number {
  return getFamilyItems(family).length;
}

export interface FamilySection {
  category: Category;
  items: MenuItem[];
}

export function getFamilySections(family: Family): FamilySection[] {
  if (family.id === 'breakfast') {
    const brunch = categories.find((c) => c.id === 'brunch')!;
    const aLaCarte = categories.find((c) => c.id === 'a-la-carte')!;
    const brunchItems = menuItems.filter((i) => i.categoryId === 'brunch');
    const pastryItems = menuItems.filter((i) => VIENNOISERIE_ITEM_IDS.has(i.id));
    const carteItems = menuItems.filter(
      (i) => i.categoryId === 'a-la-carte' && !VIENNOISERIE_ITEM_IDS.has(i.id)
    );
    return [
      { category: brunch, items: brunchItems },
      { category: aLaCarte, items: carteItems },
      { category: viennoiseriesCategory, items: pastryItems },
    ];
  }

  return family.categoryIds
    .map((id) => {
      const category = categories.find((c) => c.id === id);
      if (!category) return null;
      return {
        category,
        items: menuItems.filter((i) => i.categoryId === id),
      };
    })
    .filter((s): s is FamilySection => s !== null);
}

export function isCompactDrinkItem(item: MenuItem): boolean {
  if (!DRINK_CATEGORY_IDS.has(item.categoryId)) return false;
  const desc = item.descriptionFr ?? '';
  return desc.length <= 56;
}
