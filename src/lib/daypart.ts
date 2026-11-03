import { getItemById, menuItems } from '../data/menu';
import type { MenuItem } from '../data/types';
import { getMoroccoMinutes } from './moroccoTime';

export type Daypart = 'breakfast' | 'lunch' | 'gouter' | 'dinner' | 'late';

/** Morocco café hours: breakfast, lunch, goûter, dinner, then a late menu. */
export function getDaypart(now = new Date()): Daypart {
  const minutes = getMoroccoMinutes(now);
  if (minutes >= 5 * 60 && minutes < 11 * 60 + 30) return 'breakfast';
  if (minutes >= 11 * 60 + 30 && minutes < 15 * 60 + 30) return 'lunch';
  if (minutes >= 15 * 60 + 30 && minutes < 18 * 60 + 30) return 'gouter';
  if (minutes >= 18 * 60 + 30 && minutes < 23 * 60) return 'dinner';
  return 'late';
}

const SPOTLIGHT: Record<Daypart, string[]> = {
  breakfast: [
    'brunch-meowrocain',
    'brunch-tosty-cat',
    'brunch-croichat',
    'brunch-catchouka',
    'brunch-mato-viennois',
    'carte-sfenj-nutella',
    'catffee-catspresso',
    'catffee-catpurccino',
    'miauthe-marocain',
    'chocomeow-chaud',
  ],
  lunch: [
    'pizza-quatre-fromages',
    'pizza-margherita',
    'pizza-poulet-champignons',
    'burger-catcheese',
    'burger-cats-mix',
    'burger-crispy-chicken',
    'crepe-salee-poulet-champignons',
    'crepe-salee-quatre-fromages',
    'jus-green-detox',
    'jus-limonana',
  ],
  gouter: [
    'pancake-pistache',
    'pancake-cats-garden',
    'pancake-nutella-banane',
    'crepe-kunafa-dubai',
    'crepe-pistache',
    'gaufre-pistache',
    'gelato-3-boules',
    'dessert-san-sebastian-pistache',
    'dessert-chocolat-glace',
    'smoothie-fruits-rouges',
  ],
  dinner: [
    'pizza-quatre-fromages',
    'pizza-fruits-de-mer',
    'burger-cats-mix',
    'burger-crispy-chicken',
    'crepe-salee-fruits-de-mer',
    'cocktail-cats-garden',
    'cocktail-sweet-mango',
    'dessert-san-sebastian-pistache',
    'crepe-kunafa-dubai',
    'gelato-2-boules',
  ],
  late: [
    'chocomeow-fondu',
    'chocomeow-chaud',
    'dessert-tiramisu',
    'dessert-cookies-pie',
    'dessert-brownie',
    'gelato-3-boules',
    'miauthe-verveine',
    'cocktail-cats-garden',
  ],
};

const CATEGORY_DAYPART: Record<string, Daypart> = {
  brunch: 'breakfast',
  'a-la-carte': 'breakfast',
  catffee: 'breakfast',
  chocomeow: 'late',
  miauthe: 'breakfast',
  infusions: 'late',
  'meow-gelato': 'gouter',
  'jus-smoothies': 'lunch',
  pancakes: 'gouter',
  'crepes-sucrees': 'gouter',
  gaufres: 'gouter',
  milkshake: 'gouter',
  cocktails: 'dinner',
  'sodas-eaux': 'lunch',
  'a-partager': 'dinner',
  pizzas: 'dinner',
  burgers: 'dinner',
  'crepes-salees': 'dinner',
  'gateaux-desserts': 'gouter',
};

const CURATED_ITEM_IDS = new Set(Object.values(SPOTLIGHT).flat());

export function getSpotlightItems(now = new Date()): MenuItem[] {
  const daypart = getDaypart(now);
  const scheduledItems = menuItems.filter((item) => {
    if (CURATED_ITEM_IDS.has(item.id)) return false;

    const assignedDaypart = CATEGORY_DAYPART[item.categoryId];
    if (!assignedDaypart) {
      throw new Error(
        `No homepage spotlight time configured for menu item "${item.id}" in category "${item.categoryId}".`
      );
    }

    return assignedDaypart === daypart;
  });

  return [...SPOTLIGHT[daypart].map(getItemById), ...scheduledItems].filter(
    (item): item is MenuItem => Boolean(item && item.available)
  );
}
