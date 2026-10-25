import pistache from '../assets/items/dessert-san-sebastian-pistache.jpg'
import chocolat from '../assets/items/dessert-san-sebastian-chocolat.jpg'
import tiramisu from '../assets/items/dessert-tiramisu.jpg'
import brookie from '../assets/items/dessert-brookie.jpg'
import brownie from '../assets/items/dessert-brownie.jpg'
import cookies from '../assets/items/dessert-cookies-pie.jpg'
import croissant from '../assets/items/dessert-croissant-four.jpg'

export type Pastry = {
  id: string
  name: string
  detail: string
  price: number
  image: string
  signature?: boolean
  visible?: boolean
  sort?: number
}

export const pastryImages: Record<string, string> = {
  'san-sebastian-pistache': pistache,
  'san-sebastian-chocolat': chocolat,
  tiramisu,
  brookie,
  brownie,
  'tarte-cookies': cookies,
  'croissant-four': croissant,
}

/** Prix de départ de la vitrine, distincts de ceux du café. À confirmer avant l’ouverture. */
export const pastries: Pastry[] = [
  {
    id: 'san-sebastian-pistache',
    name: 'San Sebastian pistache',
    detail: 'Cheesecake basque à la pistache',
    price: 90,
    image: pistache,
    signature: true,
  },
  {
    id: 'san-sebastian-chocolat',
    name: 'San Sebastian chocolat',
    detail: 'Cheesecake basque au chocolat',
    price: 70,
    image: chocolat,
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    detail: 'Tiramisu crémeux au café',
    price: 45,
    image: tiramisu,
  },
  {
    id: 'brookie',
    name: 'Brookie',
    detail: 'Mi-brownie, mi-cookie',
    price: 55,
    image: brookie,
  },
  {
    id: 'brownie',
    name: 'Brownie',
    detail: 'Brownie fondant au chocolat',
    price: 40,
    image: brownie,
  },
  {
    id: 'tarte-cookies',
    name: 'Tarte cookies',
    detail: 'Tarte cookie géante aux pépites de chocolat',
    price: 50,
    image: cookies,
  },
  {
    id: 'croissant-four',
    name: 'Croissant au four',
    detail: 'Croissant doré au four, Nutella et caramel',
    price: 48,
    image: croissant,
  },
]

export function formatDh(price: number): string {
  return `${price} DH`
}
