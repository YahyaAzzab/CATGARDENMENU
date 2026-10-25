export const themes = [
  { id: 'maison', name: 'La maison', note: 'Chocolat, crème et or' },
  { id: 'valentin', name: 'Saint-Valentin', note: 'Rose et cacao' },
  { id: 'ramadan', name: 'Ramadan', note: 'Nuit verte et or' },
  { id: 'ete', name: 'Été', note: 'Sable et abricot' },
  { id: 'rentree', name: 'Rentrée', note: 'Encre et ambre' },
  { id: 'noel', name: 'Noël', note: 'Sapin, crème et or' },
] as const

export type ThemeId = (typeof themes)[number]['id']

export function isTheme(value: string): value is ThemeId {
  return themes.some((theme) => theme.id === value)
}

export type OrderLine = { name: string; qty: number; price: number }

export type OrderStatus = 'nouvelle' | 'vue' | 'remise'

export const orderStatuses: { id: OrderStatus; name: string }[] = [
  { id: 'nouvelle', name: 'Nouvelle' },
  { id: 'vue', name: 'Vue' },
  { id: 'remise', name: 'Remise' },
]
