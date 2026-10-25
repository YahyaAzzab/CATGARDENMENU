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
  image_url text
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

alter table public.pieces enable row level security;
alter table public.orders enable row level security;
alter table public.house enable row level security;

grant select on public.pieces to anon, authenticated;
grant insert, update, delete on public.pieces to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
grant select on public.house to anon, authenticated;
grant insert, update on public.house to authenticated;

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

insert into public.pieces (id, name, detail, price, signature, visible, sort) values
  ('san-sebastian-pistache', 'San Sebastian pistache', 'Cheesecake basque à la pistache', 90, true, true, 0),
  ('san-sebastian-chocolat', 'San Sebastian chocolat', 'Cheesecake basque au chocolat', 70, false, true, 1),
  ('tiramisu', 'Tiramisu', 'Tiramisu crémeux au café', 45, false, true, 2),
  ('brookie', 'Brookie', 'Mi-brownie, mi-cookie', 55, false, true, 3),
  ('brownie', 'Brownie', 'Brownie fondant au chocolat', 40, false, true, 4),
  ('tarte-cookies', 'Tarte cookies', 'Tarte cookie géante aux pépites de chocolat', 50, false, true, 5),
  ('croissant-four', 'Croissant au four', 'Croissant doré au four, Nutella et caramel', 48, false, true, 6)
on conflict (id) do nothing;

insert into public.house (id, theme) values ('maison', 'maison')
on conflict (id) do nothing;
