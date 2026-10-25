import { supabase } from '../lib/supabase'
import type { CartLine } from './cart'
import type { OrderLine } from './house'

export async function rememberOrder(lines: CartLine[], total: number) {
  if (!supabase || lines.length === 0) return
  const payload: OrderLine[] = lines.map((line) => ({
    name: line.pastry.name,
    qty: line.qty,
    price: line.pastry.price,
  }))
  await supabase.from('orders').insert({ lines: payload, total, status: 'nouvelle' })
}
