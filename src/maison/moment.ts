/**
 * Les moments de la journée choisissent quelles pièces montent dans le rail
 * « Produits populaires ». L’heure n’est pas affichée aux clients.
 */
export type MomentId = 'matin' | 'midi' | 'gouter' | 'soir' | 'nuit'

export type Moment = {
  id: MomentId
  label: string
}

export const moments: Moment[] = [
  { id: 'matin', label: 'Matin' },
  { id: 'midi', label: 'Midi' },
  { id: 'gouter', label: 'Goûter' },
  { id: 'soir', label: 'Soir' },
  { id: 'nuit', label: 'Nuit' },
]

export function isMoment(value: string): value is MomentId {
  return moments.some((moment) => moment.id === value)
}

export function getMoment(now = new Date()): MomentId {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes >= 5 * 60 && minutes < 11 * 60 + 30) return 'matin'
  if (minutes >= 11 * 60 + 30 && minutes < 15 * 60 + 30) return 'midi'
  if (minutes >= 15 * 60 + 30 && minutes < 18 * 60 + 30) return 'gouter'
  if (minutes >= 18 * 60 + 30 && minutes < 23 * 60) return 'soir'
  return 'nuit'
}

export function momentById(id: MomentId): Moment {
  return moments.find((moment) => moment.id === id) ?? moments[0]
}

export function orderedMoments(ids: MomentId[]): MomentId[] {
  return moments.filter((moment) => ids.includes(moment.id)).map((moment) => moment.id)
}

type Rankable = {
  moments?: MomentId[]
  pull?: number
}

/**
 * Pièces assignées au moment en cours. S’il n’y a encore aucune assignation,
 * le rail retombe sur les pièces les plus demandées.
 */
export function popularFor<T extends Rankable>(items: T[], moment: MomentId, size = 10): T[] {
  const assigned = items.filter((item) => item.moments?.includes(moment))
  const pool = assigned.length > 0 ? assigned : items
  const score = (item: T) => item.pull ?? 60
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, Math.min(size, pool.length))
}
