import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnv } from '../lib/supabase'
import { isTheme, orderStatuses, themes, type OrderLine, type OrderStatus, type ThemeId } from '../maison/house'
import {
  categoriesMigrationSql,
  fetchCategories,
  persistCategories,
  setCategoryList,
  useCategoryList,
} from '../maison/categoriesDb'
import { defaultCategoryArt, defaultCategoryPhoto, type Category } from '../maison/categories'
import { moments, orderedMoments, type MomentId } from '../maison/moment'
import { pastryFallback, pastryImages } from '../maison/pastries'
import {
  clearPieceMeta,
  pieceCategoryUsage,
  setPieceCategoryUsage,
  usePieceCategoryUsage,
  writePieceMeta,
} from '../maison/pieceMeta'
import { constraintViolation, fetchPieces, missingColumn } from '../maison/piecesDb'
import { adminDrafts } from '../maison/vitrine'
import schemaSql from '../../supabase/schema.sql?raw'
import './admin.css'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600&family=Monsieur+La+Doulaise&family=Outfit:wght@300;400;500&display=swap'

type Panel = 'pieces' | 'orders' | 'categories' | 'themes'

type Draft = {
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

function rowPayload(row: Draft, includeImage: boolean, includeCategory: boolean, includeMoments: boolean) {
  const base: Record<string, unknown> = {
    id: row.id,
    name: row.name.trim(),
    detail: row.detail.trim(),
    price: Math.round(Number(row.price)) || 0,
    signature: row.signature,
    visible: row.visible,
    sort: row.sort,
  }
  if (includeCategory) base.category = row.category
  if (includeImage) base.image_url = row.imageUrl.trim() || null
  if (includeMoments) base.moments = orderedMoments(row.moments)
  return base
}

function sameMoments(a: MomentId[], b: MomentId[]) {
  const left = orderedMoments(a)
  const right = orderedMoments(b)
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function pieceBodyChanged(a: Draft, b: Draft) {
  return (
    a.name !== b.name ||
    a.detail !== b.detail ||
    a.price !== b.price ||
    a.category !== b.category ||
    a.signature !== b.signature ||
    a.visible !== b.visible ||
    a.imageUrl !== b.imageUrl ||
    !sameMoments(a.moments, b.moments)
  )
}

function toggleMoment(current: MomentId[], id: MomentId): MomentId[] {
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  return orderedMoments(next)
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
      <img src="/maison/wordmark-night.png" alt="Maître Chocolatier Bennis" />
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
          <a className="gate-back" href="/">
            Retour
          </a>
          <img className="gate-logo" src="/maison/wordmark.png" alt="Maître Chocolatier Bennis" />
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
        <button type="button" className={panel === 'categories' ? 'is-on' : ''} onClick={() => setPanel('categories')}>
          Catégories
        </button>
        <button type="button" className={panel === 'orders' ? 'is-on' : ''} onClick={() => setPanel('orders')}>
          Commandes
        </button>
        <button type="button" className={panel === 'themes' ? 'is-on' : ''} onClick={() => setPanel('themes')}>
          Saisons
        </button>
      </nav>
      <main className={total > 0 ? 'atelier-main has-changes' : 'atelier-main'}>
        {needsSchema && <SchemaCard />}
        <div hidden={panel !== 'pieces'}>
          <Pieces onReady={onSchema} />
        </div>
        <div hidden={panel !== 'categories'}>
          <CategoriesPanel />
        </div>
        <div hidden={panel !== 'orders'}>
          <Orders />
        </div>
        <div hidden={panel !== 'themes'}>
          <Themes />
        </div>
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

function VitrineColumns() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(categoriesMigrationSql)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <section className="schema-card">
      <h2>Enregistrement dans la base</h2>
      <p>
        Supabase bloque encore l’écriture des pièces. Ouvre SQL Editor, lance ce script, puis clique à nouveau
        sur Enregistrer dans la base.
      </p>
      <pre>{categoriesMigrationSql}</pre>
      <button className="solid" type="button" onClick={copy}>
        {copied ? 'Script copié' : 'Copier le script'}
      </button>
    </section>
  )
}

function MomentField({ value, onChange }: { value: MomentId[]; onChange: (next: MomentId[]) => void }) {
  return (
    <fieldset className="moment-field">
      <legend>Moment de la journée</legend>
      <div className="moment-options">
        {moments.map((moment) => (
          <label key={moment.id} className="moment-option">
            <input
              type="checkbox"
              checked={value.includes(moment.id)}
              onChange={() => onChange(toggleMoment(value, moment.id))}
            />
            <span>{moment.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function CategorySelect({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const list = useCategoryList()
  const options =
    list.some((item) => item.id === value) || !value
      ? list
      : [...list, { id: value, name: value, blurb: '', art: defaultCategoryArt, photo: defaultCategoryPhoto, sort: 999 }]
  return (
    <label>
      Catégorie
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
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
  const categoryList = useCategoryList()
  const [rows, setRows] = useState<Draft[] | null>(null)
  const [saved, setSaved] = useState<Draft[]>([])
  const [persistedIds, setPersistedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('toutes')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [freshName, setFreshName] = useState('')
  const [freshDetail, setFreshDetail] = useState('')
  const [freshPrice, setFreshPrice] = useState('')
  const [freshCategory, setFreshCategory] = useState('patisseries')
  const [freshMoments, setFreshMoments] = useState<MomentId[]>([])
  const [freshImage, setFreshImage] = useState('')
  const [hasImage, setHasImage] = useState(true)
  const [hasCategory, setHasCategory] = useState(true)
  const [hasMoments, setHasMoments] = useState(true)
  const [columnsKnown, setColumnsKnown] = useState(false)
  const [needsConstraint, setNeedsConstraint] = useState(false)
  const savedRef = useRef(saved)
  const persistedRef = useRef(persistedIds)
  savedRef.current = saved
  persistedRef.current = persistedIds

  const load = async () => {
    const result = await fetchPieces()
    const missing = missingTable(result.error)
    const flags = {
      hasCategory: result.hasCategory,
      hasMoments: result.hasMoments,
      failed: Boolean(result.error),
    }
    const built = adminDrafts(result.rows, flags)
    const drafts = built.map(({ persisted: _persisted, ...draft }) => draft)
    if (!result.error) {
      onReady()
      setHasImage(result.hasImage)
      setHasCategory(result.hasCategory)
      setHasMoments(result.hasMoments)
      setColumnsKnown(true)
      setError('')
    } else if (!missing) {
      setError('La lecture des pièces a échoué. La vitrine locale reste affichée.')
    } else {
      setError('')
    }
    setPersistedIds(new Set(built.filter((row) => row.persisted).map((row) => row.id)))
    setRows(drafts)
    setSaved(drafts.map((row) => ({ ...row })))
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    setPieceCategoryUsage(rows?.map((row) => row.category) ?? null)
  }, [rows])

  useEffect(() => () => setPieceCategoryUsage(null), [])

  useEffect(() => {
    if (categoryFilter !== 'toutes' && !categoryList.some((item) => item.id === categoryFilter)) {
      setCategoryFilter('toutes')
    }
  }, [categoryFilter, categoryList])

  const update = (id: string, patch: Partial<Draft>) => {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null)
  }

  const rememberFields = (drafts: Draft[], categoryStored: boolean, momentsStored: boolean) => {
    for (const row of drafts) {
      if (categoryStored) clearPieceMeta(row.id, { category: true })
      else writePieceMeta(row.id, { category: row.category })
      if (momentsStored) clearPieceMeta(row.id, { moments: true })
      else writePieceMeta(row.id, { moments: orderedMoments(row.moments) })
    }
  }

  const push = async (drafts: Draft[]) => {
    const client = supabase
    if (!client) return { status: 'failed' as const, message: 'La connexion à la base est absente.' }
    if (drafts.length === 0) return { status: 'saved' as const }
    const session = await client.auth.getSession()
    if (!session.data.session) {
      return { status: 'failed' as const, message: 'La session a expiré. Reconnecte-toi, puis réessaie.' }
    }
    let image = true
    let category = true
    let moment = true
    let lastMessage = 'Les pièces n’ont pas pu être enregistrées dans la base.'
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const result = await client.from('pieces').upsert(drafts.map((row) => rowPayload(row, image, category, moment)))
      if (!result.error) {
        rememberFields(drafts, category, moment)
        setHasImage(image)
        setHasCategory(category)
        setHasMoments(moment)
        setColumnsKnown(true)
        return { status: image ? ('saved' as const) : ('photo' as const) }
      }
      if (result.error.code === '42501') {
        setNeedsConstraint(true)
        setColumnsKnown(true)
        return {
          status: 'failed' as const,
          message:
            'La base refuse l’enregistrement. Lance le script ci-dessous dans Supabase, puis réessaie.',
        }
      }
      if (category && (missingColumn(result.error, 'category') || constraintViolation(result.error))) {
        if (constraintViolation(result.error)) setNeedsConstraint(true)
        category = false
        continue
      }
      if (moment && missingColumn(result.error, 'moments')) {
        moment = false
        setHasMoments(false)
        setColumnsKnown(true)
        continue
      }
      if (image && missingColumn(result.error, 'image_url')) {
        image = false
        setHasImage(false)
        setColumnsKnown(true)
        continue
      }
      lastMessage = result.error.message || lastMessage
      return { status: 'failed' as const, message: lastMessage }
    }
    return { status: 'failed' as const, message: lastMessage }
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
    setFreshCategory('patisseries')
    setFreshMoments([])
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
      category: freshCategory,
      signature: false,
      visible: true,
      sort: rows?.length ?? 0,
      imageUrl: freshImage,
      moments: freshMoments,
    }
    setRows((current) => [...(current ?? []), created])
    clearFresh()
    setError('')
    setOpenId(id)
  }

  const formStarted =
    creating && Boolean(freshName.trim() || freshDetail.trim() || freshPrice.trim() || freshImage || freshMoments.length)
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
      category: freshCategory,
      signature: false,
      visible: true,
      sort: rows?.length ?? 0,
      imageUrl: freshImage,
      moments: freshMoments,
    }
  }

  const savePieces = async () => {
    if (!rows || !supabase) return null
    const extra = pendingForm()
    if (extra === 'invalid') return 'Le nom et le prix sont nécessaires.'
    const touchedIds = new Set(diff.touched.map((row) => row.id))
    const unpersisted = rows.filter((row) => !persistedRef.current.has(row.id) && !touchedIds.has(row.id))
    const batch = extra ? [...diff.touched, ...unpersisted, extra] : [...diff.touched, ...unpersisted]
    for (const row of batch) {
      const price = Math.round(Number(row.price))
      if (!row.name.trim() || !Number.isFinite(price) || price < 0) return 'Le nom et le prix sont nécessaires.'
    }
    if (batch.length) {
      const result = await push(batch.map(cleanDraft))
      if (result.status === 'failed') return result.message ?? 'L’enregistrement a échoué.'
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
    setPersistedIds(new Set(next.map((row) => row.id)))
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

  const keepInBase = async () => {
    if (!rows) return
    const pending = rows.filter((row) => !persistedIds.has(row.id))
    const result = await push(pending.map(cleanDraft))
    if (result.status === 'failed') {
      setError(result.message ?? 'Les pièces n’ont pas pu être enregistrées dans la base.')
      return
    }
    setPersistedIds(new Set(rows.map((row) => row.id)))
    setSaved(rows.map((row) => ({ ...row })))
    setError('')
  }

  if (!rows) return <p className="note">Ouverture des pièces…</p>

  const needle = fold(query.trim())
  const shown = rows.filter((row) => {
    if (categoryFilter !== 'toutes' && row.category !== categoryFilter) return false
    if (needle && !fold(`${row.name} ${row.detail}`).includes(needle)) return false
    return true
  })
  const unpersistedCount = rows.filter((row) => !persistedIds.has(row.id)).length
  const filterOptions = categoryList.slice()
  for (const row of rows) {
    if (!filterOptions.some((item) => item.id === row.category)) {
      filterOptions.push({
        id: row.category,
        name: row.category,
        blurb: '',
        art: defaultCategoryArt,
        photo: defaultCategoryPhoto,
        sort: 999,
      })
    }
  }

  return (
    <div className="stack">
      {rows.length === 0 && !error && <p className="note">La vitrine est vide.</p>}
      {unpersistedCount > 0 && (
        <section className="schema-card">
          <p>
            {unpersistedCount === 1
              ? 'Une pièce de la boutique n’est pas encore dans la base.'
              : `${unpersistedCount} pièces de la boutique ne sont pas encore dans la base.`}{' '}
            Enregistrez-les pour pouvoir les modifier ensuite.
          </p>
          <button className="solid" type="button" onClick={() => void keepInBase()}>
            Enregistrer dans la base
          </button>
        </section>
      )}
      {error && <p className="form-error">{error}</p>}
      {columnsKnown && !hasImage && <PhotoColumn />}
      {((columnsKnown && (!hasCategory || !hasMoments)) || needsConstraint) && <VitrineColumns />}
      <div className="cat-filter" role="group" aria-label="Filtrer par catégorie">
        <button
          type="button"
          className={categoryFilter === 'toutes' ? 'is-on' : ''}
          onClick={() => setCategoryFilter('toutes')}
        >
          Toutes
        </button>
        {filterOptions.map((category) => (
          <button
            key={category.id}
            type="button"
            className={categoryFilter === category.id ? 'is-on' : ''}
            onClick={() => setCategoryFilter(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
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
            <CategorySelect value={freshCategory} onChange={setFreshCategory} />
            <MomentField value={freshMoments} onChange={setFreshMoments} />
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
      {shown.length === 0 && (needle || categoryFilter !== 'toutes') && (
        <p className="note">Aucune pièce pour ce filtre.</p>
      )}
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
                  {' · '}
                  {filterOptions.find((item) => item.id === row.category)?.name ?? 'Pâtisseries'}
                  {row.moments.length > 0
                    ? ` · ${orderedMoments(row.moments)
                        .map((id) => moments.find((item) => item.id === id)?.label)
                        .filter(Boolean)
                        .join(', ')}`
                    : ''}
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
            <CategorySelect value={row.category} onChange={(category) => update(row.id, { category })} />
            <MomentField value={row.moments} onChange={(next) => update(row.id, { moments: next })} />
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

function CategoryPhoto({
  photo,
  onPick,
  onError,
}: {
  photo: string
  onPick: (photo: string) => void
  onError: () => void
}) {
  return (
    <div className="category-photo">
      <img src={photo || defaultCategoryPhoto} alt="" />
      <label className="file-pick">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            void fileToDataUrl(file).then(onPick).catch(onError)
          }}
        />
        <span>{photo && photo !== defaultCategoryPhoto ? 'Changer la photo' : 'Déposer une photo'}</span>
      </label>
    </div>
  )
}

function CategoriesPanel() {
  const usage = usePieceCategoryUsage()
  const [rows, setRows] = useState<Category[] | null>(null)
  const [saved, setSaved] = useState<Category[]>([])
  const [tableReady, setTableReady] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [freshName, setFreshName] = useState('')
  const [freshBlurb, setFreshBlurb] = useState('')
  const [freshPhoto, setFreshPhoto] = useState(defaultCategoryPhoto)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const savedRef = useRef(saved)
  savedRef.current = saved

  useEffect(() => {
    let cancel = false
    void fetchCategories().then((result) => {
      if (cancel) return
      setTableReady(result.table)
      setRows(result.rows)
      setSaved(result.rows.map((row) => ({ ...row })))
      setCategoryList(result.rows)
    })
    return () => {
      cancel = true
    }
  }, [])

  useEffect(() => {
    if (rows) setCategoryList(rows)
  }, [rows])

  const update = (id: string, patch: Partial<Category>) => {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...patch } : row)) ?? null)
  }

  const inUse = async (id: string) => {
    const live = pieceCategoryUsage()
    if (live) return live.includes(id)
    const result = await fetchPieces()
    return adminDrafts(result.rows, {
      hasCategory: result.hasCategory,
      hasMoments: result.hasMoments,
      failed: Boolean(result.error),
    }).some((row) => row.category === id)
  }

  const remove = async (id: string) => {
    if (await inUse(id)) {
      setPendingDelete(null)
      setError('Cette catégorie contient encore des pièces. Déplacez-les avant de la supprimer.')
      return
    }
    setError('')
    setPendingDelete(null)
    setRows((current) => current?.filter((row) => row.id !== id) ?? null)
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

  const clearFresh = () => {
    setFreshName('')
    setFreshBlurb('')
    setFreshPhoto(defaultCategoryPhoto)
    setCreating(false)
  }

  const create = () => {
    if (!freshName.trim()) {
      setError('Le nom de la catégorie est nécessaire.')
      return
    }
    const created: Category = {
      id: pieceId(freshName, (rows ?? []).map((row) => row.id)),
      name: freshName.trim(),
      blurb: freshBlurb.trim(),
      art: defaultCategoryArt,
      photo: freshPhoto || defaultCategoryPhoto,
      sort: rows?.length ?? 0,
    }
    setRows((current) => [...(current ?? []), created])
    clearFresh()
    setError('')
  }

  const formStarted =
    creating && Boolean(freshName.trim() || freshBlurb.trim() || freshPhoto !== defaultCategoryPhoto)
  const diff = useMemo(() => {
    if (!rows) return { count: 0 }
    const savedById = new Map(saved.map((row) => [row.id, row]))
    const currentIds = new Set(rows.map((row) => row.id))
    const removed = saved.filter((row) => !currentIds.has(row.id))
    let body = 0
    let order = false
    for (const row of rows) {
      const prev = savedById.get(row.id)
      if (!prev) {
        body += 1
        continue
      }
      if (prev.name !== row.name || prev.blurb !== row.blurb || prev.photo !== row.photo) body += 1
      else if (prev.sort !== row.sort) order = true
    }
    return { count: body + removed.length + (order ? 1 : 0) }
  }, [rows, saved])
  const changeCount = diff.count + (formStarted ? 1 : 0)

  const saveCategories = async () => {
    if (!rows) return null
    if (formStarted && !freshName.trim()) return 'Le nom de la catégorie est nécessaire.'
    let next = rows
    if (formStarted && freshName.trim()) {
      next = [
        ...rows,
        {
          id: pieceId(freshName, rows.map((row) => row.id)),
          name: freshName.trim(),
          blurb: freshBlurb.trim(),
          art: defaultCategoryArt,
          photo: freshPhoto || defaultCategoryPhoto,
          sort: rows.length,
        },
      ]
    }
    const removed = savedRef.current.filter((row) => !next.some((item) => item.id === row.id)).map((row) => row.id)
    for (const id of removed) {
      if (await inUse(id)) {
        return 'Une catégorie contient encore des pièces. Déplacez-les avant de la supprimer.'
      }
    }
    const result = await persistCategories(next, removed)
    if (!result.ok) return 'Les catégories n’ont pas pu être enregistrées.'
    const clean = next.map((row, sort) => ({ ...row, sort }))
    setRows(clean)
    setSaved(clean.map((row) => ({ ...row })))
    setTableReady(result.table)
    clearFresh()
    setError('')
    return null
  }

  const discardCategories = () => {
    const baseline = savedRef.current.map((row) => ({ ...row }))
    setRows(baseline)
    setCategoryList(baseline)
    clearFresh()
    setError('')
    setPendingDelete(null)
  }

  useChangeReport('categories', 'Catégories', changeCount > 0, changeCount, saveCategories, discardCategories)

  if (!rows) return <p className="note">Ouverture des catégories…</p>

  return (
    <div className="stack">
      <p className="note">
        Ces catégories deviennent les tuiles de la boutique. Une catégorie qui contient encore des pièces ne peut
        pas être supprimée : déplacez d’abord ses pièces.
      </p>
      {!tableReady && (
        <p className="note">Elles sont gardées sur cet appareil en attendant la base Supabase.</p>
      )}
      {error && <p className="form-error">{error}</p>}
      {!tableReady && <VitrineColumns />}
      {!creating ? (
        <button className="new-piece" type="button" onClick={() => setCreating(true)}>
          <span className="new-piece-plus" aria-hidden="true">
            +
          </span>
          <span>
            <strong>Nouvelle catégorie</strong>
            <small>Elle apparaît dans la boutique</small>
          </span>
        </button>
      ) : (
        <article className="piece-edit is-new is-plain">
          <p className="new-kicker">Nouvelle catégorie</p>
          <div className="fields">
            <label>
              Nom
              <input value={freshName} onChange={(event) => setFreshName(event.target.value)} />
            </label>
            <label>
              Description
              <textarea value={freshBlurb} onChange={(event) => setFreshBlurb(event.target.value)} />
            </label>
            <CategoryPhoto
              photo={freshPhoto}
              onPick={setFreshPhoto}
              onError={() => setError('Cette image n’a pas pu être lue.')}
            />
            <div className="row-actions">
              <button className="solid" type="button" onClick={create}>
                Ajouter
              </button>
              <button className="ghost-ink" type="button" onClick={clearFresh}>
                Annuler
              </button>
            </div>
          </div>
        </article>
      )}
      {rows.map((row, index) => {
        const count = usage?.filter((id) => id === row.id).length
        return (
          <article className="piece-edit is-plain" key={row.id}>
            <div className="fields">
              <label>
                Nom
                <input value={row.name} onChange={(event) => update(row.id, { name: event.target.value })} />
              </label>
              <label>
                Description
                <textarea value={row.blurb} onChange={(event) => update(row.id, { blurb: event.target.value })} />
              </label>
              <CategoryPhoto
                photo={row.photo}
                onPick={(photo) => update(row.id, { photo })}
                onError={() => setError('Cette image n’a pas pu être lue.')}
              />
              <p className="note">
                {count === undefined ? 'Pièces…' : count === 1 ? '1 pièce' : `${count} pièces`}
              </p>
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
                {pendingDelete === row.id ? (
                  <>
                    <button className="piece-remove is-sure" type="button" onClick={() => void remove(row.id)}>
                      Supprimer
                    </button>
                    <button className="piece-remove" type="button" onClick={() => setPendingDelete(null)}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <button className="piece-remove" type="button" onClick={() => setPendingDelete(row.id)}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </article>
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
        Chaque saison teinte toute la vitrine : fonds, or, accents et illustration de l’ouverture — cœurs,
        lune, soleil, feuilles ou neige. Les pièces, elles, ne changent pas.
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
