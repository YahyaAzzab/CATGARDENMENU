// ─── Menu Data Types ─────────────────────────────────────────────
// All menu data is strictly typed. No hardcoded strings in components.

export type Tag =
  | 'vegetarian'
  | 'vegan'
  | 'chocolate'
  | 'spicy'
  | 'glutenFree'
  | 'dairyFree'
  | 'nutFree'
  | 'hot'
  | 'cold'
  | 'traditional';

export type Badge = 'new' | 'signature' | 'popular';

export interface IncludedChoice {
  /** e.g. "Boisson chaude au choix" */
  labelFr: string;
  labelEn: string;
  labelAr?: string;
  /** Available options for this choice */
  options: { nameFr: string; nameEn: string; nameAr?: string }[];
}

export interface ItemOption {
  nameFr: string;
  nameEn: string;
  nameAr?: string;
  /** Extra price in DH, 0 if no extra cost */
  extraPrice: number;
}

export interface Supplement {
  nameFr: string;
  nameEn: string;
  nameAr?: string;
  price: number;
}

export interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  /** SVG icon component name or identifier */
  icon: string;
  order: number;
  /** Optional note displayed at the bottom of the category */
  noteFr?: string;
  noteEn?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  /** Price in DH. null means "price to confirm" */
  price: number | null;
  /** Note shown next to price (e.g. "Prix à confirmer") */
  priceNoteFr?: string;
  priceNoteEn?: string;
  /** Serving info (e.g. "Pour 3 personnes") */
  servingNoteFr?: string;
  servingNoteEn?: string;
  options?: ItemOption[];
  /** Choices included in a formula (e.g. brunch includes a hot drink) */
  includedChoices?: IncludedChoice[];
  supplements?: Supplement[];
  tags: Tag[];
  badges: Badge[];
  available: boolean;
  /** Image path (placeholder for now) */
  image?: string;
}
