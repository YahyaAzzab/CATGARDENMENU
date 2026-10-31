import { supabase } from '../lib/supabase';
export async function rememberOrder(lines, total) {
    if (!supabase || lines.length === 0)
        return;
    const payload = lines.map((line) => ({
        name: line.pastry.name,
        qty: line.qty,
        price: line.pastry.price,
    }));
    await supabase.from('orders').insert({ lines: payload, total, status: 'nouvelle' });
}
