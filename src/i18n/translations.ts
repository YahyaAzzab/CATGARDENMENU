export type Locale = 'fr' | 'en' | 'ar';

export interface Translations {
  // Navigation & General
  appTitle: string;
  pageTitle: string;
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
  favoritesTitle: string;
  backHome: string;
  swipeHint: string;

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
  languageLabel: string;
  followUs: string;
  getDirections: string;
  leaveReview: string;
  contactWhatsApp: string;
  madeWith: string;
  footerBy: string;
  footerManager: string;
  menuCredit: string;
}

export const translations: Record<Locale, Translations> = {
  fr: {
    appTitle: "Cat's Garden",
    pageTitle: "Cat's Garden · Menu | Café à chats – Fès",
    appSubtitle: 'Le premier café à chats de Fès',
    menuTitle: 'Notre carte',
    allCategories: 'Tout',
    currency: 'DH',
    priceFormat: (price: number) => `${price} DH`,
    searchPlaceholder: 'Rechercher un plat…',
    noResults: 'Aucun résultat trouvé',
    itemCount: (count: number) => `${count} plat${count > 1 ? 's' : ''}`,

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
    favoritesTitle: 'Coups de cœur',
    backHome: 'Accueil',
    swipeHint: 'Glissez pour changer de famille',

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

    languageLabel: 'Langue',
    followUs: 'Suivez-nous',
    getDirections: 'Itinéraire',
    leaveReview: 'Avis Google',
    contactWhatsApp: 'WhatsApp',
    madeWith: 'Créé avec ♥ par',
    footerBy: "Cat's Garden par",
    footerManager: '@MaitreChocolatierBennis',
    menuCredit: "Ce menu digital a été créé par l'équipe",
  },
  en: {
    appTitle: "Cat's Garden",
    pageTitle: "Cat's Garden · Menu | Cat café in Fez",
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
    favoritesTitle: 'Staff picks',
    backHome: 'Home',
    swipeHint: 'Swipe to see another family',

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

    languageLabel: 'Language',
    followUs: 'Follow us',
    getDirections: 'Directions',
    leaveReview: 'Google Review',
    contactWhatsApp: 'WhatsApp',
    madeWith: 'Made with ♥ by',
    footerBy: "Cat's Garden by",
    footerManager: '@MaitreChocolatierBennis',
    menuCredit: 'This digital menu was created by',
  },
  ar: {
    appTitle: "Cat's Garden",
    pageTitle: "Cat's Garden · القائمة | مقهى قطط في فاس",
    appSubtitle: 'أول مقهى قطط في فاس',
    menuTitle: 'قائمتنا',
    allCategories: 'الكل',
    currency: 'د.م.',
    priceFormat: (price: number) => `${price} د.م.`,
    searchPlaceholder: 'ابحث عن طبق…',
    noResults: 'لا توجد نتائج',
    itemCount: (count: number) =>
      count === 1 ? 'طبق واحد' : count === 2 ? 'طبقان' : count <= 10 ? `${count} أطباق` : `${count} طبقًا`,

    splashTagline: 'قهوة وبرانش وحلويات',
    tapToSkip: 'المس للتخطي',

    tableGreeting: (table: string) => `طاولة ${table}`,
    welcomeMessage: 'أهلاً بك!',

    heroTitle: 'أهلاً بك في الحديقة',
    heroSubtitle: 'استرخِ، فالقطط تُحيي الأجواء 🌿',

    filterVegetarian: 'نباتي',
    filterChocolate: 'شوكولاتة',
    filterTraditional: 'تقليدي',
    filterSignature: 'سيغنيتشر',
    filterPopular: 'الأكثر طلبًا',
    favoritesTitle: 'المفضلات',
    backHome: 'الرئيسية',
    swipeHint: 'اسحب لتغيير القسم',

    tagVegetarian: 'نباتي',
    tagVegan: 'نباتي صرف',
    tagChocolate: 'شوكولاتة',
    tagSpicy: 'حار',
    tagGlutenFree: 'خالٍ من الغلوتين',
    tagDairyFree: 'خالٍ من اللاكتوز',
    tagNutFree: 'خالٍ من المكسرات',
    tagHot: 'ساخن',
    tagCold: 'بارد',
    tagTraditional: 'تقليدي',

    badgeNew: 'جديد',
    badgeSignature: 'سيغنيتشر',
    badgePopular: 'الأكثر طلبًا',

    composition: 'المكونات',
    optionsLabel: 'خيارات',
    supplementsLabel: 'إضافات',
    includedLabel: 'مشمول في العرض',
    closeLabel: 'إغلاق',
    exhausted: 'نفد',

    included: 'مشمول',
    supplement: 'إضافة',
    unavailable: 'غير متوفر',
    servingNote: 'التقديم',
    options: 'خيارات',

    languageLabel: 'اللغة',
    followUs: 'تابعونا',
    getDirections: 'الطريق',
    leaveReview: 'رأي على غوغل',
    contactWhatsApp: 'واتساب',
    madeWith: 'صُنع بـ ♥ من طرف',
    footerBy: "Cat's Garden من طرف",
    footerManager: '@MaitreChocolatierBennis',
    menuCredit: 'أُنشئت هذه القائمة الرقمية من طرف فريق',
  },
};

export function pickLabeled(locale: Locale, row: object, base: 'name' | 'label'): string {
  const suffix = locale === 'en' ? 'En' : locale === 'ar' ? 'Ar' : 'Fr';
  const record = row as Record<string, string | undefined>;
  return record[`${base}${suffix}`] || record[`${base}Fr`] || '';
}

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
