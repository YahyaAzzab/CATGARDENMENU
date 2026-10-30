-- Atelier de Maître Chocolatier Bennis.
-- Supabase → SQL Editor → coller ce script → Run.
-- Ensuite : Authentication → Users → Add user (e-mail et mot de passe).

create table if not exists public.pieces (
  id text primary key,
  name text not null,
  detail text not null default '',
  price integer not null check (price >= 0 and price < 100000),
  signature boolean not null default false,
  visible boolean not null default true,
  sort integer not null default 0,
  image_url text,
  category text not null default 'patisseries',
  moments jsonb
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  blurb text not null default '',
  art text not null default '',
  photo text not null default '',
  sort integer not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lines jsonb not null,
  total integer not null check (total >= 0 and total < 1000000),
  status text not null default 'nouvelle' check (status in ('nouvelle', 'vue', 'remise'))
);

create table if not exists public.house (
  id text primary key,
  theme text not null default 'maison' check (theme in ('maison', 'valentin', 'ramadan', 'ete', 'rentree', 'noel'))
);

alter table public.pieces add column if not exists image_url text;
alter table public.pieces add column if not exists category text;
alter table public.pieces add column if not exists moments jsonb;
update public.pieces set category = 'patisseries' where category is null;
alter table public.pieces alter column category set default 'patisseries';
alter table public.pieces drop constraint if exists pieces_category_check;

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
end $$;

alter table public.pieces enable row level security;
alter table public.orders enable row level security;
alter table public.house enable row level security;
alter table public.categories enable row level security;

grant select on public.pieces to anon, authenticated;
grant insert, update, delete on public.pieces to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
grant select on public.house to anon, authenticated;
grant insert, update on public.house to authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

drop policy if exists "pieces_read" on public.pieces;
create policy "pieces_read" on public.pieces for select using (true);

drop policy if exists "pieces_write" on public.pieces;
create policy "pieces_write" on public.pieces for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "orders_place" on public.orders;
create policy "orders_place" on public.orders for insert
  with check (jsonb_typeof(lines) = 'array');

drop policy if exists "orders_read" on public.orders;
create policy "orders_read" on public.orders for select
  using (auth.uid() is not null);

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "house_read" on public.house;
create policy "house_read" on public.house for select using (true);

drop policy if exists "house_write" on public.house;
create policy "house_write" on public.house for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

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

insert into public.pieces (id, name, detail, price, signature, visible, sort, category) values
  ('tablette-noir-70', 'Tablette noir 70 %', 'Cacao grand cru, torréfaction maison, pureté nette.', 85, false, true, 0, 'tablettes'),
  ('tablette-lait-caramel', 'Tablette lait caramel', 'Lait fin, caramel beurre salé, croquant léger.', 80, false, true, 1, 'tablettes'),
  ('tablette-ambato', 'Tablette Ambato', 'Origine Équateur, notes florales et cacao profond.', 95, false, true, 2, 'tablettes'),
  ('rocher-noisette', 'Rocher praliné noisette', 'Praliné maison, noisette torréfiée, coque fine.', 18, false, true, 10, 'pralines'),
  ('ganache-framboise', 'Ganache framboise', 'Cœur fruité, ganache noire, acidité vive.', 18, false, true, 11, 'pralines'),
  ('praline-pistache', 'Praliné pistache', 'Pistache Sicile, croustillant, équilibre lait-noir.', 20, false, true, 12, 'pralines'),
  ('palet-or', 'Palet or cacao', 'Ganache veloutée, feuille d’or, bouchée signature.', 22, false, true, 13, 'pralines'),
  ('san-sebastian-chocolat', 'San Sebastian chocolat', 'Cheesecake basque au chocolat', 70, false, true, 20, 'patisseries'),
  ('tiramisu', 'Tiramisu', 'Tiramisu crémeux au café', 45, false, true, 21, 'patisseries'),
  ('brookie', 'Brookie', 'Mi-brownie, mi-cookie', 55, false, true, 22, 'patisseries'),
  ('brownie', 'Brownie', 'Brownie fondant au chocolat', 40, false, true, 23, 'patisseries'),
  ('tarte-cookies', 'Cookies', 'Tarte cookie géante aux pépites de chocolat', 50, false, true, 24, 'patisseries'),
  ('croissant-four', 'Croissant au four', 'Croissant doré au four, Nutella et caramel', 48, false, true, 25, 'patisseries'),
  ('san-sebastian-pistache', 'San Sebastian pistache', 'Cheesecake basque à la pistache', 90, true, true, 30, 'entremets'),
  ('dome-chocolat', 'Dôme chocolat noir', 'Mousse intense, croustillant praliné, miroir brillant.', 75, false, true, 31, 'entremets'),
  ('coeur-coulant', 'Cœur coulant', 'Moelleux chaud, cœur cacao fondant.', 55, false, true, 32, 'entremets'),
  ('coffret-decouverte', 'Coffret découverte', '9 bouchées pour découvrir la maison.', 160, false, true, 40, 'coffrets'),
  ('boite-prestige', 'Boîte prestige', '16 pièces d’exception, assortiment du chef.', 280, false, true, 41, 'coffrets'),
  ('assortiment-fes', 'Assortiment Fès', 'Tablette et pralinés, écrin pour offrir.', 220, false, true, 42, 'coffrets')
on conflict (id) do update set
  name = excluded.name,
  detail = excluded.detail,
  price = excluded.price,
  signature = excluded.signature,
  visible = excluded.visible,
  sort = excluded.sort,
  category = excluded.category;

insert into public.house (id, theme) values ('maison', 'maison')
on conflict (id) do nothing;
