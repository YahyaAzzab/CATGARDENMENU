import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnv } from '../lib/supabase'
import { isTheme, orderStatuses, themes, type OrderLine, type OrderStatus, type ThemeId } from '../maison/house'
import { pastries, pastryFallback, pastryImages } from '../maison/pastries'
import { fetchPieces, missingImageColumn } from '../maison/piecesDb'
import schemaSql from '../../supabase/schema.sql?raw'
import './admin.css'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600&family=Monsieur+La+Doulaise&family=Outfit:wght@300;400;500&display=swap'

type Panel = 'pieces' | 'orders' | 'themes'

type Draft = {
  id: string
  name: string
  detail: string
  price: string
  signature: boolean
  visible: boolean
  sort: number
  imageUrl: string
}

type OrderRow = {
  id: string
  created_at: string
  lines: OrderLine[]
  total: number
  status: OrderStatus
}

type ChangeReport = {
  dirty: boolean
  count: number
  label: string
  save: () => Promise<string | null>
  discard: () => void
}

const ChangeContext = createContext<((id: string, change: ChangeReport) => void) | null>(null)

function useChangeReport(
  id: string,
  label: string,
  dirty: boolean,
  count: number,
  save: () => Promise<string | null>,
  discard: () => void,
) {
  const report = useContext(ChangeContext)
  const saveRef = useRef(save)
  const discardRef = useRef(discard)
  saveRef.current = save
  discardRef.current = discard

  useEffect(() => {
    report?.(id, {
      dirty,
      count,
      label,
      save: () => saveRef.current(),
      discard: () => discardRef.current(),
    })
  }, [report, id, label, dirty, count])
}

function phrase(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} et ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`
}

function pieceId(name: string, taken: string[]) {
  const base =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 42) || 'piece'
  let id = base
  let n = 2
  while (taken.includes(id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}

function rowPayload(row: Draft, includeImage: boolean) {
  const base = {
    id: row.id,
    name: row.name.trim(),
    detail: row.detail.trim(),
    price: Math.round(Number(row.price)) || 0,
    signature: row.signature,
    visible: row.visible,
    sort: row.sort,
  }
  if (!includeImage) return base
  return { ...base, image_url: row.imageUrl.trim() || null }
}

function pieceBodyChanged(a: Draft, b: Draft) {
  return (
    a.name !== b.name ||
    a.detail !== b.detail ||
    a.price !== b.price ||
    a.signature !== b.signature ||
    a.visible !== b.visible ||
    a.imageUrl !== b.imageUrl
  )
}

function diffPieces(saved: Draft[], rows: Draft[] | null) {
  const touched: Draft[] = []
  const removed: Draft[] = []
  const dirtyIds = new Set<string>()
  const freshIds = new Set<string>()
  if (!rows) return { count: 0, touched, removed, dirtyIds, freshIds }
  const savedById = new Map(saved.map((row) => [row.id, row]))
  const currentIds = new Set(rows.map((row) => row.id))
  let bodyCount = 0
  let orderChanged = false
  for (const row of saved) {
    if (!currentIds.has(row.id)) removed.push(row)
  }
  for (const row of rows) {
    const prev = savedById.get(row.id)
    if (!prev) {
      touched.push(row)
      dirtyIds.add(row.id)
      freshIds.add(row.id)
      bodyCount += 1
      continue
    }
    const body = pieceBodyChanged(prev, row)
    const order = prev.sort !== row.sort
    if (!body && !order) continue
    touched.push(row)
    dirtyIds.add(row.id)
    if (body) bodyCount += 1
    else orderChanged = true
  }
  return {
    count: bodyCount + removed.length + (orderChanged ? 1 : 0),
    touched,
    removed,
    dirtyIds,
    freshIds,
  }
}

function cleanDraft(row: Draft): Draft {
  return {
    ...row,
    name: row.name.trim(),
    detail: row.detail.trim(),
    price: String(Math.round(Number(row.price)) || 0),
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('image'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('image'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('image'))
    reader.readAsDataURL(file)
  })
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === 'PGRST205' || /schema cache/i.test(error.message ?? '')
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [needsSchema, setNeedsSchema] = useState(false)

  useEffect(() => {
    document.title = 'Atelier · Maître Chocolatier Bennis'
  }, [])

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    void supabase
      .from('pieces')
      .select('id')
      .limit(1)
      .then(({ error }) => setNeedsSchema(missingTable(error)))
  }, [session])

  return (
    <div className="atelier">
      <link rel="stylesheet" href={FONT_HREF} />
      {!ready ? null : !supabase ? (
        <Gate
          needsSchema={false}
          offline={supabaseEnv.missing === 'key' ? 'key' : 'url'}
          onSession={() => {}}
        />
      ) : session ? (
        <Desk needsSchema={needsSchema} onSchema={() => setNeedsSchema(false)} />
      ) : (
        <Gate needsSchema={needsSchema} offline={false} onSession={setSession} />
      )}
    </div>
  )
}

function Brand() {
  return (
    <a className="atelier-brand" href="/">
      <small>Maître Chocolatier</small>
      <strong>Bennis</strong>
    </a>
  )
}

function Gate({
  needsSchema,
  offline,
  onSession,
}: {
  needsSchema: boolean
  offline: false | 'url' | 'key'
  onSession: (session: Session) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setPending(true)
    setError('')
    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setPending(false)
    if (signError || !data.session) {
      setError('Connexion impossible. Vérifie l’e-mail et le mot de passe.')
      return
    }
    onSession(data.session)
  }

  return (
    <div className="gate">
      <div>
        <section className="gate-card">
          <img className="gate-logo" src="/maison/wordmark.svg" alt="Maître Chocolatier Bennis" />
          <h1>L’atelier</h1>
          <p>Les pièces, les commandes et le thème de la boutique.</p>
          {offline ? (
            <p className="form-error">
              {offline === 'key'
                ? 'L’adresse de la base est en place. La clé publique n’a pas été prise dans ce dépôt : dans Vercel, la variable doit s’appeler VITE_SUPABASE_ANON_KEY, être cochée pour Production, puis un nouveau déploiement est nécessaire.'
                : 'La base n’est pas encore reliée à ce site.'}
            </p>
          ) : (
            <form onSubmit={submit}>
              <label>
                E-mail
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Mot de passe
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="solid" type="submit" disabled={pending}>
                Entrer
              </button>
            </form>
          )}
        </section>
        {needsSchema && <SchemaCard />}
      </div>
    </div>
  )
}

function SchemaCard() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <section className="schema-card">
      <h2>Préparer la base</h2>
      <p>
        Dans Supabase, ouvre SQL Editor, colle ce script, puis lance-le. Crée ensuite un utilisateur dans
        Authentication → Users.
      </p>
      <pre>{schemaSql}</pre>
      <button className="solid" type="button" onClick={copy}>
        {copied ? 'Script copié' : 'Copier le script'}
      </button>
    </section>
  )
}

function Desk({
  needsSchema,
  onSchema,
}: {
  needsSchema: boolean
  onSchema: () => void
}) {
  const [panel, setPanel] = useState<Panel>('pieces')
  const [reports, setReports] = useState<Record<string, { dirty: boolean; count: number; label: string }>>({})
  const [pending, setPending] = useState(false)
  const [saveError, setSaveError] = useState('')
  const actions = useRef(new Map<string, ChangeReport>())

  const report = useCallback((id: string, change: ChangeReport) => {
    actions.current.set(id, change)
    setReports((current) => {
      const prev = current[id]
      if (prev && prev.dirty === change.dirty && prev.count === change.count && prev.label === change.label) return current
      return { ...current, [id]: { dirty: change.dirty, count: change.count, label: change.label } }
    })
  }, [])

  const dirty = Object.values(reports).filter((item) => item.dirty && item.count > 0)
  const total = dirty.reduce((sum, item) => sum + item.count, 0)
  const detail = phrase(dirty.map((item) => item.label))

  useEffect(() => {
    if (total === 0) return
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [total])

  const leave = async () => {
    if (total > 0 && !window.confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?')) return
    await supabase?.auth.signOut()
  }

  const saveAll = async () => {
    setPending(true)
    setSaveError('')
    let message = ''
    for (const change of actions.current.values()) {
      if (!change.dirty || change.count === 0) continue
      const error = await change.save()
      if (error) message = message || error
    }
    setSaveError(message)
    setPending(false)
  }

  const discardAll = () => {
    if (pending) return
    for (const change of actions.current.values()) {
      if (change.dirty && change.count > 0) change.discard()
    }
    setSaveError('')
  }

  return (
    <ChangeContext.Provider value={report}>
      <header className="atelier-bar">
        <Brand />
        <div className="atelier-actions">
          <a href="/">Voir la boutique</a>
          <button type="button" className="quiet" onClick={leave}>
            Quitter
          </button>
        </div>
      </header>
      <nav className="atelier-nav">
        <button type="button" className={panel === 'pieces' ? 'is-on' : ''} onClick={() => setPanel('pieces')}>
          Pièces
        </button>
        <button type="button" className={panel === 'orders' ? 'is-on' : ''} onClick={() => setPanel('orders')}>
          Commandes
        </button>
        <button type="button" className={panel === 'themes' ? 'is-on' : ''} onClick={() => setPanel('themes')}>
          Saisons
        </button>
      </nav>
      <main className={total > 0 ? 'atelier-main has-changes' : 'atelier-main'}>
        {needsSchema ? (
          <SchemaCard />
        ) : (
          <>
            <div hidden={panel !== 'pieces'}>
              <Pieces onReady={onSchema} />
            </div>
            <div hidden={panel !== 'orders'}>
              <Orders />
            </div>
            <div hidden={panel !== 'themes'}>
              <Themes />
            </div>
          </>
        )}
      </main>
      {total > 0 && (
        <div className="save-dock" role="status" aria-live="polite">
          <div className="save-dock-copy">
            <strong>{total === 1 ? '1 modification' : `${total} modifications`}</strong>
            <small>{detail}</small>
            {saveError && <p className="form-error">{saveError}</p>}
          </div>
          <div className="save-dock-actions">
            <button className="ghost-ink" type="button" onClick={discardAll} disabled={pending}>
              Annuler
            </button>
            <button className="solid" type="button" onClick={saveAll} disabled={pending}>
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </ChangeContext.Provider>
  )
}

const photoSql = 'alter table public.pieces add column if not exists image_url text;'

function PhotoColumn() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(photoSql)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <section className="schema-card">
      <h2>Les photos</h2>
      <p>
        Une pièce sans photo enregistrée n’apparaît qu’avec une assiette vide dans la boutique. Dans Supabase,
        ouvre SQL Editor, lance cette ligne, puis redépose la photo et enregistre.
      </p>
      <pre>{photoSql}</pre>
      <button className="solid" type="button" onClick={copy}>
        {copied ? 'Ligne copiée' : 'Copier la ligne'}
      </button>
    </section>
  )
}

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function Choice({
  kind,
  pressed,
  title,
  hint,
  onToggle,
}: {
  kind: 'star' | 'check'
  pressed: boolean
  title: string
  hint: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={pressed ? `choice choice-${kind} is-on` : `choice choice-${kind}`}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <span className="choice-mark" aria-hidden="true">
        {kind === 'star' ? (
          <svg viewBox="0 0 24 24">
            <path d="M12 3.2 14.4 9l6.2.5-4.7 4 1.5 6L12 16.2 6.6 19.5l1.5-6-4.7-4L9.6 9Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5 10 17.5 19 7.5" />
          </svg>
        )}
      </span>
      <span className="choice-copy">
        <strong>{title}</strong>
        <small>{hint}</small>
      </span>
    </button>
  )
}

function Pieces({ onReady }: { onReady: () => void }) {
  const [rows, setRows] = useState<Draft[] | null>(null)
  const [saved, setSaved] = useState<Draft[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [freshName, setFreshName] = useState('')
  const [freshDetail, setFreshDetail] = useState('')
  const [freshPrice, setFreshPrice] = useState('')
  const [freshImage, setFreshImage] = useState('')
  const [hasImage, setHasImage] = useState(false)
  const savedRef = useRef(saved)
  savedRef.current = saved

  const load = async () => {
    const result = await fetchPieces()
    if (missingTable(result.error)) {
      setError('missing')
      setRows([])
      return
    }
    if (result.error) {
      setError('La lecture des pièces a échoué.')
      setRows([])
      return
    }
    onReady()
    setHasImage(result.hasImage)
    setError('')
    const drafts = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      detail: row.detail,
      price: String(row.price),
      signature: row.signature,
      visible: row.visible,
      sort: row.sort,
      imageUrl: row.image_url ?? '',
    }))
    setRows(drafts)
    setSaved(drafts.map((row) => ({ ...row })))
  }

  useEffect(() => {
    void load()
  }, [])

  const seed = async () => {
    if (!supabase) return
    const payload = pastries.map((item, sort) => ({
      id: item.id,
      name: item.name,
      detail: item.detail,
      price: item.price,
      signature: Boolean(item.signature),
      visible: true,
      sort,
    }))
    const { error: writeError } = await supabase.from('pieces').upsert(payload)
    if (writeError) {
      setError(missingTable(writeError) ? 'missing' : 'Les pièces n’ont pas pu être installées.')
      return
    }
    setError('')
    await load()
  }

  const update = (id: string, patch: Partial<Draft>) => {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null)
  }

  const push = async (drafts: Draft[], mode: 'upsert' | 'insert' = 'upsert') => {
    const client = supabase
    if (!client) return 'failed' as const
    const send = (withImage: boolean) => {
      const payload = drafts.map((row) => rowPayload(row, withImage))
      return mode === 'insert' ? client.from('pieces').insert(payload) : client.from('pieces').upsert(payload)
    }
    const first = await send(true)
    if (!first.error) {
      setHasImage(true)
      return 'saved' as const
    }
    if (missingImageColumn(first.error)) {
      const second = await send(false)
      if (second.error) return 'failed' as const
      setHasImage(false)
      return 'photo' as const
    }
    return 'failed' as const
  }

  const move = (index: number, direction: -1 | 1) => {
    if (!rows) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= rows.length) return
    const next = rows.slice()
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    setRows(next.map((row, sort) => ({ ...row, sort })))
  }

  const remove = (id: string) => {
    setError('')
    setPendingDelete(null)
    setOpenId((current) => (current === id ? null : current))
    setRows((current) => current?.filter((row) => row.id !== id) ?? null)
  }

  const clearFresh = () => {
    setFreshName('')
    setFreshDetail('')
    setFreshPrice('')
    setFreshImage('')
    setCreating(false)
  }

  const create = () => {
    const price = Math.round(Number(freshPrice))
    if (!freshName.trim() || !Number.isFinite(price) || price < 0) {
      setError('Le nom et le prix sont nécessaires.')
      return
    }
    const id = pieceId(freshName, (rows ?? []).map((row) => row.id))
    const created: Draft = {
      id,
      name: freshName.trim(),
      detail: freshDetail.trim(),
      price: String(price),
      signature: false,
      visible: true,
      sort: rows?.length ?? 0,
      imageUrl: freshImage,
    }
    setRows((current) => [...(current ?? []), created])
    clearFresh()
    setError('')
    setOpenId(id)
  }

  const formStarted = creating && Boolean(freshName.trim() || freshDetail.trim() || freshPrice.trim() || freshImage)
  const diff = useMemo(() => diffPieces(saved, rows), [saved, rows])
  const changeCount = diff.count + (formStarted ? 1 : 0)

  const pendingForm = (): Draft | 'invalid' | null => {
    if (!formStarted) return null
    const price = Math.round(Number(freshPrice))
    if (!freshName.trim() || !Number.isFinite(price) || price < 0) return 'invalid'
    return {
      id: pieceId(freshName, (rows ?? []).map((row) => row.id)),
      name: freshName.trim(),
      detail: freshDetail.trim(),
      price: String(price),
      signature: false,
      visible: true,
      sort: rows?.length ?? 0,
      imageUrl: freshImage,
    }
  }

  const savePieces = async () => {
    if (!rows || !supabase) return null
    const extra = pendingForm()
    if (extra === 'invalid') return 'Le nom et le prix sont nécessaires.'
    const batch = extra ? [...diff.touched, extra] : diff.touched
    for (const row of batch) {
      const price = Math.round(Number(row.price))
      if (!row.name.trim() || !Number.isFinite(price) || price < 0) return 'Le nom et le prix sont nécessaires.'
    }
    if (batch.length) {
      const result = await push(batch.map(cleanDraft))
      if (result === 'failed') return 'L’enregistrement a échoué.'
    }
    if (diff.removed.length) {
      const { error: writeError } = await supabase.from('pieces').delete().in(
        'id',
        diff.removed.map((row) => row.id),
      )
      if (writeError) return 'Une pièce n’a pas pu être retirée.'
    }
    const next = (extra ? [...rows, extra] : rows).map(cleanDraft)
    setRows(next)
    setSaved(next.map((row) => ({ ...row })))
    clearFresh()
    setError('')
    return null
  }

  const discardPieces = () => {
    setRows(savedRef.current.map((row) => ({ ...row })))
    clearFresh()
    setError('')
    setPendingDelete(null)
  }

  useChangeReport('pieces', 'Pièces', changeCount > 0, changeCount, savePieces, discardPieces)

  if (!rows) return <p className="note">Ouverture des pièces…</p>
  if (error === 'missing') return <SchemaCard />

  const needle = fold(query.trim())
  const shown = needle
    ? rows.filter((row) => fold(`${row.name} ${row.detail}`).includes(needle))
    : rows

  return (
    <div className="stack">
      {rows.length === 0 && !error && (
        <section className="schema-card">
          <p>La vitrine est vide.</p>
          <button className="solid" type="button" onClick={seed}>
            Installer les pièces actuelles
          </button>
        </section>
      )}
      {error && error !== 'missing' && <p className="form-error">{error}</p>}
      {!hasImage && <PhotoColumn />}
      <label className="piece-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.2 15.2 20 20" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Rechercher une pièce"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {!creating ? (
        <button className="new-piece" type="button" onClick={() => setCreating(true)}>
          <span className="new-piece-plus" aria-hidden="true">
            +
          </span>
          <span>
            <strong>Nouvelle pièce</strong>
            <small>Ajouter un gâteau à la vitrine</small>
          </span>
        </button>
      ) : (
        <article className="piece-edit is-new">
          <p className="new-kicker">Nouvelle pièce</p>
          {freshImage ? <img src={freshImage} alt="" /> : <span className="image-wait">Image</span>}
          <div className="fields">
            <label>
              Nom
              <input value={freshName} onChange={(event) => setFreshName(event.target.value)} />
            </label>
            <label>
              Détail
              <textarea value={freshDetail} onChange={(event) => setFreshDetail(event.target.value)} />
            </label>
            <label>
              Prix en DH
              <input inputMode="numeric" value={freshPrice} onChange={(event) => setFreshPrice(event.target.value)} />
            </label>
            <label className="file-pick">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void fileToDataUrl(file)
                    .then(setFreshImage)
                    .catch(() => setError('Cette image n’a pas pu être lue.'))
                }}
              />
              <span>{freshImage ? 'Changer l’image' : 'Choisir une image'}</span>
            </label>
            <label>
              Ou un lien d’image
              <input
                value={freshImage.startsWith('data:') ? '' : freshImage}
                placeholder="https://"
                onChange={(event) => setFreshImage(event.target.value)}
              />
            </label>
            <div className="row-actions">
              <button className="solid" type="button" onClick={create}>
                Ajouter
              </button>
              <button className="ghost-ink" type="button" onClick={() => setCreating(false)}>
                Annuler
              </button>
            </div>
          </div>
        </article>
      )}
      {needle && shown.length === 0 && <p className="note">Aucune pièce pour cette recherche.</p>}
      {shown.map((row) => {
        const index = rows.findIndex((item) => item.id === row.id)
        const thumb = row.imageUrl || pastryImages[row.id] || pastryFallback
        const open = openId === row.id
        return (
        <div className={open ? 'piece-block is-open' : 'piece-block'} key={row.id}>
          <div className="piece-row">
            <button className="piece-open" type="button" onClick={() => setOpenId(open ? null : row.id)}>
              <img src={thumb} alt="" />
              <span>
                <strong>{row.name || 'Sans nom'}</strong>
                <small>
                  {row.price || '0'} DH
                  {row.signature ? ' · Populaire' : ''}
                  {row.visible ? '' : ' · Masquée'}
                  {!row.imageUrl && !pastryImages[row.id] ? ' · Sans photo' : ''}
                  {diff.freshIds.has(row.id) ? ' · nouvelle' : diff.dirtyIds.has(row.id) ? ' · modifiée' : ''}
                </small>
              </span>
            </button>
            {pendingDelete === row.id ? (
              <span className="piece-confirm">
                <button className="piece-remove is-sure" type="button" onClick={() => remove(row.id)}>
                  Retirer
                </button>
                <button className="piece-remove" type="button" onClick={() => setPendingDelete(null)}>
                  Annuler
                </button>
              </span>
            ) : (
              <button className="piece-remove" type="button" onClick={() => setPendingDelete(row.id)}>
                Retirer
              </button>
            )}
          </div>
          {open && (
        <article className="piece-edit">
          <img src={thumb} alt="" />
          <div className="fields">
            <label>
              Nom
              <input value={row.name} onChange={(event) => update(row.id, { name: event.target.value })} />
            </label>
            <label>
              Détail
              <textarea value={row.detail} onChange={(event) => update(row.id, { detail: event.target.value })} />
            </label>
            <label>
              Prix en DH
              <input
                inputMode="numeric"
                value={row.price}
                onChange={(event) => update(row.id, { price: event.target.value })}
              />
            </label>
            <label className="file-pick">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void fileToDataUrl(file)
                    .then((imageUrl) => update(row.id, { imageUrl }))
                    .catch(() => setError('Cette image n’a pas pu être lue.'))
                }}
              />
              <span>{row.imageUrl ? 'Changer la photo' : 'Déposer une photo'}</span>
            </label>
            <div className="choices">
              <Choice
                kind="star"
                pressed={row.signature}
                title="Populaire"
                hint={row.signature ? 'En haut de la boutique' : 'Le choix du chef'}
                onToggle={() => {
                  const on = !row.signature
                  setRows(
                    (current) =>
                      current?.map((item) => ({
                        ...item,
                        signature: item.id === row.id ? on : on ? false : item.signature,
                      })) ?? null,
                  )
                }}
              />
              <Choice
                kind="check"
                pressed={row.visible}
                title="Visible"
                hint={row.visible ? 'Dans la boutique' : 'Hors de la vitrine'}
                onToggle={() => update(row.id, { visible: !row.visible })}
              />
            </div>
            <div className="row-actions">
              <button className="ghost-ink" type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                Monter
              </button>
              <button
                className="ghost-ink"
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
              >
                Descendre
              </button>
            </div>
          </div>
        </article>
          )}
        </div>
        )
      })}
    </div>
  )
}

function Orders() {
  const [rows, setRows] = useState<OrderRow[] | null>(null)
  const [savedStatus, setSavedStatus] = useState<Record<string, OrderStatus>>({})
  const [error, setError] = useState('')
  const savedRef = useRef(savedStatus)
  savedRef.current = savedStatus

  useEffect(() => {
    if (!supabase) return
    void supabase
      .from('orders')
      .select('id,created_at,lines,total,status')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data, error: readError }) => {
        if (missingTable(readError)) {
          setError('missing')
          setRows([])
          return
        }
        if (readError) {
          setError('La lecture des commandes a échoué.')
          setRows([])
          return
        }
        const next = (data ?? []) as OrderRow[]
        setRows(next)
        setSavedStatus(Object.fromEntries(next.map((row) => [row.id, row.status])))
      })
  }, [])

  const setStatus = (id: string, status: OrderStatus) => {
    setError('')
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null)
  }

  const dirtyOrders = rows?.filter((row) => savedStatus[row.id] !== row.status) ?? []

  const saveOrders = async () => {
    if (!rows || !supabase) return null
    const done: Record<string, OrderStatus> = {}
    for (const row of rows) {
      if (savedRef.current[row.id] === row.status) continue
      const { error: writeError } = await supabase.from('orders').update({ status: row.status }).eq('id', row.id)
      if (writeError) {
        if (Object.keys(done).length) setSavedStatus((current) => ({ ...current, ...done }))
        return 'Le statut n’a pas été enregistré.'
      }
      done[row.id] = row.status
    }
    setSavedStatus((current) => ({ ...current, ...done }))
    setError('')
    return null
  }

  const discardOrders = () => {
    const baseline = savedRef.current
    setRows((current) => current?.map((row) => ({ ...row, status: baseline[row.id] ?? row.status })) ?? null)
    setError('')
  }

  useChangeReport('orders', 'Commandes', dirtyOrders.length > 0, dirtyOrders.length, saveOrders, discardOrders)

  if (!rows) return <p className="note">Ouverture des commandes…</p>
  if (error === 'missing') return <SchemaCard />

  return (
    <div className="stack">
      <p className="note">Chaque commande WhatsApp laisse une copie ici. Le paiement reste hors du site.</p>
      {error && <p className="form-error">{error}</p>}
      {rows.length === 0 && <p className="note">Aucune commande pour le moment.</p>}
      {rows.map((row) => (
        <article className="order-card" key={row.id}>
          <div className="order-top">
            <div>
              <h2>{row.total} DH</h2>
              <p>
                {new Date(row.created_at).toLocaleString('fr-MA', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
                {savedStatus[row.id] !== row.status ? ' · non enregistrée' : ''}
              </p>
            </div>
            <select
              value={row.status}
              onChange={(event) => setStatus(row.id, event.target.value as OrderStatus)}
            >
              {orderStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <ul>
            {(Array.isArray(row.lines) ? row.lines : []).map((line, index) => (
              <li key={`${row.id}-${index}`}>
                <span>
                  {line.name} × {line.qty}
                </span>
                <span>{line.qty * line.price} DH</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function Themes() {
  const [current, setCurrent] = useState<ThemeId>('maison')
  const [savedTheme, setSavedTheme] = useState<ThemeId>('maison')
  const [error, setError] = useState('')
  const savedRef = useRef(savedTheme)
  const touched = useRef(false)
  savedRef.current = savedTheme

  useEffect(() => {
    if (!supabase) return
    void supabase
      .from('house')
      .select('theme')
      .eq('id', 'maison')
      .maybeSingle()
      .then(({ data, error: readError }) => {
        if (missingTable(readError)) {
          setError('missing')
          return
        }
        const theme = data && typeof data.theme === 'string' && isTheme(data.theme) ? data.theme : 'maison'
        setSavedTheme(theme)
        if (!touched.current) setCurrent(theme)
      })
  }, [])

  const choose = (theme: ThemeId) => {
    touched.current = true
    setError('')
    setCurrent(theme)
  }

  const themeDirty = current !== savedTheme

  const saveTheme = async () => {
    if (!supabase || current === savedRef.current) return null
    const { error: writeError } = await supabase.from('house').upsert({ id: 'maison', theme: current })
    if (writeError) return missingTable(writeError) ? 'La base n’est pas prête.' : 'Le thème n’a pas été enregistré.'
    setSavedTheme(current)
    setError('')
    return null
  }

  const discardTheme = () => {
    touched.current = false
    setCurrent(savedRef.current)
    setError('')
  }

  useChangeReport('themes', 'Saison', themeDirty, themeDirty ? 1 : 0, saveTheme, discardTheme)

  if (error === 'missing') return <SchemaCard />

  return (
    <div className="stack">
      <p className="note">
        Chaque saison pose une illustration en fond du produit populaire : cœurs, lune, soleil, feuilles ou
        neige. Elle reste derrière le nom et le prix. Les pièces ne changent pas.
      </p>
      {error && <p className="form-error">{error}</p>}
      <div className="themes">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={current === theme.id ? 'theme-card is-on' : 'theme-card'}
            onClick={() => choose(theme.id)}
          >
            <span>
              <strong>{theme.name}</strong>
              <small>{theme.note}</small>
            </span>
            <span className={`swatch swatch-${theme.id}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
