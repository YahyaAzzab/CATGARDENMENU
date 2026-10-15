export type Locale = 'fr' | 'en';

export interface Translations {
  // Navigation & General
  appTitle: string;
  appSubtitle: string;
  menuTitle: string;
  allCategories: string;
  currency: string;
  priceFormat: (price: number) => string;
  searchPlaceholder: string;
  noResults: string;
  itemCount: (count: number) => string;

  // Splash
  splashTagline: string;
  tapToSkip: string;

  // Header
  tableGreeting: (table: string) => string;
  welcomeMessage: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;

  // Filters
  filterVegetarian: string;
  filterChocolate: string;
  filterTraditional: string;
  filterSignature: string;
  filterPopular: string;

  // Tags
  tagVegetarian: string;
  tagVegan: string;
  tagChocolate: string;
  tagSpicy: string;
  tagGlutenFree: string;
  tagDairyFree: string;
  tagNutFree: string;
  tagHot: string;
  tagCold: string;
  tagTraditional: string;

  // Badges
  badgeNew: string;
  badgeSignature: string;
  badgePopular: string;

  // Bottom sheet / details
  composition: string;
  optionsLabel: string;
  supplementsLabel: string;
  includedLabel: string;
  closeLabel: string;
  exhausted: string;

  // Misc
  included: string;
  supplement: string;
  unavailable: string;
  servingNote: string;
  options: string;

  // Footer
  followUs: string;
  getDirections: string;
  leaveReview: string;
  contactWhatsApp: string;
  madeWith: string;
}

export const translations: Record<Locale, Translations> = {
  fr: {
    appTitle: "Cat's Garden",
    appSubtitle: 'Le premier café à chats de Fès',
    menuTitle: 'Notre carte',
    allCategories: 'Tout',
    currency: 'DH',
    priceFormat: (price: number) => `${price} DH`,
    searchPlaceholder: 'Rechercher un plat…',
    noResults: 'Aucun résultat trouvé',
    itemCount: (count: number) => `${count} article${count > 1 ? 's' : ''}`,

    splashTagline: 'Café, brunch et douceurs',
    tapToSkip: 'Touchez pour passer',

    tableGreeting: (table: string) => `Table ${table}`,
    welcomeMessage: 'Bienvenue !',

    heroTitle: 'Bienvenue au jardin',
    heroSubtitle: 'Détendez-vous, les chats s\'occupent de l\'ambiance 🌿',

    filterVegetarian: 'Végétarien',
    filterChocolate: 'Chocolat',
    filterTraditional: 'Traditionnel',
    filterSignature: 'Signature',
    filterPopular: 'Populaire',

    tagVegetarian: 'Végétarien',
    tagVegan: 'Végan',
    tagChocolate: 'Chocolat',
    tagSpicy: 'Épicé',
    tagGlutenFree: 'Sans gluten',
    tagDairyFree: 'Sans lactose',
    tagNutFree: 'Sans noix',
    tagHot: 'Chaud',
    tagCold: 'Froid',
    tagTraditional: 'Traditionnel',

    badgeNew: 'Nouveau',
    badgeSignature: 'Signature',
    badgePopular: 'Populaire',

    composition: 'Composition',
    optionsLabel: 'Options au choix',
    supplementsLabel: 'Suppléments',
    includedLabel: 'Inclus dans la formule',
    closeLabel: 'Fermer',
    exhausted: 'Épuisé',

    included: 'Inclus',
    supplement: 'Supplément',
    unavailable: 'Indisponible',
    servingNote: 'Service',
    options: 'Options',

    followUs: 'Suivez-nous',
    getDirections: 'Itinéraire',
    leaveReview: 'Avis Google',
    contactWhatsApp: 'WhatsApp',
    madeWith: 'Créé avec ♥ par',
  },
  en: {
    appTitle: "Cat's Garden",
    appSubtitle: "Fez's first cat café",
    menuTitle: 'Our Menu',
    allCategories: 'All',
    currency: 'MAD',
    priceFormat: (price: number) => `${price} MAD`,
    searchPlaceholder: 'Search a dish…',
    noResults: 'No results found',
    itemCount: (count: number) => `${count} item${count > 1 ? 's' : ''}`,

    splashTagline: 'Coffee, brunch & treats',
    tapToSkip: 'Tap to skip',

    tableGreeting: (table: string) => `Table ${table}`,
    welcomeMessage: 'Welcome!',

    heroTitle: 'Welcome to the garden',
    heroSubtitle: 'Relax, the cats set the mood 🌿',

    filterVegetarian: 'Vegetarian',
    filterChocolate: 'Chocolate',
    filterTraditional: 'Traditional',
    filterSignature: 'Signature',
    filterPopular: 'Popular',

    tagVegetarian: 'Vegetarian',
    tagVegan: 'Vegan',
    tagChocolate: 'Chocolate',
    tagSpicy: 'Spicy',
    tagGlutenFree: 'Gluten-free',
    tagDairyFree: 'Dairy-free',
    tagNutFree: 'Nut-free',
    tagHot: 'Hot',
    tagCold: 'Cold',
    tagTraditional: 'Traditional',

    badgeNew: 'New',
    badgeSignature: 'Signature',
    badgePopular: 'Popular',

    composition: 'What\'s inside',
    optionsLabel: 'Options',
    supplementsLabel: 'Extras',
    includedLabel: 'Included with the formula',
    closeLabel: 'Close',
    exhausted: 'Sold out',

    included: 'Included',
    supplement: 'Extra',
    unavailable: 'Unavailable',
    servingNote: 'Serving',
    options: 'Options',

    followUs: 'Follow us',
    getDirections: 'Directions',
    leaveReview: 'Google Review',
    contactWhatsApp: 'WhatsApp',
    madeWith: 'Made with ♥ by',
  },
};

export function getTagLabel(tag: string, locale: Locale): string {
  const key = `tag${tag.charAt(0).toUpperCase() + tag.slice(1)}` as keyof Translations;
  const t = translations[locale];
  const val = t[key];
  return typeof val === 'string' ? val : tag;
}

export function getBadgeLabel(badge: string, locale: Locale): string {
  const key = `badge${badge.charAt(0).toUpperCase() + badge.slice(1)}` as keyof Translations;
  const t = translations[locale];
  const val = t[key];
  return typeof val === 'string' ? val : badge;
}
