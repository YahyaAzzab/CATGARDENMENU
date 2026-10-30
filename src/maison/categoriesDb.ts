import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'
import {
  categories as defaultCategories,
  normalizeCategory,
  type Category,
} from './categories'

const STORAGE_KEY = 'mcb.categories'

type StoredCategories = {
  rows: Category[]
  synced: boolean
}

export const categoriesMigrationSql = `grant insert, update, delete on public.pieces to authenticated;

drop policy if exists "pieces_write" on public.pieces;
create policy "pieces_write" on public.pieces for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

alter table public.pieces add column if not exists moments jsonb;
alter table public.pieces drop constraint if exists pieces_category_check;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  blurb text not null default '',
  art text not null default '',
  photo text not null default '',
  sort integer not null default 0
);

alter table public.categories enable row level security;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select using (true);

drop policy if exists "categories_write" on public.categories;
create policy "categories_write" on public.categories for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

insert into public.categories (id, name, blurb, art, photo, sort) values
  ('tablettes', 'Tablettes', 'Grands crus et cacaos d’origine, à croquer ou à offrir.', '/maison/categories/tablettes.svg', '/maison/pieces/tablette-noir.jpg', 0),
  ('pralines', 'Pralinés', 'Bouchées fines, ganaches et rochers faits maison.', '/maison/categories/pralines.svg', '/maison/pieces/praline-rocher.jpg', 1),
  ('patisseries', 'Pâtisseries', 'Pièces du jour, gourmandes et prêtes à emporter.', '/maison/categories/patisseries.svg', '/maison/pieces/dome-chocolat.jpg', 2),
  ('entremets', 'Entremets', 'Créations signature, textures et cacao d’exception.', '/maison/categories/entremets.svg', '/maison/pieces/dome-chocolat.jpg', 3),
  ('coffrets', 'Coffrets', 'Assortiments pour offrir, du geste simple au prestige.', '/maison/categories/coffrets.svg', '/maison/pieces/boite-prestige.jpg', 4)
on conflict (id) do nothing;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'pieces'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%category%'
  loop
    execute format('alter table public.pieces drop constraint %I', constraint_name);
  end loop;
end $$;`

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === 'PGRST205' || /schema cache/i.test(error.message ?? '') || /does not exist/i.test(error.message ?? '')
}

function readStored(): StoredCategories | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredCategories>
    if (!Array.isArray(parsed.rows)) return null
    const rows = parsed.rows
      .map((row, index) => normalizeCategory(row, index))
      .filter((row): row is Category => row !== null)
      .sort((a, b) => a.sort - b.sort)
    if (rows.length === 0) return null
    return { rows, synced: Boolean(parsed.synced) }
  } catch {
    return null
  }
}

function writeStored(rows: Category[], synced: boolean) {
  try {
    const payload: StoredCategories = { rows, synced }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* navigateur privé : la liste reste en mémoire */
  }
}

let snapshot: Category[] = readStored()?.rows ?? defaultCategories
const listeners = new Set<() => void>()

export function getCategoryList() {
  return snapshot
}

export function setCategoryList(next: Category[]) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCategoryList() {
  return useSyncExternalStore(subscribe, getCategoryList, getCategoryList)
}

export async function fetchCategories(): Promise<{ rows: Category[]; table: boolean; remote: boolean }> {
  const stored = readStored()
  if (!supabase) return { rows: stored?.rows ?? defaultCategories, table: false, remote: false }

  const result = await supabase.from('categories').select('id,name,blurb,art,photo,sort').order('sort')
  if (result.error) {
    return {
      rows: stored?.rows ?? defaultCategories,
      table: !missingTable(result.error),
      remote: false,
    }
  }

  const remoteRows = (result.data ?? [])
    .map((row, index) => normalizeCategory(row as Partial<Category>, index))
    .filter((row): row is Category => row !== null)
    .sort((a, b) => a.sort - b.sort)

  if (remoteRows.length === 0) {
    return { rows: stored?.rows ?? defaultCategories, table: true, remote: false }
  }
  if (stored && !stored.synced) {
    return { rows: stored.rows, table: true, remote: true }
  }
  writeStored(remoteRows, true)
  return { rows: remoteRows, table: true, remote: true }
}

export async function persistCategories(
  rows: Category[],
  removedIds: string[],
): Promise<{ ok: boolean; table: boolean; remote: boolean }> {
  const clean = rows
    .map((row, index) => normalizeCategory({ ...row, sort: index }, index))
    .filter((row): row is Category => row !== null)
  writeStored(clean, false)
  setCategoryList(clean)
  if (!supabase) return { ok: true, table: false, remote: false }

  const saved = await supabase.from('categories').upsert(
    clean.map((row) => ({
      id: row.id,
      name: row.name,
      blurb: row.blurb,
      art: row.art,
      photo: row.photo,
      sort: row.sort,
    })),
  )
  if (saved.error) {
    if (missingTable(saved.error)) return { ok: true, table: false, remote: false }
    return { ok: false, table: true, remote: false }
  }
  if (removedIds.length) {
    const removed = await supabase.from('categories').delete().in('id', removedIds)
    if (removed.error && !missingTable(removed.error)) return { ok: false, table: true, remote: false }
  }
  writeStored(clean, true)
  return { ok: true, table: true, remote: true }
}
