import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isTheme, orderStatuses, themes, type OrderLine, type OrderStatus, type ThemeId } from '../maison/house'
import { pastries, pastryImages } from '../maison/pastries'
import { fetchPieces } from '../maison/piecesDb'
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
          offline
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
  offline: boolean
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
            <p className="form-error">La base n’est pas encore reliée à ce site.</p>
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
  const [fresh, setFresh] = useState(0)

  const leave = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <>
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
      <main className="atelier-main">
        {needsSchema ? (
          <SchemaCard />
        ) : panel === 'pieces' ? (
          <Pieces onReady={onSchema} />
        ) : panel === 'orders' ? (
          <Orders key={fresh} />
        ) : (
          <Themes onChange={() => setFresh((value) => value + 1)} />
        )}
      </main>
    </>
  )
}

function Pieces({ onReady }: { onReady: () => void }) {
  const [rows, setRows] = useState<Draft[] | null>(null)
  const [savedId, setSavedId] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [freshName, setFreshName] = useState('')
  const [freshDetail, setFreshDetail] = useState('')
  const [freshPrice, setFreshPrice] = useState('')
  const [freshImage, setFreshImage] = useState('')
  const [hasImage, setHasImage] = useState(false)

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
    setRows(
      result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        detail: row.detail,
        price: String(row.price),
        signature: row.signature,
        visible: row.visible,
        sort: row.sort,
        imageUrl: row.image_url ?? '',
      })),
    )
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

  const save = async (row: Draft) => {
    if (!supabase) return
    const price = Math.round(Number(row.price))
    if (!row.name.trim() || !Number.isFinite(price) || price < 0) {
      setError('Le nom et le prix sont nécessaires.')
      return
    }
    const payload = row.signature
      ? (rows ?? [row]).map((item) =>
          rowPayload(item.id === row.id ? row : { ...item, signature: false }, hasImage),
        )
      : [rowPayload({ ...row, price: String(price) }, hasImage)]
    const { error: writeError } = await supabase.from('pieces').upsert(payload)
    if (writeError) {
      setError('L’enregistrement a échoué.')
      return
    }
    setError('')
    setSavedId(row.id)
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (!rows || !supabase) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= rows.length) return
    const next = rows.slice()
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    const ordered = next.map((row, sort) => ({ ...row, sort }))
    setRows(ordered)
    const { error: writeError } = await supabase.from('pieces').upsert(ordered.map((row) => rowPayload(row, hasImage)))
    if (writeError) setError('L’ordre n’a pas été enregistré.')
  }

  const create = async () => {
    if (!supabase) return
    const price = Math.round(Number(freshPrice))
    if (!freshName.trim() || !freshImage || !Number.isFinite(price) || price < 0) {
      setError('Le nom, le prix et une image sont nécessaires.')
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
    const { error: writeError } = await supabase.from('pieces').insert(rowPayload(created, hasImage))
    if (writeError) {
      setError(missingTable(writeError) ? 'missing' : 'La nouvelle pièce n’a pas pu être ajoutée.')
      return
    }
    setFreshName('')
    setFreshDetail('')
    setFreshPrice('')
    setFreshImage('')
    setCreating(false)
    setError('')
    await load()
  }

  if (!rows) return <p className="note">Ouverture des pièces…</p>
  if (error === 'missing') return <SchemaCard />

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
      {!creating ? (
        <button className="solid" type="button" onClick={() => setCreating(true)}>
          Nouvelle pièce
        </button>
      ) : (
        <article className="piece-edit">
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
            <label>
              Image
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
      {rows.map((row, index) => (
        <article className="piece-edit" key={row.id}>
          <img src={row.imageUrl || pastryImages[row.id]} alt="" />
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
            <div className="checks">
              <label>
                <input
                  type="checkbox"
                  checked={row.signature}
                  onChange={(event) => {
                    const on = event.target.checked
                    setRows(
                      (current) =>
                        current?.map((item) => ({
                          ...item,
                          signature: item.id === row.id ? on : on ? false : item.signature,
                        })) ?? null,
                    )
                  }}
                />
                Populaire — le choix du chef
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={row.visible}
                  onChange={(event) => update(row.id, { visible: event.target.checked })}
                />
                Visible
              </label>
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
              <button className="solid" type="button" onClick={() => save(row)}>
                Enregistrer
              </button>
              {savedId === row.id && <span className="saved">Enregistré</span>}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function Orders() {
  const [rows, setRows] = useState<OrderRow[] | null>(null)
  const [error, setError] = useState('')

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
        setRows((data ?? []) as OrderRow[])
      })
  }, [])

  const setStatus = async (id: string, status: OrderStatus) => {
    if (!supabase) return
    const { error: writeError } = await supabase.from('orders').update({ status }).eq('id', id)
    if (writeError) {
      setError('Le statut n’a pas été enregistré.')
      return
    }
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null)
  }

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

function Themes({ onChange }: { onChange: () => void }) {
  const [current, setCurrent] = useState<ThemeId>('maison')
  const [error, setError] = useState('')

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
        if (data && typeof data.theme === 'string' && isTheme(data.theme)) setCurrent(data.theme)
      })
  }, [])

  const choose = async (theme: ThemeId) => {
    if (!supabase) return
    setCurrent(theme)
    const { error: writeError } = await supabase.from('house').upsert({ id: 'maison', theme })
    if (writeError) {
      setError(missingTable(writeError) ? 'missing' : 'Le thème n’a pas été enregistré.')
      return
    }
    setError('')
    onChange()
  }

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
