import { categoryOf } from './categories'
import { isMoment, type MomentId } from './moment'
import { readPieceMeta } from './pieceMeta'
import { pastries, type Pastry } from './pastries'
import type { PieceRecord } from './piecesDb'

const demoById = new Map(pastries.map((item) => [item.id, item]))

export type PieceFlags = {
  hasCategory: boolean
  hasMoments: boolean
  failed: boolean
}

export type VitrineDraft = {
  id: string
  name: string
  detail: string
  price: string
  category: string
  signature: boolean
  visible: boolean
  sort: number
  imageUrl: string
  moments: MomentId[]
  persisted: boolean
}

function asMoments(value: unknown): MomentId[] | null {
  if (!Array.isArray(value)) return null
  return value.filter((item): item is MomentId => typeof item === 'string' && isMoment(item))
}

export function momentsFor(id: string, raw: unknown, columnPresent: boolean): MomentId[] {
  const stored = readPieceMeta(id)?.moments
  if (stored) return stored
  const parsed = asMoments(raw)
  if (columnPresent && parsed) return parsed
  if (parsed && parsed.length > 0) return parsed
  return demoById.get(id)?.moments ?? []
}

export function categoryFor(id: string, raw: string | null | undefined): string {
  const stored = readPieceMeta(id)?.category
  if (stored) return stored
  if (raw?.trim()) return categoryOf(raw)
  return demoById.get(id)?.category ?? 'patisseries'
}

function houseImage(src: string | null | undefined): string {
  const value = src?.trim() ?? ''
  return value.startsWith('/maison/') ? value : ''
}

/** La vitrine distante remplace le catalogue local dès qu’elle est exploitable. */
export function remoteIsVitrine(rows: PieceRecord[], hasCategory: boolean): boolean {
  const visible = rows.filter((row) => row.name?.trim() && row.visible !== false)
  if (visible.length === 0) return false
  if (hasCategory) return true
  const cats = new Set(
    visible.map((row) => demoById.get(row.id)?.category ?? categoryOf(row.category ? String(row.category) : null)),
  )
  return cats.size >= 3
}

function applyMeta(item: Pastry): Pastry {
  const meta = readPieceMeta(item.id)
  if (!meta) return item
  return {
    ...item,
    category: meta.category ?? item.category,
    moments: meta.moments ?? item.moments,
  }
}

export function toPastry(row: PieceRecord, flags: PieceFlags): Pastry | null {
  if (!row.name?.trim()) return null
  const demo = demoById.get(row.id)
  const image = row.image_url?.trim() || demo?.image || '/maison/plate.svg'
  return {
    id: row.id,
    name: row.name.trim(),
    detail: row.detail ?? '',
    price: row.price,
    image,
    category: categoryFor(row.id, row.category ? String(row.category) : null),
    signature: row.signature,
    visible: row.visible,
    sort: row.sort,
    moments: momentsFor(row.id, row.moments, flags.hasMoments),
    pull: demo?.pull,
  }
}

export function pastriesForShop(rows: PieceRecord[], flags: PieceFlags): Pastry[] {
  const local = pastries.filter((item) => item.visible !== false).map(applyMeta)
  if (flags.failed || !remoteIsVitrine(rows, flags.hasCategory)) return local
  return rows
    .map((row) => toPastry(row, flags))
    .filter((item): item is Pastry => item !== null && item.visible !== false)
}

function draftFromPastry(item: Pastry, persisted: boolean): VitrineDraft {
  const meta = applyMeta(item)
  return {
    id: meta.id,
    name: meta.name,
    detail: meta.detail,
    price: String(meta.price),
    category: meta.category,
    signature: Boolean(meta.signature),
    visible: meta.visible !== false,
    sort: meta.sort ?? 0,
    imageUrl: houseImage(meta.image),
    moments: meta.moments ?? [],
    persisted,
  }
}

function draftFromRemote(row: PieceRecord, flags: PieceFlags, persisted: boolean): VitrineDraft {
  const demo = demoById.get(row.id)
  return {
    id: row.id,
    name: row.name?.trim() || demo?.name || '',
    detail: row.detail ?? demo?.detail ?? '',
    price: String(row.price ?? demo?.price ?? 0),
    category: categoryFor(row.id, row.category ? String(row.category) : null),
    signature: Boolean(row.signature),
    visible: row.visible !== false,
    sort: row.sort ?? demo?.sort ?? 0,
    imageUrl: row.image_url?.trim() || houseImage(demo?.image),
    moments: momentsFor(row.id, row.moments, flags.hasMoments),
    persisted,
  }
}

/** Même ensemble que la boutique, plus les pièces masquées déjà en base. */
export function adminDrafts(rows: PieceRecord[], flags: PieceFlags): VitrineDraft[] {
  const remoteById = new Map(rows.map((row) => [row.id, row]))
  if (!flags.failed && remoteIsVitrine(rows, flags.hasCategory)) {
    return rows.filter((row) => row.id).map((row) => draftFromRemote(row, flags, true))
  }

  const local = pastries
    .filter((item) => item.visible !== false)
    .map((item) => {
      const remote = remoteById.get(item.id)
      return remote ? draftFromRemote(remote, flags, true) : draftFromPastry(item, false)
    })
  const seen = new Set(local.map((item) => item.id))
  const extras = rows
    .filter((row) => row.id && row.name?.trim() && !seen.has(row.id))
    .map((row) => draftFromRemote(row, flags, true))
  return [...local, ...extras].sort((a, b) => a.sort - b.sort)
}
