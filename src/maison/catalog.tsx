import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { isTheme, type ThemeId } from './house'
import { pastries, pastryImages, type Pastry } from './pastries'
import { fetchPieces } from './piecesDb'

type PieceRow = {
  id: string
  name: string
  detail: string
  price: number
  signature: boolean
  visible: boolean
  sort: number
  image_url?: string | null
}

function toPastry(row: PieceRow): Pastry | null {
  const image = row.image_url?.trim() || pastryImages[row.id]
  if (!image) return null
  return {
    id: row.id,
    name: row.name,
    detail: row.detail,
    price: row.price,
    image,
    signature: row.signature,
    visible: row.visible,
    sort: row.sort,
  }
}

type CatalogValue = {
  pieces: Pastry[]
  theme: ThemeId
  remote: boolean
}

const CatalogContext = createContext<CatalogValue>({
  pieces: pastries,
  theme: 'maison',
  remote: false,
})

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [pieces, setPieces] = useState(pastries)
  const [theme, setTheme] = useState<ThemeId>('maison')
  const [remote, setRemote] = useState(false)

  useEffect(() => {
    const client = supabase
    if (!client) return
    let cancel = false
    const load = async () => {
      const [pieceRes, houseRes] = await Promise.all([
        fetchPieces(),
        client.from('house').select('theme').eq('id', 'maison').maybeSingle(),
      ])
      if (cancel) return
      if (!pieceRes.error && pieceRes.rows.length > 0) {
        const next = pieceRes.rows
          .map(toPastry)
          .filter((item): item is Pastry => item !== null && item.visible !== false)
        if (next.length) {
          setPieces(next)
          setRemote(true)
        }
      }
      const themeValue = houseRes.data?.theme
      if (!houseRes.error && typeof themeValue === 'string' && isTheme(themeValue)) {
        setTheme(themeValue)
      }
    }
    void load()
    return () => {
      cancel = true
    }
  }, [])

  const value = useMemo(() => ({ pieces, theme, remote }), [pieces, theme, remote])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
