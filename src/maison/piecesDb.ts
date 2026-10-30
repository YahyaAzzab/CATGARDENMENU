import { supabase } from '../lib/supabase'
import type { MomentId } from './moment'

const attempts: { sql: string; hasImage: boolean; hasCategory: boolean; hasMoments: boolean }[] = [
  {
    sql: 'id,name,detail,price,signature,visible,sort,image_url,category,moments',
    hasImage: true,
    hasCategory: true,
    hasMoments: true,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,category,moments',
    hasImage: false,
    hasCategory: true,
    hasMoments: true,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,image_url,category',
    hasImage: true,
    hasCategory: true,
    hasMoments: false,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,image_url,moments',
    hasImage: true,
    hasCategory: false,
    hasMoments: true,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,image_url',
    hasImage: true,
    hasCategory: false,
    hasMoments: false,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,category',
    hasImage: false,
    hasCategory: true,
    hasMoments: false,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort,moments',
    hasImage: false,
    hasCategory: false,
    hasMoments: true,
  },
  {
    sql: 'id,name,detail,price,signature,visible,sort',
    hasImage: false,
    hasCategory: false,
    hasMoments: false,
  },
]

export type PieceRecord = {
  id: string
  name: string
  detail: string
  price: number
  signature: boolean
  visible: boolean
  sort: number
  image_url?: string | null
  category?: string | null
  moments?: MomentId[] | null
}

type ReadError = { code?: string; message?: string } | null

export function missingColumn(error: ReadError, column: string) {
  if (!error) return false
  const message = error.message ?? ''
  if (!new RegExp(column, 'i').test(message)) return false
  return error.code === '42703' || error.code === 'PGRST204' || /schema cache/i.test(message)
}

export function constraintViolation(error: ReadError) {
  if (!error) return false
  return error.code === '23514' || /check constraint/i.test(error.message ?? '')
}

export function missingImageColumn(error: ReadError) {
  return missingColumn(error, 'image_url')
}

export async function fetchPieces(): Promise<{
  rows: PieceRecord[]
  error: ReadError
  hasImage: boolean
  hasCategory: boolean
  hasMoments: boolean
}> {
  const empty = { rows: [] as PieceRecord[], hasImage: false, hasCategory: false, hasMoments: false }
  if (!supabase) return { ...empty, error: { message: 'offline' } }

  let last: ReadError = null
  for (const attempt of attempts) {
    const result = await supabase.from('pieces').select(attempt.sql).order('sort')
    if (!result.error) {
      return {
        rows: (result.data ?? []) as unknown as PieceRecord[],
        error: null,
        hasImage: attempt.hasImage,
        hasCategory: attempt.hasCategory,
        hasMoments: attempt.hasMoments,
      }
    }
    last = result.error
    const missing =
      missingColumn(result.error, 'moments') ||
      missingColumn(result.error, 'category') ||
      missingColumn(result.error, 'image_url')
    if (!missing) break
  }

  return { ...empty, error: last }
}
