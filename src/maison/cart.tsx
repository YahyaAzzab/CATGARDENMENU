import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { config } from '../config'
import { pour } from './motion'
import { useCatalog } from './catalog'
import { pastries, type Pastry } from './pastries'

const KEY = 'mcb-cart'

export type CartLine = { pastry: Pastry; qty: number }

type Drop = {
  id: number
  x: number
  y: number
  tx: number
  ty: number
}

type CartApi = {
  lines: CartLine[]
  count: number
  total: number
  cartRef: RefObject<HTMLButtonElement | null>
  add: (pastry: Pastry, qty: number, from?: DOMRect) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartApi | null>(null)

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as { id?: string; qty?: number }[]
    if (!Array.isArray(data)) return []
    const lines: CartLine[] = []
    for (const row of data) {
      const pastry = pastries.find((item) => item.id === row.id)
      const qty = Number(row.qty)
      if (!pastry || !Number.isFinite(qty) || qty < 1) continue
      lines.push({ pastry, qty: Math.min(12, Math.round(qty)) })
    }
    return lines
  } catch {
    return []
  }
}

function persist(lines: CartLine[]) {
  localStorage.setItem(
    KEY,
    JSON.stringify(lines.map((line) => ({ id: line.pastry.id, qty: line.qty }))),
  )
}

export function orderText(lines: CartLine[], total: number): string {
  const body = lines
    .map((line) => `${line.pastry.name} × ${line.qty} — ${line.qty * line.pastry.price} DH`)
    .join('\n')
  return `Maître Chocolatier Bennis\n\nBonjour,\n\n${body}\n\nTotal : ${total} DH`
}

export function orderHref(lines: CartLine[], total: number): string {
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(orderText(lines, total))}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const cartRef = useRef<HTMLButtonElement>(null)
  const { pieces } = useCatalog()
  const [lines, setLines] = useState<CartLine[]>(load)
  const [drops, setDrops] = useState<Drop[]>([])
  const dropId = useRef(0)

  useEffect(() => {
    setLines((current) => {
      let changed = false
      const next = current.flatMap((line) => {
        const pastry = pieces.find((item) => item.id === line.pastry.id && item.visible !== false)
        if (!pastry) {
          changed = true
          return []
        }
        if (pastry !== line.pastry) {
          changed = true
          return [{ ...line, pastry }]
        }
        return [line]
      })
      return changed ? next : current
    })
  }, [pieces])

  useEffect(() => {
    persist(lines)
  }, [lines])

  const api = useMemo<CartApi>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0)
    const total = lines.reduce((sum, line) => sum + line.qty * line.pastry.price, 0)
    return {
      lines,
      count,
      total,
      cartRef,
      add: (pastry, qty, from) => {
        const safe = Math.min(12, Math.max(1, Math.round(qty)))
        setLines((current) => {
          const existing = current.find((line) => line.pastry.id === pastry.id)
          if (!existing) return [...current, { pastry, qty: safe }]
          return current.map((line) =>
            line.pastry.id === pastry.id
              ? { ...line, qty: Math.min(12, line.qty + safe) }
              : line,
          )
        })
        const target = cartRef.current?.getBoundingClientRect()
        if (!from || !target || reduce) return
        dropId.current += 1
        setDrops((current) => [
          ...current,
          {
            id: dropId.current,
            x: from.left + from.width / 2,
            y: from.top + from.height / 2,
            tx: target.left + target.width / 2,
            ty: target.top + target.height / 2,
          },
        ])
      },
      setQty: (id, qty) => {
        setLines((current) => {
          if (qty < 1) return current.filter((line) => line.pastry.id !== id)
          return current.map((line) =>
            line.pastry.id === id ? { ...line, qty: Math.min(12, Math.round(qty)) } : line,
          )
        })
      },
      clear: () => setLines([]),
    }
  }, [lines, reduce])

  return (
    <CartContext.Provider value={api}>
      {children}
      <AnimatePresence>
        {drops.map((drop) => (
          <motion.span
            key={drop.id}
            className="gold-drop"
            aria-hidden="true"
            initial={{ x: drop.x, y: drop.y, scale: 1, opacity: 1 }}
            animate={{
              x: [drop.x, (drop.x + drop.tx) / 2, drop.tx],
              y: [drop.y, Math.min(drop.y, drop.ty) - 72, drop.ty],
              scale: [1, 0.8, 0.35],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.72, ease: pour, times: [0, 0.46, 1] }}
            onAnimationComplete={() => setDrops((current) => current.filter((item) => item.id !== drop.id))}
          />
        ))}
      </AnimatePresence>
    </CartContext.Provider>
  )
}

export function useCart(): CartApi {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
