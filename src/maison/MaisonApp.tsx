import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { config } from '../config'
import { PawPrint } from '../components/Icons'
import { CartProvider, orderHref, useCart } from './cart'
import { CatalogProvider, useCatalog } from './catalog'
import { defaultCategoryArt, type Category } from './categories'
import { getMoment, popularFor } from './moment'
import { rememberOrder } from './orders'
import { settle } from './motion'
import { formatDh, type Pastry } from './pastries'
import './maison.css'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Monsieur+La+Doulaise&family=Outfit:wght@300;400;500&display=swap'

type CollectionGroup = { category: Category; items: Pastry[] }

function Drip({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 56" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 1.5C28 14 34 26 34 36.5 34 46.5 27.8 54 20 54S6 46.5 6 36.5C6 26 12 14 20 1.5z"
      />
    </svg>
  )
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Opening({
  reduce,
  onLift,
  onDone,
}: {
  reduce: boolean
  onLift: () => void
  onDone: () => void
}) {
  const [ready, setReady] = useState(false)
  const [lift, setLift] = useState(false)
  const finished = useRef(false)
  const onLiftRef = useRef(onLift)
  const onDoneRef = useRef(onDone)
  onLiftRef.current = onLift
  onDoneRef.current = onDone
  const pace = reduce ? 0.78 : 1
  const at = (seconds: number) => seconds * pace

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onDoneRef.current()
  }

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setReady(true), at(1.55) * 1000),
      window.setTimeout(() => setLift(true), at(2.55) * 1000),
    ]
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [reduce])

  useEffect(() => {
    if (!lift) return
    onLiftRef.current()
    const id = window.setTimeout(finish, at(0.9) * 1000)
    return () => window.clearTimeout(id)
  }, [lift, reduce])

  return (
    <MotionConfig reducedMotion="never">
      <motion.div
        className="opening"
        role="dialog"
        aria-label="Maître Chocolatier Bennis"
        initial={{ y: 0 }}
        animate={lift ? { y: '-100%' } : { y: 0 }}
        transition={lift ? { duration: at(0.95), ease: settle } : { duration: 0 }}
        onAnimationComplete={() => {
          if (lift) finish()
        }}
      >
        <motion.div
          className="opening-mark"
          initial={{ opacity: 1, y: 0 }}
          animate={lift ? { opacity: 0, y: -28 } : { opacity: 1, y: 0 }}
          transition={{ duration: at(0.7), ease: settle }}
        >
          <motion.img
            src="/maison/wordmark.png"
            alt="Maître Chocolatier Bennis"
            initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: at(1.15), ease: settle, delay: at(0.2) }}
          />
        </motion.div>
        <motion.button
          type="button"
          className="opening-enter"
          initial={{ opacity: 0, y: 8 }}
          animate={ready && !lift ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: at(0.45), ease: settle }}
          aria-hidden={!ready || lift}
          style={{ pointerEvents: ready && !lift ? 'auto' : 'none' }}
          onClick={() => setLift(true)}
        >
          Entrer
        </motion.button>
      </motion.div>
    </MotionConfig>
  )
}

function useWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 840px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 840px)')
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

export default function MaisonApp() {
  return (
    <CatalogProvider>
      <link rel="stylesheet" href={FONT_HREF} />
      <CartProvider>
        <House />
      </CartProvider>
    </CatalogProvider>
  )
}

function House() {
  const reduce = useReducedMotion()
  const wide = useWide()
  const { pieces, categories, theme } = useCatalog()
  const { count, cartRef } = useCart()
  const [intro, setIntro] = useState(true)
  const [live, setLive] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pieceId, setPieceId] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const categoryIds = useRef<string[]>([])
  const opener = useRef<HTMLElement | null>(null)
  const pieceWasOpen = useRef(false)
  const piece = pieces.find((item) => item.id === pieceId) ?? null

  const moment = getMoment(now)

  const collections = useMemo<CollectionGroup[]>(() => {
    const known = new Set(categories.map((item) => item.id))
    const extras: Category[] = []
    for (const piece of pieces) {
      if (known.has(piece.category) || extras.some((item) => item.id === piece.category)) continue
      extras.push({
        id: piece.category,
        name: piece.category,
        blurb: '',
        art: defaultCategoryArt,
        photo: piece.image,
        sort: 1000 + extras.length,
      })
    }
    return [...categories, ...extras]
      .sort((a, b) => a.sort - b.sort)
      .map((category) => ({
        category,
        items: pieces
          .filter((item) => item.category === category.id)
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
      }))
  }, [pieces, categories])
  categoryIds.current = collections.map((group) => group.category.id)

  const popular = useMemo(() => popularFor(pieces, moment, 10), [pieces, moment])
  const current = openCat ? collections.find((group) => group.category.id === openCat) ?? null : null

  useEffect(() => {
    document.title = 'Maître Chocolatier Bennis · Fès'
    const theme = document.querySelector('meta[name="theme-color"]')
    const previous = theme?.getAttribute('content')
    theme?.setAttribute('content', '#F6EFE4')
    return () => {
      if (previous) theme?.setAttribute('content', previous)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = intro || piece || cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [intro, piece, cartOpen])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onPop = () => {
      const state = history.state as { mcb?: string; id?: string } | null
      if (state?.mcb === 'piece' && state.id) {
        setPieceId(state.id)
        setCartOpen(false)
        return
      }
      if (state?.mcb === 'cart') {
        setCartOpen(true)
        setPieceId(null)
        return
      }
      if (state?.mcb === 'cat' && state.id) {
        setOpenCat(state.id && categoryIds.current.includes(state.id) ? state.id : null)
        setPieceId(null)
        setCartOpen(false)
        return
      }
      setOpenCat(null)
      setPieceId(null)
      setCartOpen(false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const closeTop = () => {
    const state = history.state as { mcb?: string } | null
    if (state?.mcb) {
      history.back()
      return
    }
    setOpenCat(null)
    setPieceId(null)
    setCartOpen(false)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (pieceId) {
      pieceWasOpen.current = true
      return
    }
    if (pieceWasOpen.current) {
      pieceWasOpen.current = false
      opener.current?.focus()
    }
  }, [pieceId])

  const openPiece = (id: string, source: HTMLElement) => {
    opener.current = source
    setCartOpen(false)
    setPieceId(id)
    history.pushState({ mcb: 'piece', id }, '')
  }

  const openCart = () => {
    setPieceId(null)
    setCartOpen(true)
    history.pushState({ mcb: 'cart' }, '')
  }

  const openCollection = (id: string) => {
    setOpenCat(id)
    setPieceId(null)
    setCartOpen(false)
    history.pushState({ mcb: 'cat', id }, '')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const switchCollection = (id: string) => {
    setOpenCat(id)
    history.replaceState({ mcb: 'cat', id }, '')
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className="maison" data-theme={theme}>
      <header className={scrolled ? 'maison-header is-scrolled' : 'maison-header'}>
        <button type="button" className="brand-link" onClick={goTop} aria-label="Maître Chocolatier Bennis">
          <img src="/maison/wordmark-night.png" alt="" />
        </button>
        <button
          type="button"
          className="cart-button"
          ref={cartRef}
          onClick={openCart}
          aria-label={count > 0 ? `Panier, ${count} pièces` : 'Panier'}
        >
          Panier
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                className="cart-count"
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </header>

      <main>
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div
              key={current.category.id}
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: settle }}
            >
              <CollectionView
                category={current.category}
                items={current.items}
                groups={collections}
                live={live}
                reduce={!!reduce}
                onBack={closeTop}
                onSwitch={switchCollection}
                onOpen={openPiece}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={reduce ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: settle }}
            >
              <Collections
                groups={collections}
                live={live}
                reduce={!!reduce}
                onOpen={openCollection}
              />
              <PopularRail
                items={popular}
                live={live}
                reduce={!!reduce}
                onOpen={openPiece}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="maison-footer">
        <a className="secret-mark" href="/admin">
          <img src="/maison/wordmark.png" alt="Maître Chocolatier Bennis" />
        </a>
        <div className="footer-actions">
          <a href={config.managerInstagramUrl} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            Suivez-nous
          </a>
          <a href={config.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            Itinéraire
          </a>
          <a href={config.googleReviewsUrl} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            Avis Google
          </a>
          <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .2-1.6 0-.4-.1-.9-.2-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.4.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.2.1.4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1.2.1 1.5.7 1.8.8.2.1.4.2.5.3.1.3 0 .8-.2 1.2z" />
            </svg>
            WhatsApp
          </a>
        </div>
        <a className="cat-gate" href="/catgardenmenu">
          <span className="cat-paws" aria-hidden="true">
            <PawPrint size={18} />
            <PawPrint size={14} />
            <PawPrint size={18} />
          </span>
          <span>
            <small>Le café aux chats</small>
            <strong>Cat’s Garden</strong>
          </span>
        </a>
        <p className="footer-credit">
          Cette boutique a été créée par l’équipe{' '}
          <a href="https://bitaqa-project.vercel.app/fr" target="_blank" rel="noopener noreferrer">
            Bitaqa
          </a>
        </p>
      </footer>

      <OrderDock cartOpen={cartOpen} onOpen={openCart} />
      <ToTop hidden={cartOpen || !!pieceId} />

      <AnimatePresence>
        {piece && (
          <Sheet key={piece.id} pastry={piece} wide={wide} onClose={closeTop} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cartOpen && <CartPanel wide={wide} onClose={closeTop} />}
      </AnimatePresence>

      {intro && (
        <Opening reduce={!!reduce} onLift={() => setLive(true)} onDone={() => setIntro(false)} />
      )}
    </div>
  )
}

function Collections({
  groups,
  live,
  reduce,
  onOpen,
}: {
  groups: CollectionGroup[]
  live: boolean
  reduce: boolean
  onOpen: (id: string) => void
}) {
  return (
    <section className="collections" aria-labelledby="collections-title">
      <header className="block-head vitrine-head">
        <h2 id="collections-title">Collections</h2>
      </header>
      <div className="tile-grid">
        {groups.map(({ category, items }, index) => (
          <motion.button
            key={category.id}
            type="button"
            className="tile"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={live ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: settle, delay: reduce ? 0 : index * 0.06 }}
            onClick={() => onOpen(category.id)}
            aria-label={`${category.name} — ${items.length === 1 ? '1 pièce' : `${items.length} pièces`}`}
          >
            <span className="tile-frame">
              <img src={category.photo || items[0]?.image} alt="" loading="lazy" />
            </span>
            <span className="tile-copy">
              <strong>{category.name}</strong>
              <small>{items.length === 1 ? '1 pièce' : `${items.length} pièces`}</small>
            </span>
            <Arrow className="tile-arrow" />
          </motion.button>
        ))}
      </div>
    </section>
  )
}

function PopularRail({
  items,
  live,
  reduce,
  onOpen,
}: {
  items: Pastry[]
  live: boolean
  reduce: boolean
  onOpen: (id: string, source: HTMLElement) => void
}) {
  if (items.length === 0) return null

  return (
    <section className="rail" aria-labelledby="rail-title">
      <header className="block-head">
        <h2 id="rail-title">Produits populaires</h2>
      </header>
      <div className="rail-window">
        <div className="rail-track">
          <RailSet items={items} live={live} reduce={reduce} onOpen={onOpen} />
          {/* Copie du rail : le CSS ne l’affiche que lorsque le défilement continu tourne. */}
          <RailSet items={items} live={live} reduce={reduce} onOpen={onOpen} decorative />
        </div>
      </div>
    </section>
  )
}

function RailSet({
  items,
  live,
  reduce,
  onOpen,
  decorative = false,
}: {
  items: Pastry[]
  live: boolean
  reduce: boolean
  onOpen: (id: string, source: HTMLElement) => void
  decorative?: boolean
}) {
  return (
    <ul className="rail-set" aria-hidden={decorative ? true : undefined}>
      {items.map((pastry, index) => (
        <li key={pastry.id}>
          <RailCard
            pastry={pastry}
            live={live}
            reduce={reduce}
            delay={index * 0.05}
            decorative={decorative}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  )
}

function RailCard({
  pastry,
  live,
  reduce,
  delay,
  decorative,
  onOpen,
}: {
  pastry: Pastry
  live: boolean
  reduce: boolean
  delay: number
  decorative: boolean
  onOpen: (id: string, source: HTMLElement) => void
}) {
  const motionProps = {
    initial: reduce ? (false as const) : { opacity: 0, y: 18 },
    animate: live ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: reduce ? 0 : 0.65, ease: settle, delay: reduce ? 0 : delay },
  }

  return (
    <motion.article className={decorative ? 'rail-card is-decorative' : 'rail-card'} {...motionProps}>
      <button
        type="button"
        className="rail-hit"
        disabled={decorative}
        tabIndex={decorative ? -1 : undefined}
        aria-label={`${pastry.name}, ${formatDh(pastry.price)}`}
        onClick={(event) => onOpen(pastry.id, event.currentTarget)}
      >
        <span className="rail-thumb">
          <img src={pastry.image} alt="" loading="lazy" />
        </span>
        <span className="rail-copy">
          <strong>{pastry.name}</strong>
          <small>{pastry.detail}</small>
        </span>
      </button>
      <span className="rail-foot">
        <span className="price">{formatDh(pastry.price)}</span>
        <RailAdd pastry={pastry} inert={decorative} />
      </span>
    </motion.article>
  )
}

function RailAdd({ pastry, inert }: { pastry: Pastry; inert: boolean }) {
  const { add } = useCart()
  if (inert) {
    return <span className="round-add is-inert">+</span>
  }
  return (
    <button
      type="button"
      className="round-add"
      aria-label={`Ajouter ${pastry.name} au panier`}
      onClick={(event) => {
        event.stopPropagation()
        add(pastry, 1, event.currentTarget.getBoundingClientRect())
      }}
    >
      +
    </button>
  )
}

function CollectionView({
  category,
  items,
  groups,
  live,
  reduce,
  onBack,
  onSwitch,
  onOpen,
}: {
  category: Category
  items: Pastry[]
  groups: CollectionGroup[]
  live: boolean
  reduce: boolean
  onBack: () => void
  onSwitch: (id: string) => void
  onOpen: (id: string, source: HTMLElement) => void
}) {
  return (
    <section className="collection">
      <header className="collection-head">
        <div className="collection-photo">
          <img src={category.photo} alt="" />
        </div>
        <div className="collection-copy">
          <button type="button" className="back-link" onClick={onBack}>
            <Arrow className="back-arrow" />
            Toutes les collections
          </button>
          <p className="eyebrow">Collection</p>
          <h2>{category.name}</h2>
          <p className="collection-blurb">{category.blurb}</p>
          <p className="collection-count">
            {items.length === 1 ? '1 pièce' : `${items.length} pièces`} · commande sur WhatsApp
          </p>
        </div>
      </header>

      <nav className="cat-switch" aria-label="Collections">
        {groups.map((group) => (
          <button
            key={group.category.id}
            type="button"
            className={group.category.id === category.id ? 'collection-pill is-active' : 'collection-pill'}
            aria-current={group.category.id === category.id ? 'true' : undefined}
            onClick={() => onSwitch(group.category.id)}
          >
            <img src={group.category.art} alt="" />
            <span>{group.category.name}</span>
          </button>
        ))}
      </nav>

      <div className="piece-grid">
        {items.length === 0 && <p className="empty">Aucune pièce dans cette collection.</p>}
        {items.map((pastry, index) => (
          <PieceCard
            key={pastry.id}
            pastry={pastry}
            live={live}
            reduce={reduce}
            delay={index * 0.04}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  )
}

function PieceCard({
  pastry,
  live,
  reduce,
  delay,
  onOpen,
}: {
  pastry: Pastry
  live: boolean
  reduce: boolean
  delay: number
  onOpen: (id: string, source: HTMLElement) => void
}) {
  const { add } = useCart()

  return (
    <motion.article
      className="piece-card"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={live ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: settle, delay: reduce ? 0 : delay }}
    >
      <button
        type="button"
        className="piece-hit"
        aria-label={`${pastry.name}, ${formatDh(pastry.price)}`}
        onClick={(event) => onOpen(pastry.id, event.currentTarget)}
      >
        <span className="piece-frame">
          <img src={pastry.image} alt="" loading="lazy" />
          {pastry.signature && <span className="piece-tag">Signature</span>}
        </span>
        <span className="piece-copy">
          <strong>{pastry.name}</strong>
          <small>{pastry.detail}</small>
        </span>
      </button>
      <div className="piece-buy">
        <span className="price">{formatDh(pastry.price)}</span>
        <button
          type="button"
          className="round-add"
          aria-label={`Ajouter ${pastry.name} au panier`}
          onClick={(event) => add(pastry, 1, event.currentTarget.getBoundingClientRect())}
        >
          +
        </button>
      </div>
    </motion.article>
  )
}

function Sheet({
  pastry,
  wide,
  onClose,
}: {
  pastry: Pastry
  wide: boolean
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const { categories } = useCatalog()
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const categoryName = categories.find((item) => item.id === pastry.category)?.name ?? 'La maison'
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const travel = reduce
    ? { duration: 0.01 }
    : wide
      ? { duration: 0.48, ease: settle }
      : { duration: 0.55, ease: settle }

  return (
    <Overlay onClose={onClose}>
      <motion.article
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="piece-title"
        initial={wide ? { opacity: 0, y: 28 } : { y: '100%' }}
        animate={wide ? { opacity: 1, y: 0 } : { y: 0 }}
        exit={wide ? { opacity: 0, y: 18 } : { y: '100%' }}
        transition={travel}
      >
        <div className="sheet-photo">
          <motion.img
            src={pastry.image}
            alt=""
            initial={reduce ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: settle }}
          />
        </div>
        <div className="sheet-body">
          <div className="sheet-top">
            <Drip className="sheet-drip" />
            <button ref={closeRef} type="button" className="text-button" onClick={onClose}>
              Fermer
            </button>
          </div>
          <p className="eyebrow">{pastry.signature ? 'Signature' : categoryName}</p>
          <h2 id="piece-title">{pastry.name}</h2>
          <p className="detail">{pastry.detail}</p>
          <p className="price">{formatDh(pastry.price)}</p>
          <div className="sheet-actions">
            <Stepper qty={qty} onChange={setQty} />
            <button
              type="button"
              className="primary"
              onClick={(event) => add(pastry, qty, event.currentTarget.getBoundingClientRect())}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </motion.article>
    </Overlay>
  )
}

function CartPanel({ wide, onClose }: { wide: boolean; onClose: () => void }) {
  const reduce = useReducedMotion()
  const { lines, total, setQty, clear } = useCart()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const travel = reduce
    ? { duration: 0.01 }
    : wide
      ? { duration: 0.5, ease: settle }
      : { duration: 0.55, ease: settle }

  return (
    <Overlay onClose={onClose} align={wide ? 'end' : 'tray'}>
      <motion.aside
        className="cart"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        initial={wide ? { x: '104%' } : { y: '100%' }}
        animate={wide ? { x: 0 } : { y: 0 }}
        exit={wide ? { x: '104%' } : { y: '100%' }}
        transition={travel}
      >
        <div className="cart-top">
          <h2 id="cart-title">Panier</h2>
          <button ref={closeRef} type="button" className="text-button" onClick={onClose}>
            Fermer
          </button>
        </div>
        {lines.length === 0 ? (
          <p className="empty">Aucune pièce pour le moment.</p>
        ) : (
          <ul className="cart-lines">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.pastry.id}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, ease: settle }}
                >
                  <img className="thumb" src={line.pastry.image} alt="" />
                  <h3>{line.pastry.name}</h3>
                  <span className="line-price">{formatDh(line.qty * line.pastry.price)}</span>
                  <div className="line-actions">
                    <Stepper qty={line.qty} onChange={(qty) => setQty(line.pastry.id, qty)} />
                    <button type="button" className="ghost" onClick={() => setQty(line.pastry.id, 0)}>
                      Retirer
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        <div className="cart-foot">
          <p className="total">
            <span>Total</span>
            <span>{formatDh(total)}</span>
          </p>
          {lines.length > 0 ? (
            <a
              className="primary wide"
              href={orderHref(lines, total)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void rememberOrder(lines, total)
              }}
            >
              Commander sur WhatsApp
            </a>
          ) : (
            <button type="button" className="primary wide" disabled>
              Commander sur WhatsApp
            </button>
          )}
          <p className="fine">Vous confirmez la commande avec le chef. Aucun paiement sur le site.</p>
          {lines.length > 0 && (
            <button type="button" className="ghost" onClick={clear}>
              Vider le panier
            </button>
          )}
        </div>
      </motion.aside>
    </Overlay>
  )
}

function OrderDock({ cartOpen, onOpen }: { cartOpen: boolean; onOpen: () => void }) {
  const reduce = useReducedMotion()
  const { lines, total } = useCart()
  const shown = lines.slice(0, 3)
  const extra = lines.length - shown.length

  return (
    <AnimatePresence>
      {lines.length > 0 && !cartOpen && (
        <motion.button
          type="button"
          className="order-dock"
          aria-label={`Finaliser la commande, ${formatDh(total)}`}
          onClick={onOpen}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: reduce ? 0.12 : 0.4, ease: settle }}
        >
          <span className="dock-copy">
            <small>Votre commande</small>
            <ul>
              {shown.map((line) => (
                <li key={line.pastry.id}>
                  {line.qty > 1 ? `${line.qty} × ${line.pastry.name}` : line.pastry.name}
                </li>
              ))}
            </ul>
            {extra > 0 && <em>{extra > 1 ? `et ${extra} autres` : 'et 1 autre'}</em>}
          </span>
          <span className="dock-total">{formatDh(total)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function ToTop({ hidden }: { hidden: boolean }) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible || hidden) return null

  return (
    <button
      type="button"
      className="to-top"
      aria-label="Remonter en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function Overlay({
  children,
  onClose,
  align = 'tray',
}: {
  children: ReactNode
  onClose: () => void
  align?: 'tray' | 'end'
}) {
  const reduce = useReducedMotion()
  return (
    <>
      <motion.button
        type="button"
        className="scrim"
        aria-label="Fermer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.35 }}
        onClick={onClose}
      />
      <div className={align === 'end' ? 'cart-center' : 'sheet-center'}>{children}</div>
    </>
  )
}

function Stepper({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="stepper" aria-label="Quantité">
      <button type="button" onClick={() => onChange(Math.max(1, qty - 1))} aria-label="Diminuer">
        –
      </button>
      <span>{qty}</span>
      <button type="button" onClick={() => onChange(Math.min(12, qty + 1))} aria-label="Augmenter">
        +
      </button>
    </div>
  )
}
