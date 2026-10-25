import { supabase } from '../lib/supabase'

const withImage = 'id,name,detail,price,signature,visible,sort,image_url'
const withoutImage = 'id,name,detail,price,signature,visible,sort'

export type PieceRecord = {
  id: string
  name: string
  detail: string
  price: number
  signature: boolean
  visible: boolean
  sort: number
  image_url?: string | null
}

type ReadError = { code?: string; message?: string } | null

function missingImageColumn(error: ReadError) {
  if (!error) return false
  return error.code === '42703' || /image_url/i.test(error.message ?? '')
}

export async function fetchPieces(): Promise<{
  rows: PieceRecord[]
  error: ReadError
  hasImage: boolean
}> {
  if (!supabase) return { rows: [], error: { message: 'offline' }, hasImage: false }
  const full = await supabase.from('pieces').select(withImage).order('sort')
  if (!full.error) {
    return { rows: (full.data ?? []) as PieceRecord[], error: null, hasImage: true }
  }
  if (missingImageColumn(full.error)) {
    const basic = await supabase.from('pieces').select(withoutImage).order('sort')
    return {
      rows: (basic.data ?? []) as PieceRecord[],
      error: basic.error,
      hasImage: false,
    }
  }
  return { rows: [], error: full.error, hasImage: false }
}
