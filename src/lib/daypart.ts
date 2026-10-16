import { getItemById } from '../data/menu';
import type { MenuItem } from '../data/types';

export type Daypart = 'breakfast' | 'lunch' | 'gouter' | 'dinner' | 'late';

/** Local café hours: breakfast, lunch, goûter, dinner, then a late menu. */
export function getDaypart(now = new Date()): Daypart {
  const minutes = now.getHours() * 60 + now.getMinutes();
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

export function getSpotlightItems(now = new Date()): MenuItem[] {
  return SPOTLIGHT[getDaypart(now)]
    .map((id) => getItemById(id))
    .filter((item): item is MenuItem => Boolean(item && item.available));
}
