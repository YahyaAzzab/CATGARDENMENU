export type CategoryId = string

export type Category = {
  id: string
  name: string
  blurb: string
  /** Illustration fine, utilisée dans les pastilles de navigation. */
  art: string
  /** Photo représentative, affichée sur les tuiles de l’accueil. */
  photo: string
  sort: number
}

export const defaultCategoryArt = '/maison/categories/patisseries.svg'
export const defaultCategoryPhoto = '/maison/plate.svg'

export const categories: Category[] = [
  {
    id: 'tablettes',
    name: 'Tablettes',
    blurb: 'Grands crus et cacaos d’origine, à croquer ou à offrir.',
    art: '/maison/categories/tablettes.svg',
    photo: '/maison/pieces/tablette-noir.jpg',
    sort: 0,
  },
  {
    id: 'pralines',
    name: 'Pralinés',
    blurb: 'Bouchées fines, ganaches et rochers faits maison.',
    art: '/maison/categories/pralines.svg',
    photo: '/maison/pieces/praline-rocher.jpg',
    sort: 1,
  },
  {
    id: 'patisseries',
    name: 'Pâtisseries',
    blurb: 'Pièces du jour, gourmandes et prêtes à emporter.',
    art: '/maison/categories/patisseries.svg',
    photo: '/maison/pieces/dome-chocolat.jpg',
    sort: 2,
  },
  {
    id: 'entremets',
    name: 'Entremets',
    blurb: 'Créations signature, textures et cacao d’exception.',
    art: '/maison/categories/entremets.svg',
    photo: '/maison/pieces/dome-chocolat.jpg',
    sort: 3,
  },
  {
    id: 'coffrets',
    name: 'Coffrets',
    blurb: 'Assortiments pour offrir, du geste simple au prestige.',
    art: '/maison/categories/coffrets.svg',
    photo: '/maison/pieces/boite-prestige.jpg',
    sort: 4,
  },
]

export function categoryOf(id: string | null | undefined): string {
  const value = id?.trim()
  return value || 'patisseries'
}

export function categoryById(id: string, list: Category[] = categories): Category {
  return list.find((item) => item.id === id) ?? list[0] ?? categories[0]
}

export function normalizeCategory(input: Partial<Category> | null | undefined, index = 0): Category | null {
  if (!input) return null
  const id = String(input.id ?? '').trim()
  const name = String(input.name ?? '').trim()
  if (!id || !name) return null
  const sort = typeof input.sort === 'number' && Number.isFinite(input.sort) ? input.sort : index
  return {
    id,
    name,
    blurb: String(input.blurb ?? '').trim(),
    art: String(input.art ?? '').trim() || defaultCategoryArt,
    photo: String(input.photo ?? '').trim() || defaultCategoryPhoto,
    sort,
  }
}
